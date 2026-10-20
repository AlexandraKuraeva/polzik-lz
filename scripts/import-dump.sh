#!/bin/sh
# Загружает дамп схемы public (pg_dump, как public_backup.sql) в базу из docker-compose.yml.
#
# Первый запуск: положить файл дампа в папку scripts/ (рядом с этим скриптом) и выполнить
#   sh scripts/import-dump.sh
# Или указать путь явно:
#   sh scripts/import-dump.sh path/to/backup.sql
#
# В пустую базу (только что созданную compose) дамп загружается без вопросов.
# Если в базе уже есть сотрудники — спросит подтверждение: схема public удаляется целиком
# и создаётся заново из дампа.
#
# Файл копируется в контейнер и читается psql напрямую — не передавать дамп через
# пайп (cat | psql, особенно в PowerShell): кодировка ломается и кириллица превращается в «?».

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

if [ $# -ge 1 ]; then
	DUMP=$1
else
	# Без аргумента — единственный .sql в папке scripts/
	set -- "$SCRIPT_DIR"/*.sql
	[ -e "$1" ] || { echo "Нет файла дампа: положите .sql в $SCRIPT_DIR или укажите путь аргументом" >&2; exit 1; }
	[ $# -eq 1 ] || { echo "В $SCRIPT_DIR несколько .sql — укажите нужный аргументом:" >&2; printf '  %s\n' "$@" >&2; exit 1; }
	DUMP=$1
fi
[ -f "$DUMP" ] || { echo "Файл не найден: $DUMP" >&2; exit 1; }
# Абсолютный путь: дальше переходим в корень проекта
DUMP="$(cd "$(dirname "$DUMP")" && pwd)/$(basename "$DUMP")"

cd "$SCRIPT_DIR/.."
# Файл внутри проекта — относительным путём (Git Bash на Windows отдаёт docker пути вида /c/...)
case $DUMP in "$PWD"/*) DUMP=${DUMP#"$PWD"/} ;; esac

# База могла ещё не подняться после `docker compose up -d --build`
docker compose up -d --wait db rest </dev/null

USERS=$(docker compose exec -T db psql -U postgres -d postgres -tAc 'select count(*) from public.users' 2>/dev/null </dev/null || echo 0)

echo "Дамп: $DUMP"
if [ "$USERS" != "0" ]; then
	echo "В базе уже есть данные (сотрудников: $USERS). Они будут удалены и заменены дампом."
	printf 'Продолжить? [y/N] '
	read -r answer
	[ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo 'Отменено.'; exit 1; }
fi

docker compose cp "$DUMP" db:/tmp/polziks-dump.sql

# Одной транзакцией: при любой ошибке база останется как была.
# После дампа — схема (polziks-schema.sql): дамп из немигрированной базы несёт открытые пароли
# и не несёт индекса email, хешируем и проверяем дубли сразу. Затем заново выдаём права
# и включаем RLS (polziks-access.sql).
# От supabase_admin: дамп меняет права по умолчанию и для этой роли, у postgres на это нет прав.
docker compose exec -T db psql -U supabase_admin -d postgres -q \
	-v ON_ERROR_STOP=1 --single-transaction \
	-c 'DROP SCHEMA public CASCADE;' \
	-f /tmp/polziks-dump.sql \
	-f /docker-entrypoint-initdb.d/migrations/99-polziks-1-schema.sql \
	-f /docker-entrypoint-initdb.d/migrations/99-polziks-2-access.sql

docker compose exec -T db rm -f /tmp/polziks-dump.sql

echo
echo 'Готово. Записей в таблицах:'
docker compose exec -T db psql -U postgres -d postgres -c \
	"select 'users' as table, count(*) from public.users
	 union all select 'transactions', count(*) from public.transactions
	 union all select 'point_actions', count(*) from public.point_actions;"

echo "Файл дампа больше не нужен, в нём пароли сотрудников — удалите его: rm '$DUMP'"
