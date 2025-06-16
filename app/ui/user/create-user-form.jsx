'use client'

import { useActionState, useState } from 'react'
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
				console.log('result', result)
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
			<form
				action={formAction}
				className='max-w-sm space-y-3 bg-white p-4 rounded-lg border border-gray-200 text-sm'
			>
				{/* Имя */}
				<div>
					<input
						type='text'
						name='name'
						placeholder='Имя'
						defaultValue={state?.data?.name}
						required
						className='w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500'
					/>
					{state?.errors?.name && (
						<p className='mt-1 text-xs text-red-500'>{state.errors.name}</p>
					)}
				</div>

				{/* Email */}
				<div>
					<input
						type='email'
						name='email'
						placeholder='Email'
						defaultValue={state?.data?.email}
						required
						className='w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500'
					/>
					{state?.errors?.email && (
						<p className='mt-1 text-xs text-red-500'>{state.errors.email}</p>
					)}
				</div>

				{/* Пароль */}
				<div>
					<input
						type='password'
						name='password'
						placeholder='Пароль'
						defaultValue={state?.data?.password}
						required
						className='w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500'
					/>
					{state?.errors?.password && (
						<p className='mt-1 text-xs text-red-500'>{state.errors.password}</p>
					)}
				</div>

				{/* Роль */}
				<fieldset className='space-y-1'>
					<div className='flex gap-2'>
						<label className='flex items-center gap-1'>
							<input
								type='radio'
								name='role'
								value='user'
								defaultChecked={state?.data?.role === 'user'}
								className='h-3 w-3 text-indigo-600'
							/>
							<span>Пользователь</span>
						</label>
						<label className='flex items-center gap-1'>
							<input
								type='radio'
								name='role'
								value='admin'
								defaultChecked={state?.data?.role === 'admin'}
								className='h-3 w-3 text-indigo-600'
							/>
							<span>Админ</span>
						</label>
					</div>
					{state?.errors?.role && (
						<p className='text-xs text-red-500'>{state.errors.role}</p>
					)}
				</fieldset>

				{/* Кнопка */}
				<Button
					type='submit'
					disabled={isProcessing}
					className='w-full bg-primary text-white py-2 px-3 rounded-md text-sm'
				>
					{isProcessing ? 'Добавляем...' : 'Добавить'}
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
