# «Пользики» на сервере (Docker + traefik)

Сервис и база поднимаются из корневого `docker-compose.yml`, устроенного как в Jurassic. Один файл на
локалку и VPS, а что поднимать, решает `.env` рядом с ним (`COMPOSE_PROFILES`). Команды одни и те же,
без `--env-file` и `-f`.

| Профиль | Где | Что поднимается | Доступ |
|---|---|---|---|
| `local` | машина разработчика | `app`, `studio` + база | http://localhost:3000, Studio http://localhost:54323 — только с этой машины |
| `vps` | сервер | `app-vps` + база | https://polziki.lz.media через traefik (сеть `web`) |

База: `db` (Postgres, образ `supabase/postgres`) и `rest` (PostgREST, через него ходит сервис).

**Что открыто наружу на сервере — только сервис по домену через traefik.** Ни один контейнер не
публикует порты на хост. База и PostgREST доступны только изнутри compose, их нет даже в сети `web`.
Админки базы (Studio) на сервере нет. Домен и сертификат выдаёт traefik по меткам контейнера
(entrypoint `websecure`, certresolver `myresolver`), nginx и ручная настройка прокси не нужны.

Имя экземпляра — `COMPOSE_PROJECT_NAME` из `.env` (по умолчанию `polziks`). От него имя контейнера
сервиса `polziks-app`, томов и роутера traefik.

## Первый запуск на VPS

1. DNS: A-запись `polziki.lz.media` → IP VPS.
2. Клон: `git clone ssh://git@gitlab.lz.media:2222/Kuraeva/polzik.git /home/lzmedia/projects/polziks`
3. `.env` из образца, секреты генерируются сами, домен уже прописан:

   ```sh
   cd /home/lzmedia/projects/polziks
   docker run --rm -v "$PWD":/app -w /app node:22-alpine node scripts/generate-env.mjs .env.vps.example > .env
   ```

4. `./scripts/vps-update.sh` — поднимет базу и сервис, создаст таблицы, проверит домен.
5. Данные из дампа (файл передаётся отдельно, в репозитории его нет): положить `.sql` в папку
   `scripts/` и выполнить

   ```sh
   sh scripts/import-dump.sh
   ```

   Скрипт сам найдёт единственный `.sql` в `scripts/` (или путь можно передать аргументом),
   дождётся базы и загрузит дамп. Если в базе уже есть сотрудники, сначала спросит подтверждение.
   `scripts/*.sql` в `.gitignore`. После дампа скрипт прогоняет `polziks-schema.sql` (открытые
   пароли из дампа сразу хешируются, дубли email проверяются) и права. Файл дампа после загрузки
   удалить: в старом дампе пароли открытым текстом.

   Дамп загружать только этим скриптом. Через пайп (`cat dump.sql | psql`) кодировка ломается
   и кириллица превращается в `?`.
6. Проверить: `docker compose ps` — все контейнеры `healthy`; https://polziki.lz.media — вход, список
   сотрудников, начисление. Что-то не так — `docker compose logs --tail 50 app-vps`.

## Обновление

```sh
./scripts/vps-update.sh
```

Скрипт работает с `.env` своей папки. По шагам: `git pull` → `docker compose up -d --build --wait` →
`supabase/db/polziks-schema.sql` и `polziks-access.sql` в базу (идемпотентны, повторный прогон
безвреден) → `docker compose ps` → код ответа `https://polziki.lz.media/login`. Без `.env` с
`COMPOSE_PROFILES=vps` или с пустыми доменом и секретами останавливается с подсказкой.

