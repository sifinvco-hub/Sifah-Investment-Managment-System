import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';

interface AddEditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> | User) => void;
    userToEdit: User | null;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const getInitialState = () => ({
        username: '',
        password: '',
        role: 'user' as 'admin' | 'user'
    });
    
    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFormData({
                    username: userToEdit.username,
                    password: '', // Don't show existing password
                    role: userToEdit.role,
                });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
        }
    }, [isOpen, userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.username.trim()) {
            newErrors.username = 'اسم المستخدم مطلوب.';
        }
        if (!userToEdit && !formData.password) { // Password is required for new users only
            newErrors.password = 'كلمة المرور مطلوبة.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const userData: { username: string; role: 'admin' | 'user'; password?: string } = {
                username: formData.username,
                role: formData.role
            };

            if (userToEdit) {
                // If password is not changed, don't send it
                if (formData.password) {
                    userData.password = formData.password;
                }
                onSave({ ...userToEdit, ...userData });
            } else {
                userData.password = formData.password;
                onSave(userData as Omit<User, 'id'>);
            }
            onClose();
        }
    };

    const title = userToEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="username"
                    name="username"
                    label="اسم المستخدم"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                />
                <Input
                    id="password"
                    name="password"
                    type="password"
                    label="كلمة المرور"
                    placeholder={userToEdit ? 'اتركه فارغاً لعدم التغيير' : ''}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required={!userToEdit}
                />
                <div>
                    <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">الصلاحية</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        disabled={userToEdit?.role === 'admin' && userToEdit.username === 'admin'}
                    >
                        <option value="user">مستخدم</option>
                        <option value="admin">مدير</option>
                    </select>
                </div>

                <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        إلغاء
                    </button>
                    <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {userToEdit ? 'حفظ التعديلات' : 'حفظ المستخدم'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEditUserModal;
