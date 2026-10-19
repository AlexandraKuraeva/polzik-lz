-- Права доступа к таблицам public.
-- Выполняется при первом запуске (после polziks-schema.sql) и после каждой загрузки дампа
-- (scripts/import-dump.sh), т.к. дамп пересоздаёт схему public вместе с правами.
--
-- Приложение ходит в базу только с ключом service_role, он обходит RLS.
-- Ролям anon/authenticated доступ закрыт: RLS включён без политик и права отозваны,
-- поэтому ANON_KEY не даёт прочитать таблицы (в users лежат пароли).

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

DO $$
DECLARE
	t record;
BEGIN
	FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
		EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
	END LOOP;
END
$$;

-- PostgREST должен перечитать схему, иначе не увидит пересозданные таблицы
NOTIFY pgrst, 'reload schema';
