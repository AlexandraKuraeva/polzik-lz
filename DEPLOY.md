# Развёртывание «Пользиков» на сервере (Docker)

Всё поднимается одним `docker-compose.yml`: сервис (Next.js) и self-hosted Supabase
в минимальном составе (Postgres, PostgREST, Studio).

| Контейнер | Что это | Порт на хосте |
|---|---|---|
| `app` | сервис «Пользики» | `APP_PORT` (3000) |
| `db` | Postgres (образ `supabase/postgres`) | не публикуется |
| `rest` | PostgREST — REST API к базе, через него ходит приложение | не публикуется |
| `gateway` | nginx: отдаёт PostgREST по пути `/rest/v1`, как облачный Supabase | не публикуется |
| `studio`, `meta` | Supabase Studio — веб-интерфейс к базе | `127.0.0.1:STUDIO_PORT` (54323) |

Требуется Docker Engine с Compose v2 (`docker compose version`). Ресурсы: ~1,5 ГБ RAM.

## Первый запуск

```sh
git clone <репозиторий> polziks && cd polziks

# 1. Секреты: создать .env из .env.example с новыми случайными ключами
docker run --rm -v "$PWD":/app -w /app node:22-alpine node scripts/generate-env.mjs > .env
# при необходимости поправить порты в .env

# 2. Собрать и запустить
docker compose up -d --build
docker compose ps          # все контейнеры должны быть healthy / running

# 3. Загрузить данные из дампа (файл передаётся отдельно, в репозитории его нет)
sh scripts/import-dump.sh /path/to/public_backup.sql
```

При первом запуске база создаётся пустой, со структурой таблиц
(`supabase/db/polziks-schema.sql`). Шаг 3 заменяет схему `public` содержимым дампа.

Дамп загружать только через `scripts/import-dump.sh` (или `docker compose cp` + `psql -f`).
Не передавать его через пайп (`cat dump.sql | psql`, `Get-Content | ...`): кодировка ломается
и кириллица превращается в `?`.

## Доступ снаружи

- **Сервис** слушает `APP_PORT` по HTTP. Наружу его нужно открывать через обратный прокси
  с HTTPS (nginx, Traefik, Caddy). Пример для nginx:

  ```nginx
  location / {
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  ```

  Если прокси на том же сервере, порт можно закрыть от внешнего мира:
  `APP_PORT=127.0.0.1:3000` в `.env`.

- **Studio** без пароля, поэтому слушает только `127.0.0.1`. Заходить через SSH-туннель:

  ```sh
  ssh -L 54323:127.0.0.1:54323 user@server
  # затем открыть http://localhost:54323
  ```

- **База и REST API** наружу не публикуются: к ним ходят только контейнеры
  во внутренней сети докера.

## Обновление сервиса

```sh
git pull
docker compose up -d --build app
```

Данные лежат в томе `polziks_db-data` и при пересборке не теряются.

## Резервная копия базы

```sh
docker compose exec -T db pg_dump -U postgres -d postgres -n public > backup_$(date +%F).sql
```

Восстановление: `sh scripts/import-dump.sh backup_YYYY-MM-DD.sql`.

## Важно

- **`.env` не терять и не менять секреты после первого запуска.** `POSTGRES_PASSWORD`
  и `JWT_SECRET` записаны в базу и в выданные ключи. Если их поменять, сервис перестанет
  подключаться к базе.
- `docker compose down -v` **удаляет базу** (том с данными). Для остановки — `docker compose down`.
- Права в базе: приложение работает с ключом `SERVICE_ROLE_KEY`. Для `ANON_KEY` таблицы
  закрыты (RLS включён, права отозваны), см. `supabase/db/polziks-access.sql`.
- Пароли сотрудников в таблице `users` пока хранятся открытым текстом. Дамп не
  пересылать открыто и не класть в репозиторий.

## Как это связано с облачным Supabase

Код один и тот же. `app/lib/data.js` берёт адрес и ключ базы из переменных окружения:

| Где запущено | База | Переменные |
|---|---|---|
| Сервер (Docker) | Supabase из этого compose | задаёт `docker-compose.yml` из `.env` |
| Vercel | облачный Supabase | Environment Variables в Vercel |
| Локально, `npm run dev` | облачный или локальный Supabase | `.env.local` |

Конфигурация Supabase основана на официальном
[supabase/docker](https://github.com/supabase/supabase/tree/master/docker) (образы от 2026-10-16).
Не подняты сервисы, которые приложение не использует: Auth, Storage, Realtime,
Edge Functions, аналитика, пулер.
