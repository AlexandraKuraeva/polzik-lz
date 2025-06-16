'use server';

import { supabase, updateTransactions, fetchBalance, updateBalance, createUser, fetchUserByEmail } from './data'
import { revalidatePath } from 'next/cache';
import { validateForm, validateFormCreateUser } from './utils';
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

		return { success: true, message: 'Authorization successful!' };

  } catch (error) {

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {success: false, message: 'Invalid credentials.'}
        default:
          return { success: false, message: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

export async function actionCreateUser(prevState,formData) {

	console.log('actionCreateUser');
	const email = formData.get('email');
	const password = formData.get('password');
	const name = formData.get('name');
	const role = formData.get('role');

	const errors = validateFormCreateUser(name, email, password, role)
	
	if (Object.keys(errors).length > 0) {
		return { message: 'Ошибка валидации', errors, data: { name, email, password, role } }
	}
	
	try{
			// console.log('formData', [...formData.entries()])

		const existUser = await fetchUserByEmail(email)

		if(existUser){
			
			return { message: 'Пользователь уже существует', errors: { email: 'Email уже занят' }, data: { name, email, password, role } }
		}
		const newUser = await createUser(name, email, password, role)
	

		
		
		return newUser
	}
	catch(error){
		console.log(error);
		return { message: 'Ошибка в actions: не удалось создать пользователя', errors: {} }
	}
}
