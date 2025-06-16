"use client"


import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { UserAvatar } from '@/app/ui/user/user-avatar.jsx';
// import Search from '@/app/ui/search';
import { Button } from '@/app/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteUser } from '@/app/lib/data'
import { TransactionsTableSkeleton } from '@/app/ui/skeletons'


export default  function UsersTable({
	users, isLoading, refetchUsers}) {

      if (isLoading) {
        return (
          < TransactionsTableSkeleton name="users" />
        )
      }

    const url = '/dashboard/users';

   async function handleDelete(id) {
      
     const delUser = await deleteUser(id);

     if(delUser){
      

      refetchUsers();
     }
    }
  return (
    <div className="w-full">
      
      {/* <Search placeholder="Search users..." /> */}
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <Link href={`${url}/${user.id}`}>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-4">
                            {/* <Image
                              src={user.image_url}
                              className="rounded-full"
                              alt={`${user.name}'s profile picture`}
                              width={28}
                              height={28}
                            /> */}
                            <UserAvatar name={user.name} />
                            <p>{user.name}</p>
                            {/* <TrashIcon className="h-4 w-4 cursor-pointer " /> */}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-800">
                          {user.role}
                        </p>
                        </Link>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="text-sm text-gray-500">Balance</p>
                      </div>
                      <div className="flex w-1/2 flex-col">
                       {user.balance}
                      </div>
                    </div>
                   
                  </div>
                ))}
              </div>
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Имя
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Роль
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Баланс
                    </th>
                   
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {users.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                      <Link href={`${url}/${user.id}`}>
                        <div className="flex items-center gap-3">
                          {/* <Image
                            src={user.image_url}
                            className="rounded-full"
                            alt={`${user.name}'s profile picture`}
                            width={28}
                            height={28}
                          /> */}
                          <UserAvatar name={user.name} />
                          <p>{user.name}</p>
                        </div>
                        </Link>
                        
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.email}
                      </td>

                        <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                         {user.balance} 
                      </td>
                    
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm ">
                        <button type='button' onClick={() => handleDelete(user.id)} 
                        className='group inline-flex items-center justify-center rounded-md  bg-gray-100 p-2 transition-all duration-200 hover:bg-primary/10' >
                          <TrashIcon className="h-6 w-6 text-gray-500 transition-colors duration-200 group-hover:text-primary" />
                        </button>
                         
                      </td>

                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
