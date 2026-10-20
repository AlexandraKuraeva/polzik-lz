#!/usr/bin/env bash
# Обновление «Пользиков» на VPS одной командой (порядок первого запуска — DEPLOY.md).
# Запуск из корня клона: ./scripts/vps-update.sh
# Работает с .env той папки, где лежит скрипт: git pull → пересборка и перезапуск → схема и права
# в базу (supabase/db/polziks-*.sql, идемпотентны) → проверка домена.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ] || ! grep -q '^COMPOSE_PROFILES=vps' .env; then
   echo "Нет .env с COMPOSE_PROFILES=vps — это не папка сервера, либо .env не создан." >&2
   echo "Создать: см. DEPLOY.md, первый запуск (образец .env.vps.example)." >&2
   exit 1
fi

# Значение ключа из .env; нет ключа — пустая строка (а не падение по pipefail)
env_value() {
   { grep "^$1=" .env || true; } | tail -1 | cut -d= -f2-
}

for key in COMPOSE_PROJECT_NAME APP_DOMAIN POSTGRES_PASSWORD JWT_SECRET SERVICE_ROLE_KEY AUTH_SECRET; do
   if [ -z "$(env_value "$key")" ]; then
      echo "В .env пустой $key — заполнить по .env.vps.example." >&2
      exit 1
   fi
done

PROJECT=$(env_value COMPOSE_PROJECT_NAME)
APP_DOMAIN=$(env_value APP_DOMAIN)
echo "== экземпляр $PROJECT (https://$APP_DOMAIN)"

echo "== git pull"
git pull --ff-only

echo "== пересборка и перезапуск"
docker compose up -d --build --wait

echo "== схема и права в базу (идемпотентно)"
# От supabase_admin: он владелец таблиц (создаёт их при инициализации и при загрузке дампа),
# от postgres ALTER TABLE ... ENABLE ROW LEVEL SECURITY падает с «must be owner»
docker compose exec -T -e PGOPTIONS="-c client_min_messages=warning" db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q \
   -f /docker-entrypoint-initdb.d/migrations/99-polziks-1-schema.sql \
   -f /docker-entrypoint-initdb.d/migrations/99-polziks-2-access.sql

echo "== контейнеры"
docker compose ps

echo "== проверка домена (сразу после старта traefik может ещё получать сертификат — повтори через минуту)"
curl -s -o /dev/null -w "https://$APP_DOMAIN/login → %{http_code} (ждём 200)\n" "https://$APP_DOMAIN/login" || true
