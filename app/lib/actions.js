'use server';

import { supabase, updateTransactions, fetchBalance, updateBalance } from './data'
import { revalidatePath } from 'next/cache';
import { validateForm } from './utils';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';


export async function actionTransaction(prevState, formData) {

	
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
		const {balance} = await fetchBalance(userId)
		const newBalance = balance + transactionAmount;

		if(newBalance < 0){

			return { message: 'Недостаточно средств', errors: { balance: 'Недостаточно средств'}, data: { amount, type, description } }
		}

		const data = await updateBalance(userId, newBalance)


		const response = await updateTransactions(userId, amount, type, description, date)
		
		
		return response

	 }catch(error){
		console.log(error);
	 	return { message: 'Ошибка в actions: не удалось создать транзакцию', errors: {} }
	 }
	
	
}

export async function authenticate( prevState, formData){
	try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
