// Выполняется один раз при старте сервера Next.js (dev, next start, Docker)
export async function register() {
	// register вызывается и для edge-рантайма (middleware) — базе там делать нечего
	if (process.env.NEXT_RUNTIME !== 'nodejs') return

	const { ensureAdmin } = await import('./app/lib/ensure-admin')
	await ensureAdmin()
}
