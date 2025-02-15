import Breadcrumbs from "@/app/ui/users/breadcrumbs";
import { fetchUserById } from "@/app/lib/data";
import {Card} from "@/app/ui/user/card";
import Form from "@/app/ui/user/create-form";
import HistoryTransactionsTable from "@/app/ui/user/table";


export default async function Page({ params }) {

	
	
	const {id}= await params;
	
  const user = await fetchUserById(id);
  

	
	return (
		<>
		
			<Breadcrumbs breadcrumbs={[
				{ label: 'Users', href: '/dashboard/users' }, { label: `Profile ${user.name}`, href: `/dashboard/users/${id}`, active: true }
				]} />
			<Card title="Баланс" value={user.balance} type="collected" />

			<Form user={user} />

			<HistoryTransactionsTable userId={id} />
		</>
	)
}