import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './common/Modal';

interface StockTakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: {productId: string; expectedQuantity: number; countedQuantity: number}[]) => void;
    products: Product[];
}

const StockTakeModal: React.FC<StockTakeModalProps> = ({ isOpen, onClose, onSave, products }) => {
    const [countedItems, setCountedItems] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        if (isOpen) {
            setCountedItems(new Map());
        }
    }, [isOpen]);

    const handleCountChange = (productId: string, count: string) => {
        const newCounts = new Map(countedItems);
        // Allow empty string for clearing input, and only non-negative integers
        if (count === '' || /^\d*$/.test(count)) {
            newCounts.set(productId, count);
            setCountedItems(newCounts);
        }
    };

    const handleSave = () => {
        const stockTakeItems = products.map(product => ({
            productId: product.id,
            expectedQuantity: product.quantity,
            // Use counted value, or default to expected if not touched
            countedQuantity: countedItems.get(product.id) === '' || countedItems.get(product.id) === undefined 
                             ? product.quantity 
                             : parseInt(countedItems.get(product.id)!, 10),
        }));
        onSave(stockTakeItems);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="جرد المخزون">
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">أدخل الكميات الفعلية للمنتجات. أي حقل يترك فارغاً سيعتبر مطابقاً للكمية المسجلة.</p>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">المنتج</th>
                            <th scope="col" className="px-6 py-3">الكمية المسجلة</th>
                            <th scope="col" className="px-6 py-3">الكمية الفعلية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.nameAr}</td>
                                <td className="px-6 py-4">{product.quantity}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder={product.quantity.toString()}
                                        value={countedItems.get(product.id) ?? ''}
                                        onChange={(e) => handleCountChange(product.id, e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse">
                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                    إلغاء
                </button>
                <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    حفظ الجرد وتحديث الكميات
                </button>
            </div>
        </Modal>
    );
};

export default StockTakeModal;
