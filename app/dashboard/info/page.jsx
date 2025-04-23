'use client'

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card } from '@/app/ui/user/card'
import { auth } from '@/auth';


export default   function Info(){
	

	return(
		<div>
			<h1>Информация</h1>
			<p>Здесь будет информация о том, как можно получить пользики</p>
			
		</div>
	)
		
};

