import { fetchTransactions } from '@/app/lib/data'

export async function GET(req, { params }) {
  const transactions = await fetchTransactions(params.id)

  return Response.json(transactions)
}
