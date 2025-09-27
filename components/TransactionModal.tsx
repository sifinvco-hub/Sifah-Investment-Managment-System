import React, { useState, useEffect } from 'react';
import { Product, TransactionType, TransactionPayload } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: TransactionPayload) => Promise<string | null>;
    product: Product | null;
    transactionType: TransactionType | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, product, transactionType }) => {
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setNotes('');
            setCustomerName('');
            setInvoiceNumber('');
            setError('');
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen || !product || !transactionType) return null;

    const handleSave = async () => {
        setError('');
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('الرجاء إدخال كمية صحيحة.');
            return;
        }

        setIsSaving(true);

        const payload: TransactionPayload = {
            productId: product.id,
            quantity: numQuantity,
            type: transactionType,
            notes: notes.trim(),
            customerName: customerName.trim(),
            invoiceNumber: invoiceNumber.trim()
        };

        const errorResult = await onSave(payload);
        setIsSaving(false);

        if (errorResult) {
            setError(errorResult);
        } else {
            onClose();
        }
    };

    const title = `${transactionType} للمنتج: ${product.nameAr}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.nameAr} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-grow text-sm text-gray-600 dark:text-gray-400">
                        <p>الكمية الحالية: <span className="font-bold text-lg text-gray-900 dark:text-white">{product.quantity}</span></p>
                        <p>الباركود: <span className="font-bold font-mono text-gray-900 dark:text-white">{product.barcode || 'لا يوجد'}</span></p>
                    </div>
                </div>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    label="الكمية"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    required
                />
                {(transactionType === 'صرف' || transactionType === 'إرجاع') && (
                     <Input
                        id="customerName"
                        name="customerName"
                        label="اسم العميل (اختياري)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                )}
                 {transactionType === 'إضافة' && (
                     <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        label="رقم الفاتورة (اختياري)"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                )}
                <Input
                    id="notes"
                    name="notes"
                    label="البيان / ملاحظات (اختياري)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" disabled={isSaving}>
                        إلغاء
                    </button>
                    <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TransactionModal;