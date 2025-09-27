import React, { useState, useMemo } from 'react';
import { Product, TransactionType, User } from '../types';

interface ProductListProps {
    products: Product[];
    onTransaction: (product: Product, type: TransactionType) => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    categories: string[];
    warehouses: string[];
    currentUser: User | null;
}

const ProductList: React.FC<ProductListProps> = ({ products, onTransaction, onEdit, onDelete, categories, warehouses, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterWarehouse, setFilterWarehouse] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>({ key: 'nameAr', direction: 'asc' });

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(p =>
            (p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (filterCategory === 'all' || p.category === filterCategory) &&
            (filterWarehouse === 'all' || p.warehouse === filterWarehouse)
        );

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [products, searchTerm, filterCategory, filterWarehouse, sortConfig]);

    const requestSort = (key: keyof Product) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIndicator = (key: keyof Product) => {
        if (!sortConfig || sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">قائمة المنتجات</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                     <input
                         type="text"
                         placeholder="ابحث بالاسم, SKU, أو الباركود..."
                         className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                     />
                     <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                         <option value="all">كل الأنواع</option>
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                         <option value="all">كل المستودعات</option>
                         {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                     </select>
                 </div>
            </div>
            <div className="overflow-x-auto overflow-y-auto flex-grow">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('nameAr')}>المنتج {getSortIndicator('nameAr')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('sku')}>SKU {getSortIndicator('sku')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('category')}>النوع {getSortIndicator('category')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('quantity')}>الكمية {getSortIndicator('quantity')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('price')}>السعر {getSortIndicator('price')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('warehouse')}>المستودع {getSortIndicator('warehouse')}</th>
                            <th scope="col" className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedProducts.map(product => (
                            <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img className="w-10 h-10 rounded-md object-cover bg-gray-200" src={product.imageUrl || 'https://via.placeholder.com/40'} alt={product.nameAr}/>
                                        <div>
                                            <div className="font-bold">{product.nameAr}</div>
                                            <div className="text-xs text-gray-500">{product.nameEn}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono">{product.sku}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.quantity <= (product.minStockLevel ?? 5) ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                        {product.quantity} {product.unit}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{product.price.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })}</td>
                                <td className="px-6 py-4">{product.warehouse}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <button onClick={() => onTransaction(product, 'إضافة')} className="font-medium text-green-600 dark:text-green-500 hover:underline">إضافة</button>
                                        <span className="text-gray-300 dark:text-gray-500">|</span>
                                        <button onClick={() => onTransaction(product, 'صرف')} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">صرف</button>
                                        <span className="text-gray-300 dark:text-gray-500">|</span>
                                        <button onClick={() => onTransaction(product, 'إرجاع')} className="font-medium text-purple-600 dark:text-purple-500 hover:underline">إرجاع</button>
                                        <span className="text-gray-300 dark:text-gray-500">|</span>
                                        <button onClick={() => onEdit(product)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">تعديل</button>
                                        {currentUser?.role === 'admin' && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-500">|</span>
                                                <button onClick={() => onDelete(product.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">حذف</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>لا توجد منتجات تطابق البحث.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;