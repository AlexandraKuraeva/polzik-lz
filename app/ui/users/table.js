import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
// import Search from '@/app/ui/search';

export default async function UsersTable({
	users}) {

    const url = '/dashboard/users';
  return (
    <div className="w-full">
       <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Сотрудники
      </h1> 
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
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.image_url}
                              className="rounded-full"
                              alt={`${user.name}'s profile picture`}
                              width={28}
                              height={28}
                            />
                            <p>{user.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.email}
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
                          <Image
                            src={user.image_url}
                            className="rounded-full"
                            alt={`${user.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{user.name}</p>
                        </div>
                        </Link>
                        
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                         {user.balance} 
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
