-- Структура таблиц «Пользиков» для пустой базы.
-- Выполняется при первом запуске контейнера db (пока том с данными пуст) от имени postgres,
-- а на VPS ещё и при каждом scripts/vps-update.sh — поэтому идемпотентно (IF NOT EXISTS).
-- Новую колонку добавлять отдельной командой ALTER TABLE ... ADD COLUMN IF NOT EXISTS ниже.
-- Данные сюда не кладём: они загружаются отдельно, см. scripts/import-dump.sh.

CREATE TABLE IF NOT EXISTS public.users (
	id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
	name character varying(255) NOT NULL,
	email character varying(255) NOT NULL,
	balance integer DEFAULT 0,
	password text,
	role text,
	created_at timestamp with time zone DEFAULT now(),
	CONSTRAINT customers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	user_id uuid DEFAULT gen_random_uuid(),
	amount integer,
	description text,
	type character varying,
	date date,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.point_actions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	type text DEFAULT ''::text,
	description text DEFAULT ''::text,
	sum numeric,
	created_at timestamp with time zone DEFAULT now(),
	CONSTRAINT point_actions_pkey PRIMARY KEY (id)
);