Новая колонка или таблица — дописать в `polziks-schema.sql` идемпотентно
(`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), и следующий
`vps-update.sh` применит её.

### Перед первой миграцией паролей — копия базы

`polziks-schema.sql` хеширует открытые пароли, это необратимо: после прогона их не прочитать ни для
выдачи сотрудникам, ни для отката. Перед первым `vps-update.sh` с этой миграцией сохранить копию
(команда из раздела «Резервная копия»):

```sh
docker compose exec -T db pg_dump -U postgres -d postgres -n public > backup_$(date +%F).sql
```

Копию хранить как секрет (в ней открытые пароли) и не пересылать открыто.

### `vps-update.sh` упал на дублях email

Ошибка вида `В public.users несколько сотрудников с одним email: a@lz.media, …` значит, что в базе
есть строки, у которых email совпадает без учёта регистра и пробелов по краям. Уникальный индекс не
создан, пароли в этом прогоне не захешированы, `polziks-access.sql` не применён (тот же `psql` с
`ON_ERROR_STOP`). Права стоят с прошлых прогонов, сервис работает, но ни один из аккаунтов-дублей не
войдёт, пока дубль не разобран.

Разбор — руками, скрипта нет:

1. Посмотреть строки: `docker compose exec db psql -U postgres`, затем
   `select id, name, email, role, balance, created_at from users where lower(trim(email)) = 'a@lz.media';`
2. Решить, какая строка настоящая. У лишней проверить историю:
   `select count(*) from transactions where user_id = '<id>';`
3. Лишнюю удалить (если у неё есть операции — сначала перенести их и баланс на оставшуюся) или сменить
   ей email на другой адрес.
4. Повторить `./scripts/vps-update.sh`.

## Работа с базой на сервере

Админки нет, к базе подключаются из консоли сервера:

```sh
docker compose exec db psql -U postgres
```

## Резервная копия и восстановление

```sh
docker compose exec -T db pg_dump -U postgres -d postgres -n public > backup_$(date +%F).sql
sh scripts/import-dump.sh backup_YYYY-MM-DD.sql
```

## Важно

- **`.env` не терять и секреты после первого запуска не менять.** `POSTGRES_PASSWORD` и `JWT_SECRET`
  записаны в базу и в выданные ключи.
- `docker compose down` — остановить, данные остаются. `docker compose down -v` **стирает базу**.
- Пароль на весь сайт — по желанию, `SITE_BASIC_AUTH_USERS` (пусто — без пароля), как на staging Jurassic.
- Права в базе: сервис работает с `SERVICE_ROLE_KEY`, для анонимного доступа таблицы закрыты (RLS, права
  отозваны) — `supabase/db/polziks-access.sql`.
- Пароли сотрудников в таблице `users` хранятся bcrypt-хешем. Смены пароля в интерфейсе нет, забытый
  сбросить из консоли сервера (`docker compose exec db psql -U postgres`):

  ```sql
  update users set password = extensions.crypt('новый пароль', extensions.gen_salt('bf', 10))
  where email = 'user@lz.media';
  ```

## Связь с облачным Supabase

Код один и тот же, `app/lib/data.js` берёт адрес и ключ базы из переменных окружения:

| Где запущено | База | Переменные |
|---|---|---|
| VPS / локальный Docker | Supabase из этого compose, напрямую в PostgREST | `SUPABASE_REST_URL`, задаёт compose |
| Vercel | облачный Supabase | `SUPABASE_URL` и ключ в Environment Variables |
| `npm run dev` | облачный или локальный Supabase | `.env.local` |

## Облачный Supabase: миграция email и паролей

Скрипты к облачной базе не ходят, `polziks-schema.sql` прогоняется руками. Порядок важен: старый код
сравнивает пароль напрямую и после хеширования никого не пустит, а новый понимает и открытые пароли
(переходный вход), и хеши.

1. **Выгрузка `users`.** Dashboard → Table Editor → `users` → Export to CSV. Хеширование необратимо;
   выгрузку хранить как секрет, в ней открытые пароли.
2. **Сначала деплой кода** на Vercel (Production собирается из `main`). Пока база не мигрирована,
   вход работает по открытым паролям, и при каждом входе пароль сотрудника хешируется.
3. **Потом схема.** Dashboard → SQL Editor → вставить весь `supabase/db/polziks-schema.sql` → Run.
   Повторный запуск безвреден.
4. **Ошибка про дубли** (`В public.users несколько сотрудников с одним email: …`) — разобрать дубли,
   как в разделе «`vps-update.sh` упал на дублях email» (запросы — в SQL Editor), и запустить схему
   снова.
5. Проверить: `select count(*) from users where password !~ '^\$2';` → `0`, сотрудник входит.

Сброс забытого пароля — тот же `update … extensions.crypt(…)`, что в разделе «Важно», в SQL Editor.
