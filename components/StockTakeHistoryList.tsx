import React, { useState } from 'react';
import { StockTake } from '../types';
import { toDate } from '../App';

interface StockTakeHistoryListProps {
    stockTakes: StockTake[];
}

const StockTakeHistoryList: React.FC<StockTakeHistoryListProps> = ({ stockTakes }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col max-h-96">
            <div className="p-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">سجل الجرد</h2>
            </div>
            <div className="overflow-y-auto flex-grow p-6 pt-0 space-y-2">
                {stockTakes.map(stockTake => (
                    <div key={stockTake.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <button 
                            className="w-full text-right p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => toggleExpand(stockTake.id)}
                        >
                            <span className="font-semibold">جرد بتاريخ: {toDate(stockTake.date).toLocaleDateString('ar-EG')}</span>
                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedId === stockTake.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {expandedId === stockTake.id && (
                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-2">المنتج</th>
                                            <th className="px-4 py-2">المسجل</th>
                                            <th className="px-4 py-2">الفعلي</th>
                                            <th className="px-4 py-2">الفرق</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockTake.items.filter(item => item.discrepancy !== 0).map(item => (
                                            <tr key={item.productId} className="border-b dark:border-gray-700 last:border-b-0">
                                                <td className="px-4 py-2 font-medium">{item.productName}</td>
                                                <td className="px-4 py-2">{item.expectedQuantity}</td>
                                                <td className="px-4 py-2">{item.countedQuantity}</td>
                                                <td className={`px-4 py-2 font-bold ${item.discrepancy > 0 ? 'text-green-500' : item.discrepancy < 0 ? 'text-red-500' : ''}`}>
                                                    {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {stockTake.items.every(item => item.discrepancy === 0) && (
                                     <p className="text-center py-4 text-gray-500 dark:text-gray-400">لا يوجد فروقات في هذا الجرد.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                 {stockTakes.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>لا يوجد سجلات جرد لعرضها.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockTakeHistoryList;