'use client'

import { fetchUsers } from '@/app/lib/data';
import UsersTable from '@/app/ui/users/table';
import CreateUserForm from '@/app/ui/user/create-user-form';
import useSWR from 'swr'
import {InvoicesTableSkeleton} from '@/app/ui/skeletons';
import { Suspense } from 'react'
import { lusitana } from '@/app/ui/fonts';

export default   function Users(){
	
	const fetcher = url => fetch(url).then(res => res.json())

	const {
		data: users,
		error: usersError,
		mutate: usersMutate,
		isValidating
	} = useSWR(`/api/users`, fetcher)

	async function refetchUsers() {
		console.log('refetchUsers');
		await usersMutate()
	}

	return (
	  <div className="space-y-6">
      <CreateUserForm refetchUsers={refetchUsers} />

			 <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Сотрудники
      </h1>  

			{users &&

			(<Suspense fallback={<InvoicesTableSkeleton />}>
				<UsersTable users={users}     isLoading={isValidating} refetchUsers={refetchUsers}  /> 
			</Suspense>)}
			
    </div>
	);
};

