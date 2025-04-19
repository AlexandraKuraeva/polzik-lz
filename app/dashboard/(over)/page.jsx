


import Link from 'next/link';
import { Suspense } from 'react';
import { Card } from '@/app/ui/user/card'
import { auth } from '@/auth';
import { getUser } from '@/app/lib/data'
import Image from 'next/image';



export default async   function Dashboard(){
	
	const session = await auth()

 

   const currentUser = await getUser(session.user.email)

  console.log("currentUser", currentUser);

  return <div>
    Привет  <span className="font-bold text-primary text-xl">{session ?.user?.name}</span>
    <p>А какую пользу принес ты?</p>

    <p>Здесь будет информация о пользователе</p>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
				<Card title='Баланс' value={currentUser.balance} type='collected' />
				<Card title='Потрачено' value={100} type='spent' />
				<Card title='Долг' value={100} type='debt' />
			</div>
    </div>
};

