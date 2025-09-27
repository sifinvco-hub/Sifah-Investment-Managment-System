import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';

const EditTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactionId: string, updatedData: { quantity: number; date: string; notes?: string; customerName?: string; invoiceNumber?: string; }) => Promise<string | null>;
    transaction: Transaction | null;
}> = ({ isOpen, onClose, onSave, transaction }) => {
    const [formData, setFormData] = useState({
        quantity: '',
        date: '',
        notes: '',
        customerName: '',
        invoiceNumber: '',
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && transaction) {
            setFormData({
                quantity: String(transaction.quantity),
                date: transaction.date.split('T')[0], // Format ISO string for date input
                notes: transaction.notes || '',
                customerName: transaction.customerName || '',
                invoiceNumber: transaction.invoiceNumber || '',
            });
            setError('');
            setIsSaving(false);
        }
    }, [isOpen, transaction]);
    
    if (!isOpen || !transaction) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = async () => {
        setError('');
        const numQuantity = parseInt(formData.quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('الرجاء إدخال كمية صحيحة.');
            return;
        }

        if (!formData.date) {
            setError('الرجاء إدخال تاريخ صحيح.');
            return;
        }

        setIsSaving(true);
        const updatedData = {
            quantity: numQuantity,
            date: new Date(formData.date).toISOString(),
            notes: formData.notes.trim(),
            customerName: formData.customerName.trim(),
            invoiceNumber: formData.invoiceNumber.trim()
        };
        
        const errorResult = await onSave(transaction.id, updatedData);
        setIsSaving(false);

        if (errorResult) {
            setError(errorResult);
        } else {
            onClose();
        }
    };

    const title = `تعديل حركة للمنتج: ${transaction.productName}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    label="الكمية"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                />
                <Input
                    id="date"
                    name="date"
                    type="date"
                    label="التاريخ"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
                {(transaction.type === 'صرف' || transaction.type === 'إرجاع') && (
                     <Input
                        id="customerName"
                        name="customerName"
                        label="اسم العميل (اختياري)"
                        value={formData.customerName}
                        onChange={handleChange}
                    />
                )}
                 {transaction.type === 'إضافة' && (
                     <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        label="رقم الفاتورة (اختياري)"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                    />
                )}
                <div>
                     <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">البيان / ملاحظات (اختياري)</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" disabled={isSaving}>
                        إلغاء
                    </button>
                    <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditTransactionModal;