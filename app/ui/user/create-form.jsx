'use client'

//import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link'
import {
	CheckIcon,
	ClockIcon,
	CurrencyDollarIcon,
	UserCircleIcon,
	ArrowUpCircleIcon,
	ArrowDownCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/app/ui/button'
import { actionTransaction } from '@/app/lib/actions'
import { useActionState } from 'react'

export default function Form({ user }) {
	const initialState = {
		message: null,
		errors: {},
	}



	const [state, formAction, isProcessing] = useActionState(
		actionTransaction,
		initialState
	)

	return (
		<div className='w-full md:col-span-4'>
			<form action={formAction} >
				<input type='hidden' name='userId' value={user.id} />
				<div className='rounded-md bg-gray-50 p-4 md:p-6'>
					<div className='mb-4'>
						<span htmlFor='amount' className='mb-2 block text-sm font-medium'>
							Кому начислить
						</span>
						<div className='relative mt-2 rounded-md'>
							<div className='relative'>
								<div className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'>
									{user.name}
								</div>
								<UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
							</div>
						</div>
					</div>

					{/* Invoice Amount */}
					<div className='mb-4'>
						<label htmlFor='amount' className='mb-2 block text-sm font-medium'>
							Сколько
						</label>
						<div className='relative mt-2 rounded-md'>
							<div className='relative'>
								<input
									id='amount'
									name='amount'
									type='number'
									step='0.01'
									placeholder='Количество пользиков'
									className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
								/>
								<CurrencyDollarIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
							</div>
						</div>
						<div id='customer-error' aria-live='polite' aria-atomic='true'>
							{/* {state.errors?.amount &&
            state.errors.amount.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))} */}
						</div>
					</div>

					{/* Описание операции */}
					<div className='mb-4'>
						<label htmlFor='amount' className='mb-2 block text-sm font-medium'>
							Описание
						</label>
						<div className='relative mt-2 rounded-md'>
							<div className='relative'>
								<input
									id='description'
									name='description'
									type='text'
									step='0.01'
									placeholder='Описание операции'
									className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
								/>
								<CurrencyDollarIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
							</div>
						</div>
						<div id='customer-error' aria-live='polite' aria-atomic='true'>
							{/* {state.errors?.amount &&
            state.errors.amount.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))} */}
						</div>
					</div>

					{/* Тип операции */}
					<fieldset>
						<legend className='mb-2 block text-sm font-medium'>
							Тип операции
						</legend>
						<div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
							<div className='flex gap-4'>
								<div className='flex items-center'>
									<input
										id='credit'
										name='type'
										type='radio'
										value='credit'
										className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
									/>
									<label
										htmlFor='credit'
										className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
									>
										Начислить
										<ArrowUpCircleIcon className='h-6 w-6 text-green-500' />
									</label>
								</div>
								<div className='flex items-center '>
									<input
										id='debit'
										name='type'
										type='radio'
										value='debit'
										className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
									/>
									<label
										htmlFor='debit'
										className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
									>
										Списать
										<ArrowDownCircleIcon className='h-6 w-6 text-red-500 ' />
									</label>
								</div>
							</div>
						</div>
						<div id='customer-error' aria-live='polite' aria-atomic='true'>
							{/* {state.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))} */}
						</div>
					</fieldset>
				</div>
				<div className='mt-6 flex justify-end gap-4'>
					<Link
						href='/dashboard/users'
						className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
					>
						Назад
					</Link>
					<Button type='submit' disabled={isProcessing}>
						{isProcessing ? 'Загрузка...' : 'Сохранить'}
					</Button>
				</div>
			</form>
		</div>
	)
}
