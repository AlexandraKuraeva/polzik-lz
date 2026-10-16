import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Только сервер: service role обходит RLS, поэтому ключ не должен попасть в браузер.
// Локально переменные берутся из .env.local, на Vercel — из Environment Variables.
// Клиент создаётся при первом запросе, а не при импорте: next build импортирует маршруты
// и не должен падать, если переменных нет в окружении сборки.
let client

function db() {
	if (client) return client

	const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
	// SUPABASE_SECRET_KEY — новый ключ sb_secret_… (облако), SUPABASE_SERVICE_ROLE_KEY — legacy (локальный CLI)
	const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!url || !key) {
		throw new Error('Не заданы переменные окружения SUPABASE_URL и/или SUPABASE_SECRET_KEY')
	}

	client = createClient(url, key, { auth: { persistSession: false } })
	return client
}

// Поля, которые можно отдавать наружу. password сюда не входит —
// его читает только fetchUserByEmail для проверки при входе.
const PUBLIC_USER_FIELDS = 'id, name, email, role, balance, created_at'


export async function fetchUsers() {
	try {
		const { data, error } = await db()
			.from('users')
			.select(PUBLIC_USER_FIELDS)
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
		const { data, error } = await db()
			.from('users')
			.select(PUBLIC_USER_FIELDS)
			.eq('id', id)
			.maybeSingle()

		if (error) throw error

		const user = data

		return user
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoice.')
	}
}
export async function fetchUserByEmail(email) {
	try {
		const { data, error } = await db()
			.from('users')
			.select('*')
			.eq('email', email)
			.maybeSingle()

		if (error?.code === 'PGRST116') return null
		if (error) throw error

		const user = data

		return user
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error(`Failed to fetch user by email: ${error?.code ?? ''} ${error?.message ?? error}`)
	}
}

export async function getUser(email) {
	
	try {
		const { data, error } = await db()
			.from('users')
			.select(PUBLIC_USER_FIELDS)
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
		const { data, error } = await db()
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
		const { data: response, error} = await db() 
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
		const { data, error } = await db()
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
		const { data, error } = await db()
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
		const { data, error } = await db()
			.from('point_actions')
			.select('*')
			.order('created_at', { ascending: true })
		
		return data
	}catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch points actions.')
	}
}






export async function createUser( name, email, password, role ) {
	const { data: response, error } = await db()
		.from('users')
		.insert({
			name,
			email,
			password,
			role,
			balance: 0,
		})
		.select()

	if (error) throw error

	return response

}


export async function deleteUser( id ) {
	const { error: transactionsError } = await db()
		.from('transactions')
		.delete()
		.eq('user_id', id)

	if (transactionsError) throw transactionsError

	const { data: response, error } = await db()
		.from('users')
		.delete()
		.eq('id', id)
		.select()

	if (error) throw error

	return response
}

