-- Структура таблиц «Пользиков» для пустой базы.
-- Выполняется при первом запуске контейнера db (пока том с данными пуст) от имени postgres,
-- а на VPS ещё и при каждом scripts/vps-update.sh — поэтому идемпотентно (IF NOT EXISTS).
-- Новую колонку добавлять отдельной командой ALTER TABLE ... ADD COLUMN IF NOT EXISTS ниже.
-- Данные сюда не кладём: они загружаются отдельно, см. scripts/import-dump.sh. Миграции существующих
-- данных — тоже здесь и тоже идемпотентно: повторный прогон ничего не меняет (облако — руками в SQL Editor).

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

-- ---------- Уникальный email сотрудника (ТЗ 1.01) ----------
-- Порядок: нормализация → проверка дублей → уникальный индекс. Код нормализует email так же
-- (normalizeEmail в app/lib/utils.js), индекс по lower(email) ловит регистр и вставки мимо кода.

-- Нормализация: trim + нижний регистр. Строки, которые после нормализации совпали бы с другой,
-- не трогаем — иначе UPDATE упал бы на индексе без списка адресов; их ловит проверка ниже.
UPDATE public.users u
SET email = lower(trim(u.email))
WHERE u.email <> lower(trim(u.email))
	AND NOT EXISTS (
		SELECT 1 FROM public.users o
		WHERE o.id <> u.id AND lower(trim(o.email)) = lower(trim(u.email))
	);

-- Дубли не пропускаем молча: без индекса дыра осталась бы незаметной. Разбирает человек
DO $$
DECLARE
	duplicates text;
BEGIN
	SELECT string_agg(email, ', ' ORDER BY email) INTO duplicates
	FROM (
		SELECT lower(trim(email)) AS email
		FROM public.users
		GROUP BY 1
		HAVING count(*) > 1
	) d;

	IF duplicates IS NOT NULL THEN
		RAISE EXCEPTION 'В public.users несколько сотрудников с одним email: %', duplicates
			USING HINT = 'Оставить по одной строке на адрес (или сменить email) и прогнать схему заново, см. DEPLOY.md';
	END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON public.users (lower(email));
