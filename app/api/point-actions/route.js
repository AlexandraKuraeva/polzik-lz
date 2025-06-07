// удалить после выполнения 
import { insertPointActions } from '@/app/lib/data'

export async function POST() {
	
	const transactions = await insertPointActions()

	return Response.json(transactions)
}
