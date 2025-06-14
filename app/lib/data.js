import { createClient } from '@supabase/supabase-js'


export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)



export async function fetchUsers() {
	console.log('fetchUsers');
	try {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) throw error

		const users = data
		return users
	} catch (err) {
		console.error('Database Error:', err)
		throw new Error('Failed to fetch all users.')
	}
}

export async function fetchUserById(id) {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('id', id)
			.single()

		if (error) throw error

		const user = data

		return user
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoice.')
	}
}

export async function getUser(email) {
	
	try {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.single()

		if (error) throw error

		
		const user = data

		return user
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoice.')
	}
}


export async function fetchTransactions( userId ) {

	try {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })


			return data
	}catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoice.')
	}

	
}

export async function updateTransactions( userId, amount, type, description, date ) {
console.log("updateTransactions");
	try{
		const { data: response, error} = await supabase 
		.from('transactions')
		.insert({
			user_id: userId,
			amount,
			type,
			description,
			date
		})
		.select()

		return response

		
	}catch(error){
		return { message: 'Ошибка в базе: не удалось создать транзакцию', errors: {} }
	}

}


export async function fetchBalance( userId ) {
	console.log();
	try{
		const { data, error } = await supabase
			.from('users')
			.select('balance')
			.eq('id', userId)
			.single();

		return data
	}catch (error) {
		console.error('Проблема с балансом', error)
		throw new Error('Failed to fetch invoice.')
	}
}

export async function updateBalance( userId, newBalance ) {
	console.log(userId);
	try{
		const { data, error } = await supabase
			.from('users')
			.update({ balance: newBalance })
			.eq('id', userId)
			

		return data
	}catch (error) {
		console.error('Database Error:', error)
		throw new Error('Не удалось обновить баланс.')
		
	}
}

export async function fetchPointsActions(){
	try{
		const { data, error } = await supabase
			.from('point_actions')
			.select('*')
		
		return data
	}catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch points actions.')
	}
}






export async function createUser( name, email, password, role ) {

	try{
		const { data: response, error} = await supabase 
		.from('users')
		.insert({
			
			name: name,
			email: email,
			password: password,
			role: role,
			balance: 0,
		
		})
		.select()

		return response

		
	}catch(error){
		return { message: 'Ошибка в базе: не удалось создать пользователя', errors: {} }
	}

}


export async function deleteUser( id ) {

	try{
		const { data: response, error} = await supabase 
		.from('users')
		.delete()
		.eq('id', id)
		.select()

		return response

		
	}catch(error){
		return { message: 'Ошибка в базе: не удалось удалить пользователя', errors: {} }
	}
}

