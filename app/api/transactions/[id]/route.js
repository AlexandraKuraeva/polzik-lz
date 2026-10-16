import { fetchTransactions } from '@/app/lib/data'
import { requireSelfOrAdmin } from '@/app/lib/api-auth'

export async function GET(req, { params }) {
  const { id } = await params

  const { response } = await requireSelfOrAdmin(id)
  if (response) return response

  const transactions = await fetchTransactions(id)

  return Response.json(transactions)
}
