import { fetchUsers } from '@/app/lib/data'
import { requireAdmin } from '@/app/lib/api-auth'

export async function GET() {
	const { response } = await requireAdmin()
	if (response) return response

	const users = await fetchUsers()

	// Пустой список — не ошибка: таблица на странице просто покажет, что сотрудников нет
	return Response.json(users ?? [])
}
