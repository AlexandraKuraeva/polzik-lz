import { supabase } from './data'

export async function actionTransaction(prevState, formData) {

	for(const [key, value] of formData.entries()){
		console.log(key, value);
	}
	const userId = formData.get('userId')
	const amount = parseInt(formData.get('amount'), 10)
	const type = formData.get('type')
	const description = formData.get('description')

	if (!userId || isNaN(amount) || !type) {
		return { message: 'Ошибка: заполните все поля', errors: {} }
	}

	const date = new Date().toISOString().split('T')[0];



	 try{
	 	const response = await supabase 
	 	.from('transactions')
	 	.insert({
	 		user_id: userId,
	 		amount,
	 		type,
	 		description,
	 		date
	 	})
		
	 }catch(error){
	 	return { message: 'Ошибка: не удалось создать транзакцию', errors: {} }
	 }
	
}
