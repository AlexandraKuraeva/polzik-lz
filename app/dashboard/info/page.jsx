import PointsTable from '@/app/ui/info/points-table'
import clsx from 'clsx'
import { lusitana } from '@/app/ui/fonts'

export default function Info() {
	return (
		<>
			<div className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
			Как заработать и на что потратить пользики
			</div>
			<PointsTable />
		</>
	)
}
