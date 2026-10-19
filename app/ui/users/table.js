"use client"


import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { UserAvatar } from '@/app/ui/user/user-avatar.jsx';
// import Search from '@/app/ui/search';
import { Button } from '@/app/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline';
import { actionDeleteUser } from '@/app/lib/actions'
import { TransactionsTableSkeleton } from '@/app/ui/skeletons'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Modal from '@/app/ui/modal/modal'


export default  function UsersTable({
	users, isLoading, refetchUsers}) {
  const { data: session } = useSession()
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  // Сотрудник, удаление которого нужно подтвердить
  const [userToDelete, setUserToDelete] = useState(null)

      if (isLoading) {
        return (
          < TransactionsTableSkeleton name="users" />
        )
      }

    const url = '/dashboard/users';

   async function handleDelete(id) {
     setDeleteError('')
     setDeletingId(id)

     try {
       const result = await actionDeleteUser(id)

       if (!result.success) {
         setDeleteError(result.message)
         return
       }

       setUserToDelete(null)
       await refetchUsers()
     } catch (error) {
       setDeleteError('Не удалось удалить пользователя')
     } finally {
       setDeletingId(null)
     }
    }

   function openDeleteConfirm(user) {
     setDeleteError('')
     setUserToDelete(user)
   }

   function closeDeleteConfirm() {
     // Не закрываем окно, пока идёт удаление
     if (deletingId) return
     setDeleteError('')
     setUserToDelete(null)
   }
  return (
    <div className="w-full">
      {userToDelete && (
        <Modal onClose={closeDeleteConfirm} title="Удаление сотрудника">
          <h2 className="pr-6 text-lg font-medium text-gray-900">
            Удалить сотрудника?
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{userToDelete.name}</span>
            {' '}({userToDelete.email}) будет удалён вместе со всей историей операций.
            Это действие нельзя отменить.
          </p>

          {deleteError && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
              {deleteError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDeleteConfirm}
              disabled={Boolean(deletingId)}
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => handleDelete(userToDelete.id)}
              disabled={Boolean(deletingId)}
              className="flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId ? 'Удаление…' : 'Удалить'}
            </button>
          </div>
        </Modal>
      )}

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
                        {String(session?.user?.id) === String(user.id) ? (
                          <span className="text-xs text-gray-400" title="Нельзя удалить текущего пользователя">
                            Текущий пользователь
                          </span>
                        ) : (
                        <button type='button' onClick={() => openDeleteConfirm(user)}
                        disabled={deletingId === user.id}
                        aria-label={`Удалить ${user.name}`}
                        title="Удалить"
                        className='group inline-flex items-center justify-center rounded-md  bg-gray-100 p-2 transition-all duration-200 hover:bg-primary/10' >
                          <TrashIcon className="h-6 w-6 text-gray-500 transition-colors duration-200 group-hover:text-primary" />
                        </button>
                        )}
                         
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
