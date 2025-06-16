import PointsTable from '@/app/ui/info/points-table'
import clsx from 'clsx'
import { lusitana } from '@/app/ui/fonts'
import { fetchPointsActions } from '@/app/lib/data';

export default async function Info() {

	const actions = await fetchPointsActions();

	const earnActions = actions.filter(action => action.type === 'earn');
	const spendActions = actions.filter(action => action.type === 'spend');

	return (
		<>
			<div className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
			Как заработать
			</div>
			<PointsTable actions={earnActions} />

			<div className={clsx(lusitana.className, 'flex text-xl md:text-2xl mt-9')}>
			На что потратить
			</div>
			<PointsTable actions={spendActions} />
		</>
	)
}
