'use client'
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/app/ui/users/breadcrumbs'
import { fetchUserById, fetchTransactions } from '@/app/lib/data'

import HistoryTransactionsTable from '@/app/ui/user/table'

import { Card } from '@/app/ui/user/card'
import Form from '@/app/ui/user/create-form'

import { RevenueChartSkeleton } from '@/app/ui/skeletons'

export default function Page() {
	const { id } = useParams()

	const [user, setUser] = useState(null)
	const [transactions, setTransactions] = useState(null)

	useEffect(() => {
		async function loadData() {
			const fetchedUser = await fetchUserById(id)
			const fetchedTransactions = await fetchTransactions(id)

			setUser(fetchedUser)
			setTransactions(fetchedTransactions)
		}
		loadData()
	}, [id])

	async function refetchTransactions() {
		const updatedTransactions = await fetchTransactions(id)
		const fetchedUser = await fetchUserById(id)

		console.log('refetchTransactions')
		setTransactions(updatedTransactions)
		setUser(fetchedUser)
	}

	if (!user) return <div>Загрузка...</div>

	return (
		<>
			<Breadcrumbs
				breadcrumbs={[
					{ label: 'Users', href: '/dashboard/users' },
					{
						label: `Profile ${user.name}`,
						href: `/dashboard/users/${id}`,
						active: true,
					},
				]}
			/>

			<Suspense fallback={<div>Loading...</div>}>
				<Card title='Баланс' value={user.balance} type='collected' />
			</Suspense>

			<div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
				<Suspense fallback={<RevenueChartSkeleton />}>
					<Form user={user} refetchTransactions={refetchTransactions} />
				</Suspense>
				{transactions && (
					<Suspense fallback={<RevenueChartSkeleton />}>
						<HistoryTransactionsTable transactions={transactions} />
					</Suspense>
				)}
			</div>
		</>
	)
}
