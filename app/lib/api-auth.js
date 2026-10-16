import 'server-only'
import { auth } from '@/auth'

// middleware не проверяет /api/*, поэтому каждый маршрут сам вызывает одну из этих функций.
// Возвращают { session } при успехе или { response } с 401/403, который нужно вернуть из маршрута.

export async function requireAdmin() {
	const session = await auth()

	if (!session?.user) {
		return { response: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
	}
	if (session.user.role !== 'admin') {
		return { response: Response.json({ error: 'Forbidden' }, { status: 403 }) }
	}

	return { session }
}

// Доступ к данным пользователя userId: админу или самому пользователю
export async function requireSelfOrAdmin(userId) {
	const session = await auth()

	if (!session?.user) {
		return { response: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
	}
	if (session.user.role !== 'admin' && String(session.user.id) !== String(userId)) {
		return { response: Response.json({ error: 'Forbidden' }, { status: 403 }) }
	}

	return { session }
}
