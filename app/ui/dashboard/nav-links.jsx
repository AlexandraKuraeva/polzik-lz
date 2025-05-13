'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useSession } from "next-auth/react"

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.


export default function NavLinks() {

  const pathname = usePathname();

  const { data }  = useSession();
  
  const role = data?.user?.role

  console.log(role);

  const links = [
    { name: 'Главная', href: '/dashboard', icon: HomeIcon },
   
    ...(role === 'admin' ? [
      {
        name: 'Сотрудники',
        href: '/dashboard/users',
        icon: UserGroupIcon,
      }
    ] : []),
    { name: 'Полезная информация', href: '/dashboard/info', icon: DocumentDuplicateIcon },
  ];

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium  hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3", 
            { 
              'bg-primary/10 text-primary': pathname === link.href
            })}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
