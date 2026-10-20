import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { PostgrestClient } from '@supabase/postgrest-js'
import { normalizeEmail } from './utils'

// Только сервер: service role обходит RLS, поэтому ключ не должен попасть в браузер.
// Локально переменные берутся из .env.local, на Vercel — из Environment Variables.
// Клиент создаётся при первом запросе, а не при импорте: next build импортирует маршруты
// и не должен падать, если переменных нет в окружении сборки.
let client

function db() {
	if (client) return client

	const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
	// В Docker (docker-compose.yml) — адрес PostgREST напрямую, без шлюза Supabase (/rest/v1)
	const restUrl = process.env.SUPABASE_REST_URL
	// SUPABASE_SECRET_KEY — новый ключ sb_secret_… (облако), SUPABASE_SERVICE_ROLE_KEY — legacy (локальный CLI)
	const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!(url || restUrl) || !key) {
		throw new Error('Не заданы переменные окружения SUPABASE_URL и/или SUPABASE_SECRET_KEY')
	}

	// Из Supabase нужен только .from() — его даёт и клиент PostgREST
	client = restUrl
		? new PostgrestClient(restUrl, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
		: createClient(url, key, { auth: { persistSession: false } })
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
	const normalized = normalizeEmail(email)

	try {
		// limit(2), а не maybeSingle(): дубль должен стать ошибкой, а не «пользователь не найден»
		const { data, error } = await db()
			.from('users')
			.select('*')
			.eq('email', normalized)
			.limit(2)

		if (error) throw error

		if (data.length > 1) {
			throw new Error(`в users несколько строк с email ${normalized} — дубль нужно разобрать в базе`)
		}

		const user = data[0] ?? null

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
			.eq('email', normalizeEmail(email))
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






// Занятый email: вставку отклонил уникальный индекс users_email_lower_key (unique_violation).
// Проверка fetchUserByEmail до вставки не атомарна — гонку закрывает только база
export const isEmailTakenError = error => error?.code === '23505'

export async function createUser( name, email, password, role ) {
	const { data: response, error } = await db()
		.from('users')
		.insert({
			name,
			email: normalizeEmail(email),
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

