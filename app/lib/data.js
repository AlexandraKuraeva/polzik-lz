import { createClient } from '@supabase/supabase-js'


export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)



export async function fetchUsers() {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.order('name', { ascending: true })

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

		console.log(id);
		const user = data
		return user
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoice.')
	}
}


export async function fetchTransactions({ userId }) {


	
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