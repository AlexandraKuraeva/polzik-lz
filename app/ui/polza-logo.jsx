import Image from 'next/image'
import { lusitana } from './fonts'

export default function PolzaLogo() {
	return (
		<div
			className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
		>
      
      <Image
        src="/logo/polza-logo.png"
        alt="Logo"
        width={280}
        height={80}
        priority
        unoptimized
      />
      
		</div>
	)
}
