// Генерирует .env для docker compose: берёт образец и заполняет пустые секреты.
// Образец — аргументом: .env.example (локалка, по умолчанию) или .env.vps.example (сервер).
// Запуск (нужен только Docker):
//   docker run --rm -v "$PWD":/app -w /app node:22-alpine node scripts/generate-env.mjs .env.vps.example > .env
// или, если есть Node: node scripts/generate-env.mjs .env.vps.example > .env

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
	// Пароль админа вводят руками — поэтому короткий, 12 символов
	ADMIN_PASSWORD: randomBytes(9).toString('base64url'),
}

const templateName = process.argv[2] ?? '.env.example'
const template = readFileSync(new URL(`../${templateName}`, import.meta.url), 'utf8')
const result = template.replace(/^([A-Z_]+)=$/gm, (line, name) =>
	name in secrets ? `${name}=${secrets[name]}` : line,
)

process.stdout.write(result.replace(/\r\n/g, '\n'))
