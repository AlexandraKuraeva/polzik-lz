# Пользики (polziks)

Внутренний сервис учёта «пользиков» — баллов сотрудников. Админ начисляет/списывает баллы,
сотрудник видит свой баланс и историю. Next.js 15 (App Router, JS без TS), next-auth v5 beta
(Credentials + JWT), Supabase (только как Postgres через supabase-js), Tailwind 3, SWR.
Весь UI и сообщения об ошибках — на русском. Общение с пользователем — на русском.

## Окружения и две базы

- **Локально:** `npm run dev` → `.env.local` → локальный Supabase (`127.0.0.1:54321`, Studio `:54323`).
- **Прод:** Vercel, https://polzik-lzmedia.vercel.app → облачный Supabase `keeqvxpyjskummuuzujo`.
  Production собирается из ветки `main`, любые другие ветки — Preview.
- Переменные Vercel заданы во всех трёх окружениях: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
  (новый ключ `sb_secret_…`), `NEXT_PUBLIC_SUPABASE_URL`, `AUTH_SECRET`.
  Переменные применяются только к новым деплоям — после изменения нужен новый деплой.
- Локально ключ называется `SUPABASE_SERVICE_ROLE_KEY` (legacy-формат от CLI); `data.js` берёт
  `SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY`.
- **Сервер (Docker):** `docker-compose.yml` + `Dockerfile`, инструкция в `DEPLOY.md`. Устроен как в
  Jurassic (`Desktop/jurassic_2.0`): один compose, профиль из `.env` — `local` (порты) или `vps`
  (traefik, внешняя сеть `web`, entrypoint `websecure`, certresolver `myresolver`): только сервис
  polziki.lz.media. Портов на хост на VPS нет, Studio на сервере нет (решение пользователя) —
  база только внутри compose. Обновление на VPS — `scripts/vps-update.sh`. Никакого nginx руками.
  Свой минимальный Supabase: db (`supabase/postgres`), rest (PostgREST); meta + studio — только local. Шлюза нет:
  сервис ходит в PostgREST напрямую — `SUPABASE_REST_URL=http://rest:3000`, в `data.js` тогда
  `PostgrestClient` вместо `createClient` (из Supabase используется только `.from()`).
  Ключ — JWT `SERVICE_ROLE_KEY`. `output: 'standalone'` только при `BUILD_STANDALONE=1` (в Dockerfile).
- Изменения схемы БД применять во все базы (локальная Studio, облачный Dashboard) и в
  `supabase/db/polziks-schema.sql` — идемпотентно (`IF NOT EXISTS`): его прогоняет каждый `vps-update.sh`.
- Загрузка дампа в Docker-базу — `scripts/import-dump.sh` (от `supabase_admin`: дамп меняет
  default privileges этой роли). После загрузки применяется `supabase/db/polziks-access.sql` (права + RLS).
- Проверять Docker-стек локально отдельным проектом и портами, чтобы не задеть dev и локальный Supabase:
  `docker compose -p polziks-test --env-file <tmp.env> up -d --build`, затем `down -v`. `.env` в корне
  проекта не создавать: его читает и `npm run dev`. Профиль `vps` локально — с временной сетью
  `docker network create web` (потом удалить).

## Локальный Supabase

- Стек запущен НЕ из этого проекта: данные лежат в Docker-томах с суффиксом `_supabase`

- SQL напрямую: `docker exec supabase_db_supabase psql -U postgres -c "..."`.

## Git

- Два remote: `github` (GitHub, к нему подключён Vercel) и `origin` (GitLab gitlab.lz.media).
- Пушит пользователь сам; не пушить без явной просьбы. Коммиты — в отдельную ветку, не в `main`.

## Архитектура

- `app/lib/data.js` — весь доступ к БД. `import 'server-only'`, клиент создаётся лениво через
  `db()` (иначе `next build` падает без переменных). Нельзя импортировать из `'use client'` файлов.
- `PUBLIC_USER_FIELDS` в data.js — поля пользователя без `password`. `select('*')` по `users`
  только в `fetchUserByEmail` (нужен для входа).
- `app/lib/api-auth.js` — `requireAdmin()` / `requireSelfOrAdmin(id)` для route handlers.
- `middleware.js` НЕ проверяет `/api/*` (исключены в matcher) — каждый маршрут проверяет права сам.
  `/dashboard/users*` middleware пускает только `role === 'admin'`.
- Server actions (`app/lib/actions.js`) — публичные эндпоинты: проверка `auth()` и роли внутри
  каждого action, не полагаться на middleware.
- Клиентские страницы (`dashboard/users/*`) получают данные через SWR из `/api/...`;
  серверные (`dashboard/(over)`, `dashboard/info`) — напрямую из data.js.
- `dashboard/info` — `force-dynamic`, иначе `point_actions` вшиваются при сборке.

## Данные

- `users`: id (uuid), name, email, password, role (`admin` | `user`), balance, created_at.
  - email уникален: индекс `users_email_lower_key` по `lower(email)`; в коде всё через `normalizeEmail`
    (utils.js, trim + нижний регистр). `23505` при вставке = «email занят» (`isEmailTakenError`).
  - password — bcrypt (`bcryptjs`, cost 10), хеширует только `createUser`. Переходный вход в
    `auth.config.js`: открытый пароль сравнивается напрямую и при успехе перехешируется (`rehashPassword`).
    Схема хеширует не-bcrypt пароли через `extensions.crypt`. Облако: сначала деплой кода, потом схема
    в SQL Editor (DEPLOY.md). Сброс пароля — только SQL, смены в интерфейсе нет.
- `transactions`: user_id, amount (всегда положительный), type (`credit` | `debit`), description, date.
- `point_actions`: description, sum, type (`earn` | `spend`) — справочник «как заработать / на что потратить».
- Баланс хранится в `users.balance` и обновляется отдельно от вставки транзакции (не атомарно).

## Известные проблемы (ещё не исправлены)

- RLS выключен на всех таблицах в обеих базах.
- Переходный вход по открытому паролю в `auth.config.js` — убрать, когда все базы мигрированы.
- Начисление: read-modify-write баланса без транзакции → гонки и расхождение с историей.
- Ошибки supabase-js (`{ error }`) во многих функциях data.js не проверяются.
- `AUTH_SECRET` на Vercel помечен «Needs Attention».
- Визуал: шрифты без кириллицы (Inter только latin, Lusitana без кириллицы), `lang="en"`,
  низкий контраст белого на `primary` (#58e458), остатки шаблона Next.js learn (англ. тексты, hero-картинки).

## Работа на этой машине

- Windows, Node 18 (supabase-js предупреждает, что нужен 22+).
- У пользователя обычно запущен `npm run dev` → `.next` заблокирован и `npm run build` падает с EPERM.
  Не останавливать чужой dev; для проверки сборки копировать проект во временную папку
  (без `node_modules`, `.next`, `.env*`) и подключать `node_modules` через junction.
- Новые npm-пакеты, поставленные при запущенном dev (Turbopack), дают 500 до перезапуска dev.
- Проверка API с авторизацией без паролей: подписать JWT через `encode` из `@auth/core/jwt`
  с `AUTH_SECRET` и salt `authjs.session-token`, передать cookie `authjs.session-token`.
  В Node 18 нужно `globalThis.crypto ??= webcrypto`.

## Стиль кода

Табы, одинарные кавычки, точки с запятой непоследовательно (следовать соседнему коду).
Комментарии на русском. Ошибки для форм возвращаются как `{ message, errors: { field }, data }`.
