#!/bin/sh
# Загружает дамп схемы public (pg_dump, как public_backup.sql) в базу из docker-compose.yml.
#
#   sh scripts/import-dump.sh path/to/backup.sql
#
# ВНИМАНИЕ: текущая схема public удаляется целиком и создаётся заново из дампа.
#
# Файл копируется в контейнер и читается psql напрямую — не передавать дамп через
# пайп (cat | psql, особенно в PowerShell): кодировка ломается и кириллица превращается в «?».

set -eu

DUMP="${1:?Укажите путь к файлу дампа: sh scripts/import-dump.sh backup.sql}"
[ -f "$DUMP" ] || { echo "Файл не найден: $DUMP" >&2; exit 1; }

cd "$(dirname "$0")/.."

echo "Схема public в базе будет удалена и загружена из $DUMP."
printf 'Продолжить? [y/N] '
read -r answer
[ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo 'Отменено.'; exit 1; }

docker compose cp "$DUMP" db:/tmp/polziks-dump.sql

# Одной транзакцией: при любой ошибке база останется как была.
# После дампа заново выдаём права и включаем RLS (polziks-access.sql).
# От supabase_admin: дамп меняет права по умолчанию и для этой роли, у postgres на это нет прав.
docker compose exec -T db psql -U supabase_admin -d postgres \
	-v ON_ERROR_STOP=1 --single-transaction \
	-c 'DROP SCHEMA public CASCADE;' \
	-f /tmp/polziks-dump.sql \
	-f /docker-entrypoint-initdb.d/migrations/99-polziks-2-access.sql

docker compose exec -T db rm -f /tmp/polziks-dump.sql

echo
echo 'Готово. Записей в таблицах:'
docker compose exec -T db psql -U postgres -d postgres -c \
	"select 'users' as table, count(*) from public.users
	 union all select 'transactions', count(*) from public.transactions
	 union all select 'point_actions', count(*) from public.point_actions;"
