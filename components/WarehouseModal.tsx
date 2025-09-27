
import React, { useState } from 'react';
import Modal from './common/Modal';

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouses: string[];
    onAdd: (warehouse: string) => void;
    onDelete: (warehouse: string) => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose, warehouses, onAdd, onDelete }) => {
    const [newWarehouse, setNewWarehouse] = useState('');

    const handleAdd = () => {
        if (newWarehouse.trim()) {
            onAdd(newWarehouse.trim());
            setNewWarehouse('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إدارة المستودعات">
            <div>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newWarehouse}
                        onChange={(e) => setNewWarehouse(e.target.value)}
                        placeholder="أضف مستودع جديد..."
                        className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                    <button onClick={handleAdd} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        إضافة
                    </button>
                </div>

                <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                    {warehouses.map(warehouse => (
                        <div key={warehouse} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <span>{warehouse}</span>
                            <button onClick={() => onDelete(warehouse)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    ))}
                    {warehouses.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">لا توجد مستودعات معرفة.</p>}
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        إغلاق
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default WarehouseModal;
