// Fix: Implement the UserManagementModal component.
import React, { useState } from 'react';
import Modal from './common/Modal';
import { User } from '../types';
import AddEditUserModal from './AddEditUserModal';

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onSaveUser: (user: Omit<User, 'id'> | User) => void;
    onDeleteUser: (userId: string) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, users, onSaveUser, onDeleteUser }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleAddUser = () => {
        setUserToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsAddEditModalOpen(true);
    };
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="إدارة المستخدمين">
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={handleAddUser} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            إضافة مستخدم جديد
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <span className="font-bold">{user.username}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">({user.role === 'admin' ? 'مدير' : 'مستخدم'})</span>
                                </div>
                                <div className="space-x-2 rtl:space-x-reverse">
                                    <button onClick={() => handleEditUser(user)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        تعديل
                                    </button>
                                    {users.length > 1 && user.role !== 'admin' && (
                                        <>
                                        <span className="text-gray-300 dark:text-gray-500">|</span>
                                        <button onClick={() => onDeleteUser(user.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                            حذف
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                            إغلاق
                        </button>
                    </div>
                </div>
            </Modal>
            
            <AddEditUserModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={onSaveUser}
                userToEdit={userToEdit}
            />
        </>
    );
};

export default UserManagementModal;
