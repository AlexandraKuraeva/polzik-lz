import { fetchUserById } from '@/app/lib/data'
import { requireSelfOrAdmin } from '@/app/lib/api-auth'

export async function GET(req, { params }) {
  const { id } = await params

  const { response } = await requireSelfOrAdmin(id)
  if (response) return response

  const user = await fetchUserById(id)

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(user)
}
