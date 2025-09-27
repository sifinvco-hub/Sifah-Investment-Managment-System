import React from 'react';
import { Product } from '../types';

interface LowStockAlertsProps {
    products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
    if (products.length === 0) {
        return null; // Don't render anything if there are no alerts
    }

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg shadow-md mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 mr-3 w-full">
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">تنبيهات انخفاض المخزون</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p className="mb-2">المنتجات التالية وصلت إلى حد الطلب أو أقل:</p>
                        <ul className="list-disc pl-5 rtl:pr-5 space-y-1">
                            {products.map(product => (
                                <li key={product.id}>
                                    <strong>{product.nameAr}</strong> (SKU: {product.sku}) - 
                                    الكمية الحالية: <span className="font-bold text-red-600 dark:text-red-400">{product.quantity}</span>, 
                                    حد الطلب: {product.minStockLevel ?? 5}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LowStockAlerts;
