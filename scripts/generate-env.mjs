// Генерирует .env для docker compose: берёт .env.example и заполняет пустые секреты.
// Запуск (нужен только Docker):
//   docker run --rm -v "$PWD":/app -w /app node:22-alpine node scripts/generate-env.mjs > .env
// или, если есть Node: node scripts/generate-env.mjs > .env

import { createHmac, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

const hex = bytes => randomBytes(bytes).toString('hex')
const base64url = value => Buffer.from(value).toString('base64url')

// Ключ API Supabase — JWT (HS256) с ролью, подписанный JWT_SECRET, на 10 лет
function signKey(role, secret) {
	const now = Math.floor(Date.now() / 1000)
	const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
	const payload = base64url(
		JSON.stringify({ role, iss: 'supabase', iat: now, exp: now + 10 * 365 * 24 * 3600 }),
	)
	const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
	return `${header}.${payload}.${signature}`
}

const jwtSecret = hex(32)
const secrets = {
	POSTGRES_PASSWORD: hex(24),
	JWT_SECRET: jwtSecret,
	ANON_KEY: signKey('anon', jwtSecret),
	SERVICE_ROLE_KEY: signKey('service_role', jwtSecret),
	PG_META_CRYPTO_KEY: hex(32),
	AUTH_SECRET: randomBytes(32).toString('base64'),
}

const template = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
const result = template.replace(/^([A-Z_]+)=$/gm, (line, name) =>
	name in secrets ? `${name}=${secrets[name]}` : line,
)

process.stdout.write(result.replace(/\r\n/g, '\n'))
