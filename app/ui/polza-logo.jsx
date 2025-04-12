import Image from 'next/image'
import { lusitana } from './fonts'

export default function PolzaLogo() {
	return (
		<div
			className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
		>
      
      <Image
        src="/logo/P-polza.svg"
        alt="Logo"
        width={80}
        height={80}
        priority
      />
      
		</div>
	)
}
