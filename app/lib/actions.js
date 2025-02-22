import { supabase, updateTransactions, fetchBalance, updateBalance } from './data'
import { revalidatePath } from 'next/cache';
import { validateForm } from './utils';


export async function actionTransaction(prevState, formData, refetchTransactions) {

	
	const userId = formData.get('userId')
	const amount = Number(formData.get('amount'), 10)
	const type = formData.get('type')
	const description = formData.get('description')

	
	const  errors  = validateForm(amount, type, description)

	 if (Object.keys(errors).length > 0) {
	 	return { message: 'Ошибка валидации', errors, data: { amount, type, description } }
	 }

	const date = new Date().toISOString().split('T')[0];
	const transactionAmount = type === "credit" ? amount : -amount;

	 try{
	 	
		const response = await updateTransactions(userId, amount, type, description, date)
		const {balance} = await fetchBalance(userId)
		
		const newBalance = balance + transactionAmount;
		console.log(balance + transactionAmount);

		const data = await updateBalance(userId, newBalance)
	
		refetchTransactions()

	 }catch(error){
	 	return { message: 'Ошибка: не удалось создать транзакцию', errors: {} }
	 }
	
	
}
