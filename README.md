# Пользики

Внутренний сервис LZ.Media для учёта «пользиков», баллов сотрудников. Админ начисляет и списывает
баллы, сотрудник видит свой баланс, историю операций и справочник «как заработать / на что потратить».

- Прод (Vercel): https://polzik-lzmedia.vercel.app
- Сервер (Docker + traefik): https://polziki.lz.media

## Что умеет

| Роль | Страница | Что там |
|---|---|---|
| все | `/dashboard` | баланс и история своих операций |
| все | `/dashboard/info` | справочник: за что начисляют и на что можно потратить |
| `admin` | `/dashboard/users` | список сотрудников, создание и удаление |
| `admin` | `/dashboard/users/[id]` | баланс и история сотрудника, начисление и списание |

Вход по email и паролю. Регистрации нет: сотрудников заводит админ. Email приводится к нижнему
регистру без пробелов по краям, поэтому `Admin@LZ.media` и `admin@lz.media` — один и тот же адрес.
Смены пароля в интерфейсе нет, забытый пароль сбрасывается SQL-запросом (см. «Email и пароли» ниже).

## Стек

- Next.js 15 (App Router), JavaScript без TypeScript, React 19
- next-auth v5 beta: Credentials, сессия в JWT
- Supabase только как Postgres: запросы через `supabase-js` или напрямую в PostgREST
- Tailwind CSS 3, SWR, zod
- Node 22 (в Docker), Node 18 работает, но `supabase-js` предупреждает

## Быстрый старт

Есть два способа поднять проект локально.

### Вариант 1. `npm run dev` с внешним Supabase

Подходит для разработки: горячая перезагрузка, база локального Supabase CLI или облачная.

1. `npm install`
2. Создать `.env.local` (в git не попадает):

   ```sh
   # Адрес проекта Supabase: облако или локальный CLI (http://127.0.0.1:54321)
   SUPABASE_URL=
   # Серверный ключ: sb_secret_… (облако) или service_role (локальный CLI)
   SUPABASE_SECRET_KEY=
   # Подпись сессий next-auth, например: openssl rand -base64 32
   AUTH_SECRET=
   ```

   Вместо `SUPABASE_SECRET_KEY` можно указать `SUPABASE_SERVICE_ROLE_KEY`, так называется legacy-ключ
   от Supabase CLI.
3. Если база пустая, создать таблицы из `supabase/db/polziks-schema.sql` (SQL Editor в Studio).
4. `npm run dev` и открыть http://localhost:3000.

### Вариант 2. Docker: сервис и база одним compose

Нужен только Docker. Поднимает сервис, Postgres, PostgREST и Studio на портах `127.0.0.1`.

```sh
# .env с новыми секретами (не путать с .env.local)
docker run --rm -v "$PWD":/app -w /app node:22-alpine node scripts/generate-env.mjs .env.example > .env
docker compose up -d --build
```

- Сервис: http://localhost:3000
- Studio (админка базы): http://localhost:54323

Таблицы создаются сами при первом запуске. Данные загружаются из дампа: положить `.sql` в `scripts/`
и выполнить `sh scripts/import-dump.sh`. Пересоздать стенд с нуля: `docker compose down -v`
(**база стирается**).

Учтите: `.env` в корне читает и `npm run dev`. Если работаете в обоих вариантах, после Docker-стенда
удалите `.env` или запускайте compose с `-p <имя> --env-file <файл вне проекта>`.

### Первый админ

Сервис создаёт админа сам при старте (`instrumentation.js` → `app/lib/ensure-admin.js`), если заданы
`ADMIN_EMAIL` и `ADMIN_PASSWORD` и пользователя с таким email (без учёта регистра) ещё нет. Если он уже есть, ничего не
меняется: ни пароль, ни роль.

- Docker, профиль `local`: `ADMIN_EMAIL=admin@lz.media` уже стоит в `.env.example`, пароль генерирует
  `generate-env.mjs`, смотреть в `.env`.
- VPS: в `.env.vps.example` `ADMIN_EMAIL` пуст, потому что сотрудники обычно приходят из дампа.
  Заполнить, если база стартует пустой.
- `npm run dev`: добавить `ADMIN_EMAIL`, `ADMIN_PASSWORD` и по желанию `ADMIN_NAME` в `.env.local`.

Удалённый в интерфейсе админ из `.env` появится снова при следующем старте сервиса. Чтобы этого не
было, очистите `ADMIN_EMAIL`. Остальных сотрудников заводит админ в интерфейсе.

## Переменные окружения

| Переменная | Где | Зачем |
|---|---|---|
| `SUPABASE_URL` | `.env.local`, Vercel | адрес Supabase (запасной вариант: `NEXT_PUBLIC_SUPABASE_URL`) |
| `SUPABASE_REST_URL` | Docker (задаёт compose) | адрес PostgREST напрямую, без шлюза Supabase |
| `SUPABASE_SECRET_KEY` | везде | серверный ключ базы, обходит RLS (запасной вариант: `SUPABASE_SERVICE_ROLE_KEY`) |
| `AUTH_SECRET` | везде | подпись сессий next-auth |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | по желанию | админ, которого сервис создаёт при старте, если его нет |

Если задан `SUPABASE_REST_URL`, `app/lib/data.js` создаёт `PostgrestClient`, иначе клиент `supabase-js`.
Переменные Docker-стенда (`POSTGRES_PASSWORD`, `JWT_SECRET`, ключи, порты) описаны в `.env.example`
и `.env.vps.example`.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер с Turbopack |
| `npm run build` | продакшен-сборка |
| `npm run start` | запуск собранного приложения |
| `npm run lint` | ESLint |

