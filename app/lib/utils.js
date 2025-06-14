export const formatDateToLocal = ( dateStr, locale = 'ru-RU' ) => {

	const date = new Date(dateStr)
	const options = {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}
	const formatter = new Intl.DateTimeFormat(locale, options)
	return formatter.format(date)
}


export function validateForm( amount, type, description ) {
	
	let errors = {}

	
	if (!amount || isNaN(amount)) errors.amount = 'Введите корректную сумму'
	if(amount <= 0) errors.amount = 'Сумма должна быть больше 0'
  if (!type) errors.type = 'Выберите тип операции'
	if(!description || description.trim() === '') errors.description = 'Введите описание операции'

	return errors
}

export function validateFormCreateUser( name, email, password, role ) {
	
	let errors = {}


	
	if (!name || name.trim() === '') errors.name = 'Введите имя пользователя'
	if(name.length < 3) errors.name = 'Имя должно быть не менее 3 символов'
	if (!email || email.trim() === '') errors.email = 'Введите email пользователя'
	if (!password || password.trim() === '') errors.password = 'Введите пароль пользователя'
	if(password.length < 6) errors.password = 'Пароль должен быть не менее 6 символов'
	if (!role) errors.role = 'Выберите роль пользователя'

	return errors
}

