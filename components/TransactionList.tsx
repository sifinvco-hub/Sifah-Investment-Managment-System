import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, User, Product } from '../types';
import { toDate } from '../App';

interface TransactionListProps {
    transactions: Transaction[];
    isFullPage: boolean;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transactionId: string) => void;
    currentUser?: User | null;
    products?: Product[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isFullPage, onEdit, onDelete, currentUser, products }) => {
    
    // State for full page view
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [filterProduct, setFilterProduct] = useState('all');

    const filteredTransactions = useMemo(() => {
        if (!isFullPage) return transactions;
        
        return transactions.filter(tx => {
            const searchTermMatch = searchTerm === '' ||
                tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tx.barcode && tx.barcode.includes(searchTerm)) ||
                (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.customerName && tx.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.invoiceNumber && tx.invoiceNumber.includes(searchTerm));
            
            const typeMatch = filterType === 'all' || tx.type === filterType;
            const productMatch = filterProduct === 'all' || tx.productId === filterProduct;
            
            return searchTermMatch && typeMatch && productMatch;
        });
    }, [transactions, isFullPage, searchTerm, filterType, filterProduct]);

    const getTypeClass = (type: TransactionType) => {
        switch (type) {
            case 'إضافة': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'صرف': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'إرجاع': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'جرد': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const getTransactionDetails = (tx: Transaction, excludeUser: boolean = false) => {
        let details = [];
        if(tx.customerName) details.push(`العميل: ${tx.customerName}`);
        if(tx.invoiceNumber) details.push(`فاتورة: ${tx.invoiceNumber}`);
        if(tx.notes) details.push(`البيان: ${tx.notes}`);
        if(tx.username && !excludeUser) details.push(`المستخدم: ${tx.username}`);
        return details.join(' | ');
    }

    if (!isFullPage) {
        // Dashboard view
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col max-h-96">
                <div className="p-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">آخر الحركات</h2>
                </div>
                <div className="overflow-y-auto flex-grow p-6 pt-0">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.slice(0, 20).map(tx => (
                            <li key={tx.id} className="py-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.productName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{toDate(tx.date).toLocaleString('ar-EG')}</p>
                                    </div>
                                    <div className={`text-sm font-semibold px-2 py-1 rounded-full ${getTypeClass(tx.type)}`}>
                                        {tx.type} ({tx.quantity})
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getTransactionDetails(tx)}</p>
                            </li>
                        ))}
                    </ul>
                    {transactions.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p>لا توجد حركات لعرضها.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    // Full Page view
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">سجل الحركات</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                     <input
                         type="text"
                         placeholder="ابحث..."
                         className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                     />
                     <select value={filterType} onChange={e => setFilterType(e.target.value as TransactionType | 'all')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                         <option value="all">كل الأنواع</option>
                         <option value="إضافة">إضافة</option>
                         <option value="صرف">صرف</option>
                         <option value="إرجاع">إرجاع</option>
                         <option value="جرد">جرد</option>
                     </select>
                     <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                         <option value="all">كل المنتجات</option>
                         {products?.map(p => <option key={p.id} value={p.id}>{p.nameAr}</option>)}
                     </select>
                 </div>
            </div>
            <div className="overflow-x-auto overflow-y-auto flex-grow">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">التاريخ</th>
                            <th scope="col" className="px-6 py-3">المنتج</th>
                            <th scope="col" className="px-6 py-3">النوع</th>
                            <th scope="col" className="px-6 py-3">الكمية</th>
                            <th scope="col" className="px-6 py-3">المستخدم</th>
                            <th scope="col" className="px-6 py-3">التفاصيل</th>
                            {currentUser?.role === 'admin' && <th scope="col" className="px-6 py-3">إجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap">{toDate(tx.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tx.productName}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeClass(tx.type)}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold">{tx.quantity}</td>
                                <td className="px-6 py-4">{tx.username}</td>
                                <td className="px-6 py-4 text-xs">{getTransactionDetails(tx, true)}</td>
                                {currentUser?.role === 'admin' && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <button onClick={() => onEdit && onEdit(tx)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">تعديل</button>
                                            <span className="text-gray-300 dark:text-gray-500">|</span>
                                            <button onClick={() => onDelete && onDelete(tx.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">حذف</button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>لا توجد حركات تطابق البحث.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList;