-- Структура таблиц «Пользиков» для пустой базы.
-- Выполняется один раз при первом запуске контейнера db (пока том с данными пуст),
-- от имени postgres — так же, как таблицы созданы в облачном Supabase.
-- Данные сюда не кладём: они загружаются отдельно, см. scripts/import-dump.sh.

CREATE TABLE public.users (
	id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
	name character varying(255) NOT NULL,
	email character varying(255) NOT NULL,
	balance integer DEFAULT 0,
	password text,
	role text,
	created_at timestamp with time zone DEFAULT now(),
	CONSTRAINT customers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transactions (
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

CREATE TABLE public.point_actions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	type text DEFAULT ''::text,
	description text DEFAULT ''::text,
	sum numeric,
	created_at timestamp with time zone DEFAULT now(),
	CONSTRAINT point_actions_pkey PRIMARY KEY (id)
);
