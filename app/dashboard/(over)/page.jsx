import Link from 'next/link';

export default async  function Dashboard(){
	
	
	return (
		<div>
			
			<Link href="dashboard/users" className='text-blue-600  '>Любимые роднули!</Link>
				
		</div>
	);
};

