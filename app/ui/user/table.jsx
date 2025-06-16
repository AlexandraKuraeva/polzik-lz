import TypeOperation from '@/app/ui/user/type-operation'
import { formatDateToLocal } from '@/app/lib/utils'
import { TransactionsTableSkeleton } from '@/app/ui/skeletons'

export default function HistoryTransactionsTable({ transactions, isLoading }) {

	if (isLoading) {
		return (
			< TransactionsTableSkeleton name="transactions" />
		)
	}

	return (
		<>
			{transactions.length > 0 ? (
				<div className='flex w-full flex-col md:col-span-4'>
					<div className='inline-block min-w-full align-middle'>
						<div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
							<div className='md:hidden'>
								{transactions?.map(transaction => (
									<div
										key={transaction.id}
										className='mb-2 w-full rounded-md bg-white p-4'
									>
										<div className='flex items-center justify-between border-b pb-4'>
											<div>
												<p className='text-sm text-gray-500'>Операция</p>
											</div>
											Сумма
										</div>
										<div className='flex w-full items-center justify-between pt-4'>
											<div>
												<p className='text-xl font-medium'>
													{transaction.type}
												</p>
												<p>{transaction.description}</p>
											</div>
											{transaction.amount}
										</div>
									</div>
								))}
							</div>
							<table className='hidden min-w-full text-gray-900 md:table'>
								<thead className='rounded-lg text-left text-sm font-normal'>
									<tr>
										<th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
											Операция
										</th>
										<th scope='col' className='px-3 py-5 font-medium'>
											Описание
										</th>
										<th scope='col' className='px-3 py-5 font-medium'>
											Сумма
										</th>
										<th scope='col' className='px-3 py-5 font-medium'>
											Дата
										</th>

										{/* <th scope='col' className='relative py-3 pl-6 pr-3'>
										<span className='sr-only'>Edit</span>
									</th> */}
									</tr>
								</thead>
								<tbody className='bg-white'>
									{transactions?.map(transaction => (
										<tr
											key={transaction.id}
											className='w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
										>
											<td className='whitespace-nowrap px-3 py-3'>
												<TypeOperation type={transaction.type} />
											</td>
											<td className='whitespace-nowrap px-3 py-3'>
												{transaction.description}
											</td>
											<td className='whitespace-nowrap px-3 py-3'>
												{transaction.amount}
											</td>
											<td className='whitespace-nowrap px-3 py-3'>
												{formatDateToLocal(transaction.date)}
											</td>
											{/* <td className='whitespace-nowrap py-3 pl-6 pr-3'>
											<div className='flex justify-end gap-3'>
												 <UpdateInvoice id={invoice.id} />
												<DeleteInvoice id={invoice.id} /> 
											</div>
										</td> */}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			) : (
				<div className='flex w-full flex-col md:col-span-4'>
					<p className='text-center text-gray-500'>Нет операций</p>
				</div>
			)}
		</>
	)
}
