import { fetchUsers } from '@/app/lib/data'

export async function GET(req, { params }) {
	const users = await fetchUsers()
	console.log('users', users)

	if (!users || users.length === 0) {
		return Response.json({ error: 'Users not found' }, { status: 404 })
	}

	return Response.json(users)
}
