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