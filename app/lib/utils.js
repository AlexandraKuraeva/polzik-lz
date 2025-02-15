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
