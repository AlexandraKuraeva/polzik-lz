


import Link from 'next/link';
import { Suspense } from 'react';
import { Card } from '@/app/ui/user/card'
import { auth } from '@/auth';
import { getUser, fetchTransactions } from '@/app/lib/data'
import Image from 'next/image';
import { RevenueChartSkeleton } from '@/app/ui/skeletons'
import HistoryTransactionsTable from '@/app/ui/user/table'



export default async   function Dashboard(){
	
	const session = await auth()
  const currentUser = await getUser(session.user.email)
  const transactions = await fetchTransactions(currentUser.id)

  return <>

   <div className="mb-5 flex items-center gap-2">
    Привет,  <span className="font-bold text-primary text-xl">{session ?.user?.name}!</span>
   <p>А какую пользу принес ты?</p>
   </div> 
  	<div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-2">
  		<Card title='Баланс' value={currentUser.balance} type='collected' />
  		{/* <Card title='Потрачено' value={100} type='spent' /> */}
  
  	</div>
    <h2 className='mb-5 text-xl' >Операции</h2>
    {transactions && (
        <Suspense fallback={<RevenueChartSkeleton />}>
          <HistoryTransactionsTable transactions={transactions} />
        </Suspense>
      )}
    </>
};

