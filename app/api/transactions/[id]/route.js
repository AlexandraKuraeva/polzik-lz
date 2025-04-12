import { fetchTransactions } from '@/app/lib/data'

export async function GET(req, { params }) {
  const { id } = await params
  const transactions = await fetchTransactions(id)

  return Response.json(transactions)
}
