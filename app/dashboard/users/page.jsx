import { fetchUsers } from '@/app/lib/data';
import UsersTable from '@/app/ui/users/table';

export default async  function Users(){
	const users = await fetchUsers();
	console.log(users);
	
	return (
		<div>
			
			<UsersTable users={users} />
				
		</div>
	);
};

