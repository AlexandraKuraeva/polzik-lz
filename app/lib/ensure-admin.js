import 'server-only'
import { fetchUserByEmail, createUser, isEmailTakenError } from './data'
import { normalizeEmail } from './utils'

// Админ из переменных окружения: создаётся при старте сервера (instrumentation.js),
// если пользователя с ADMIN_EMAIL ещё нет. Существующий не трогаем — ни пароль, ни роль.
export async function ensureAdmin() {
	const email = normalizeEmail(process.env.ADMIN_EMAIL)
	const password = String(process.env.ADMIN_PASSWORD ?? '')
	const name = String(process.env.ADMIN_NAME ?? '').trim() || 'Админ'

	// Пустой ADMIN_EMAIL — админа из окружения не заводим
	if (!email) return

	if (!password) {
		console.warn('[admin] ADMIN_EMAIL задан, но ADMIN_PASSWORD пуст — админ не создан')
		return
	}

	// Ошибка базы не должна ронять старт сервиса: пишем в лог и работаем дальше
	try {
		const existing = await fetchUserByEmail(email)
		if (existing) return

		await createUser(name, email, password, 'admin')
		console.log('[admin] создан админ', email)
	} catch (error) {
		// Админа с этим email вставили между проверкой и вставкой (второй экземпляр сервиса) — он уже есть
		if (isEmailTakenError(error)) return

		console.error('[admin] не удалось проверить или создать админа:', error)
	}
}
