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
   `scripts/*.sql` в `.gitignore`. После загрузки файл удалить: в нём пароли сотрудников.

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
- Пароли сотрудников в таблице `users` пока хранятся открытым текстом. Дамп не пересылать открыто.

## Связь с облачным Supabase

Код один и тот же, `app/lib/data.js` берёт адрес и ключ базы из переменных окружения:

| Где запущено | База | Переменные |
|---|---|---|
| VPS / локальный Docker | Supabase из этого compose, напрямую в PostgREST | `SUPABASE_REST_URL`, задаёт compose |
| Vercel | облачный Supabase | `SUPABASE_URL` и ключ в Environment Variables |
| `npm run dev` | облачный или локальный Supabase | `.env.local` |
