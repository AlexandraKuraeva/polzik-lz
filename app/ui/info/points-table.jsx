import React from 'react';
import clsx from 'clsx';
import { inter } from '@/app/ui/fonts';
import { fetchPointsActions } from '@/app/lib/data';

export default async function  PointsTable () {

	const actions = await fetchPointsActions();

	


	return (
    <div className="max-w-2xm mx-auto mt-8 p-2 pt-0 bg-white shadow rounded-lg">
     
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b">
            <th className="py-2">Действие</th>
            <th className="py-2 text-right">Пользики</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((item, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="py-2">{item.description}</td>
              <td className={`py-2 text-right font-semibold ${item.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                {item.type === 'earn' ? `+${item.sum}` : item.sum}
              </td>
            </tr>
          ))}
        </tbody> 
      </table>
    </div>
  );
};

