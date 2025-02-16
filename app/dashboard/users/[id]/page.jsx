

import { Suspense } from 'react'
import Breadcrumbs from '@/app/ui/users/breadcrumbs'
import { fetchUserById, fetchTransactions } from '@/app/lib/data'

import HistoryTransactionsTable from '@/app/ui/user/table'


import { Card } from '@/app/ui/user/card'
import Form from '@/app/ui/user/create-form'

import { RevenueChartSkeleton } from '@/app/ui/skeletons'


export default async function Page({ params }) {

	const { id } = await params
	const user = await fetchUserById(id)

	

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
					<Form user={user}  />
				</Suspense>

				<Suspense fallback={<RevenueChartSkeleton />}>
					<HistoryTransactionsTable userId={id} />
				</Suspense>
			</div>


		</>
	)
}
