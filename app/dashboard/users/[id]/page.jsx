'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import useSWR, { SWRConfig } from 'swr'
import Breadcrumbs from '@/app/ui/users/breadcrumbs'
import { fetchTransactions } from '@/app/lib/data'
import HistoryTransactionsTable from '@/app/ui/user/table'
import { Card } from '@/app/ui/user/card'
import Form from '@/app/ui/user/create-form'
import { RevenueChartSkeleton } from '@/app/ui/skeletons'

export default function Page() {
	const params = useParams()
	const id = params.id

	const fetcher = url => fetch(url).then(res => res.json())

	const {
		data: user,
		error: userError,
		mutate: userMutate,
	} = useSWR(`/api/users/${id}`, fetcher)


	const {
		data: transactions,
		error: transactionsError,
		mutate: transactionsMutate,
		isValidating  
	} = useSWR(`/api/transactions/${id}`, fetcher)



	async function refetchTransactions() {
		await Promise.all[(transactionsMutate(), userMutate())]
	}

	return (
		<>
			{user ? (
				<>
					<Breadcrumbs
						breadcrumbs={[
							{ label: 'Сотрудники', href: '/dashboard/users' },
							{
								label: `Профиль ${user.name}`,
								href: `/dashboard/users/${id}`,
								active: true,
							},
						]}
					/>

					<Suspense fallback={<div>Загрузка...</div>}>
						<Card title='Баланс' value={user.balance} type='collected' />
					</Suspense>

					<div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
						<Suspense fallback={<RevenueChartSkeleton />}>
							<Form user={user} refetchTransactions={refetchTransactions} />
						</Suspense>
						{transactions && (
							<Suspense fallback={<RevenueChartSkeleton />}>
								<HistoryTransactionsTable transactions={transactions} isLoading={isValidating}  />
							</Suspense>
						)}
					</div>
				</>
			) : (
				<RevenueChartSkeleton />
			)}
		</>
	)
}