## Структура

```
app/
  api/                    route handlers для клиентских страниц (SWR)
    users/                список сотрудников, сотрудник по id
    transactions/[id]/    история операций сотрудника
  dashboard/
    (over)/               главная: баланс и история текущего пользователя
    info/                 справочник point_actions
    users/                раздел админа
  lib/
    data.js               весь доступ к БД, только сервер
    actions.js            server actions: начисление, создание и удаление сотрудника, вход
    api-auth.js           requireAdmin / requireSelfOrAdmin для /api/*
    utils.js              валидация форм
  login/                  страница входа
  ui/                     компоненты
auth.js, auth.config.js   next-auth: Credentials-провайдер, роль в JWT и сессии
middleware.js             защита /dashboard, раздел /dashboard/users только для admin
instrumentation.js        при старте сервера создаёт админа из ADMIN_* (app/lib/ensure-admin.js)
supabase/db/              схема таблиц, права и RLS, роли для Docker-базы
scripts/                  генерация .env, импорт дампа, обновление на VPS
```

### Правила, которые легко нарушить

- `app/lib/data.js` импортирует `server-only`, его нельзя подключать в `'use client'` файлах.
  Клиентские страницы получают данные через `/api/...`.
- `middleware.js` не проверяет `/api/*`. Каждый route handler сам вызывает `requireAdmin()` или
  `requireSelfOrAdmin(id)`.
- Server actions тоже публичные эндпоинты: роль проверяется внутри каждого action.
- Пароль пользователя не отдавать наружу: везде `PUBLIC_USER_FIELDS`, `select('*')` по `users` только
  в `fetchUserByEmail` для входа.

## Данные

| Таблица | Поля |
|---|---|
| `users` | `id`, `name`, `email` (уникален без учёта регистра), `password` (bcrypt-хеш), `role` (`admin` / `user`), `balance`, `created_at` |
| `transactions` | `user_id`, `amount` (всегда положительный), `type` (`credit` / `debit`), `description`, `date` |
| `point_actions` | `description`, `sum`, `type` (`earn` / `spend`) |

Баланс хранится в `users.balance` и обновляется отдельно от записи транзакции.

Схема лежит в `supabase/db/polziks-schema.sql` и пишется идемпотентно (`IF NOT EXISTS`). Изменение
схемы нужно применить во все базы: локальную, облачную и в этот файл (его прогоняет каждое обновление
на VPS). Миграции существующих данных живут там же и тоже идемпотентны: повторный прогон ничего
не меняет.

### Email и пароли

- **Email уникален.** В базе уникальный индекс `users_email_lower_key` по `lower(email)`; код
  нормализует email (`normalizeEmail` в `app/lib/utils.js`: `trim` + нижний регистр) при входе,
  создании сотрудника и поиске. Если вставку отклонил индекс (`23505`), форма показывает «Email уже
  занят», а `ensureAdmin` считает админа существующим. Дубли в старой базе `polziks-schema.sql` не
  пропускает: падает со списком адресов (что делать — в [DEPLOY.md](DEPLOY.md)).
- **Пароли хранятся bcrypt-хешем** (`bcryptjs`, cost 10). Хеширует `createUser` в `app/lib/data.js`,
  через него создают и форма, и `ensureAdmin`. `polziks-schema.sql` хеширует в базе все пароли, которые
  ещё не bcrypt (`extensions.crypt` из pgcrypto). Хеширование необратимо: перед первым прогоном на базе
  с открытыми паролями выгрузите таблицу `users` и храните выгрузку как секрет.
- **Переходный вход.** Если в `users.password` ещё открытый пароль (облако до прогона схемы, свежий
  дамп), вход сравнивает его напрямую и при успехе сразу записывает bcrypt-хеш. Поэтому новый код
  можно выкатывать раньше миграции базы, но не наоборот: старый код с хешами в базе никого не пустит.
  После миграции всех баз этот путь не нужен и будет убран отдельно.
- **Сброс забытого пароля** — SQL-запросом (Studio, SQL Editor облака или `psql`):

  ```sql
  update users set password = extensions.crypt('новый пароль', extensions.gen_salt('bf', 10))
  where email = 'user@lz.media';
  ```

## Деплой

- **Vercel.** Production собирается из `main`, остальные ветки идут в Preview. Переменные: `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `AUTH_SECRET`. После изменения переменных нужен
  новый деплой. Облачная база мигрируется руками: сначала деплой кода, потом `polziks-schema.sql`
  в SQL Editor — порядок в [DEPLOY.md](DEPLOY.md), раздел «Облачный Supabase».
- **VPS.** Docker-профиль `vps` за traefik, обновление `./scripts/vps-update.sh`. Первый запуск,
  резервные копии и работа с базой описаны в [DEPLOY.md](DEPLOY.md).

Репозиторий живёт в двух remote: `github` (к нему подключён Vercel) и `origin` (gitlab.lz.media).

## Известные ограничения

- Переходный вход по открытому паролю остаётся в коде, пока не мигрированы все базы.
- Начисление читает баланс, считает новый и записывает без транзакции: возможны гонки и расхождение
  баланса с историей.
- Ошибки Supabase проверяются не во всех функциях `data.js`.
- В облачной базе выключен RLS (в Docker-базе включён, см. `supabase/db/polziks-access.sql`).
- В интерфейсе остались следы шаблона Next.js learn: шрифты без кириллицы, `lang="en"`, hero-картинки.
