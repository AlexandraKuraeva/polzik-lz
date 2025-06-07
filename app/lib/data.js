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

// Удалить после заполнения бд

const pointActions = [
  { title: "Написание кейса с нуля", points: 10 },
  { title: "Написание полезной статьи в корпоративное вики", points: 5 },
  { title: "Создание обучающего материала для команды", points: 8 },
  { title: "Подготовка доклада/презентации для команды, сбор команды для его презентации", points: 10 },
  { title: "Разработка и внедрение улучшений в процесс или создание нового процесса, улучшение сервиса/ускорение", points: 6 },
  { title: "Допродажа услуги клиенту или участие в допродаже/продаже", points: 10 },
  { title: "Участие во внешних конференциях", points: 5 },
  { title: "За выполнение KPI на проекте", points: 5 },
  { title: "За положительную ОС от клиента", points: 3 },
  { title: "За отзыв от клиента", points: 10 },
  { title: "За проведение эксперимента на проекте и написание статьи по результату", points: 10 },
  { title: "Приведи друга", points: 30 },
  { title: "За успешное прохождение курса, например, по SEO (кроме конверсий)", points: 10 },
  { title: "За самостоятельное написание статьи в блог", points: 6 },
  { title: "За помощь в написании статьи", points: 2 },
  { title: "Конспект по прочитанной книге для команды", points: 10 }
];

export  async function insertPointActions() {
  for (const action of pointActions) {
    try {
      const { data: response, error} = await supabase
				.from('point_actions')
				.insert({
					description: action.title,
					sum: action.points,
					type: 'earn'
				})
				.select()

			if (response.error) {
				console.error(`Ошибка сети при добавлении "${action.title}":`, response.error);
			}


			


    } catch (err) {
      console.error(`Ошибка сети при добавлении "${action.title}":`, err);
    }
  }
}


