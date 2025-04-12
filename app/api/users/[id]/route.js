import { fetchUserById } from '@/app/lib/data'

export async function GET(req, { params }) {

  const { id } = await params
	
  const user = await fetchUserById(id)

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(user)
}
