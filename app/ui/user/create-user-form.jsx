'use client'

import { useActionState, useState  } from 'react'
import { actionCreateUser } from '@/app/lib/actions'
import { Button } from '@/app/ui/button'
//import Modal from '@/app/ui/modal/modal'

export default function CreateUserForm({ refetchUsers }) {
	const initialState = {
		data: {},
		errors: {},
	}

	// const [showModal, setShowModal] = useState(false)
	// const [modalText, setModalText] = useState('')

	const [state, formAction, isProcessing] = useActionState(
		async (prevState, formData) => {
			const result = await actionCreateUser(prevState, formData)

			if (result) {
				console.log('result', result);
				// setModalText('Пользователь успешно создан!')
				// setShowModal(true)
				refetchUsers()
			}
			return result
		},

		initialState
	)

	return (
		<>
			<form action={formAction} className='space-y-4 max-w-md'>
				<div className='relative mt-2 rounded-md'>
					<div className='relative'>
						<input
							type='text'
							name='name'
							placeholder='Имя'
							defaultValue={state?.data?.name}
							required
							className='border p-2 w-full'
						/>
					</div>
				</div>
				<div id='customer-error' aria-live='polite' aria-atomic='true'>
					{state?.errors?.name && (
						<p className='mt-2 text-sm text-red-500'>{state.errors.name}</p>
					)}
				</div>

				<div className='relative mt-2 rounded-md'>
					<div className='relative'>
						<input
							type='email'
							name='email'
							placeholder='Email'
							defaultValue={state?.data?.email}
							required
							className='border p-2 w-full'
						/>
					</div>
				</div>
				<div id='customer-error' aria-live='polite' aria-atomic='true'>
					{state?.errors?.email && (
						<p className='mt-2 text-sm text-red-500'>{state.errors.email}</p>
					)}
				</div>

				<div className='relative mt-2 rounded-md'>
					<div className='relative'>
						<input
							type='password'
							name='password'
							placeholder='Пароль'
							defaultValue={state?.data?.password}
							required
							className='border p-2 w-full'
						/>
					</div>
				</div>
				<div id='customer-error' aria-live='polite' aria-atomic='true'>
					{state?.errors?.password && (
						<p className='mt-2 text-sm text-red-500'>{state.errors.password}</p>
					)}
				</div>
				{/* Роль */}
				<fieldset>
					<div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
						<div className='flex gap-4'>
							<div className='flex items-center'>
								<input
									id='user'
									name='role'
									type='radio'
									value='user'
									defaultChecked={state?.data?.role === 'user'}
									className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
								/>
								<label
									htmlFor='user'
									className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
								>
									Пользователь
									{/* <ArrowUpCircleIcon className='h-6 w-6 text-green-500' /> */}
								</label>
							</div>
							<div className='flex items-center '>
								<input
									id='admin'
									name='role'
									type='radio'
									value='admin'
									defaultChecked={state?.data?.role === 'admin'}
									className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
								/>
								<label
									htmlFor='admin'
									className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
								>
									Админ
									{/* <ArrowDownCircleIcon className='h-6 w-6 text-red-500 ' /> */}
								</label>
							</div>
						</div>
					</div>
					<div id='customer-error' aria-live='polite' aria-atomic='true'>
						{state?.errors?.role && (
							<p className='mt-2 text-sm text-red-500'>{state.errors.role}</p>
						)}
					</div>
				</fieldset>
				<Button type='submit' disabled={isProcessing}>
					{isProcessing ? 'Создание...' : 'Создать пользователя'}
				</Button>
			</form>
{/* 
			{showModal && (
				<Modal onClose={() => setShowModal(false)}>
					<p>{modalText}</p>
				</Modal>
			)} */}
		</>
	)
}
