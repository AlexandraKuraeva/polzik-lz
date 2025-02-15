import {
	ArrowUpCircleIcon,
	ArrowDownCircleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function TypeOperation({ type }) {
	return (
		<span
			className={clsx(
				'inline-flex items-center rounded-full px-2 py-1 text-xs',
				{
					'bg-gray-100 text-gray-500': type === 'debit',
					'bg-green-500 text-white': type === 'credit',
				}
			)}
		>
			{type === 'debit' ? (
				<>
					Списание
					<ArrowDownCircleIcon className='ml-1 w-7 text-red-500' />
				</>
			) : null}
			{type === 'credit' ? (
				<>
          Пополнение
					<ArrowUpCircleIcon className='ml-1 w-7 text-white' />
				</>
			) : null}
		</span>
	)
}
