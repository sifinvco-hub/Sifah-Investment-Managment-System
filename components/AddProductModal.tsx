import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'> | Product) => void;
    editingProduct: Product | null;
    products: Product[];
    categories: string[];
    units: string[];
    warehouses: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingProduct,
    products,
    categories,
    units,
    warehouses
}) => {
    const getInitialState = () => ({
        sku: '',
        nameAr: '',
        nameEn: '',
        category: categories[0] || '',
        unit: units[0] || '',
        price: '',
        quantity: '',
        warehouse: warehouses[0] || '',
        location: '',
        minStockLevel: '5',
        barcode: '',
        imageUrl: '',
        description: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const isEditing = !!editingProduct;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && editingProduct) {
                setFormData({
                    sku: editingProduct.sku,
                    nameAr: editingProduct.nameAr,
                    nameEn: editingProduct.nameEn || '',
                    category: editingProduct.category,
                    unit: editingProduct.unit,
                    price: String(editingProduct.price),
                    quantity: String(editingProduct.quantity),
                    warehouse: editingProduct.warehouse,
                    location: editingProduct.location || '',
                    minStockLevel: String(editingProduct.minStockLevel ?? 5),
                    barcode: editingProduct.barcode || '',
                    imageUrl: editingProduct.imageUrl || '',
                    description: editingProduct.description || '',
                });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editingProduct, categories, units, warehouses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.sku.trim()) newErrors.sku = 'SKU مطلوب.';
        else if (products.some(p => p.sku.toLowerCase() === formData.sku.trim().toLowerCase() && p.id !== editingProduct?.id)) {
            newErrors.sku = 'SKU موجود بالفعل.';
        }
        if (!formData.nameAr.trim()) newErrors.nameAr = 'الاسم بالعربية مطلوب.';
        if (!formData.category) newErrors.category = 'النوع مطلوب.';
        if (!formData.unit) newErrors.unit = 'الوحدة مطلوبة.';
        if (!formData.warehouse) newErrors.warehouse = 'المستودع مطلوب.';
        if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
            newErrors.price = 'السعر يجب أن يكون رقمًا موجبًا.';
        }
        if (!isEditing && (formData.quantity === '' || isNaN(parseInt(formData.quantity, 10)) || parseInt(formData.quantity, 10) < 0)) {
            newErrors.quantity = 'الكمية يجب أن تكون رقمًا موجبًا.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const productData = {
                sku: formData.sku.trim(),
                nameAr: formData.nameAr.trim(),
                nameEn: formData.nameEn.trim(),
                category: formData.category,
                unit: formData.unit,
                price: parseFloat(formData.price),
                warehouse: formData.warehouse,
                location: formData.location.trim() || undefined,
                minStockLevel: parseInt(formData.minStockLevel, 10) || 5,
                barcode: formData.barcode.trim() || undefined,
                imageUrl: formData.imageUrl.trim() || undefined,
                description: formData.description.trim() || undefined,
            };

            if (isEditing && editingProduct) {
                onSave({
                    ...editingProduct,
                    ...productData,
                    quantity: editingProduct.quantity // Keep original quantity
                });
            } else {
                onSave({
                    ...productData,
                    quantity: parseInt(formData.quantity, 10) || 0
                });
            }
        }
    };

    const title = isEditing ? 'تعديل منتج' : 'إضافة منتج جديد';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="sku" name="sku" label="SKU / الرمز" value={formData.sku} onChange={handleChange} error={errors.sku} required />
                    <Input id="nameAr" name="nameAr" label="اسم المنتج (عربي)" value={formData.nameAr} onChange={handleChange} error={errors.nameAr} required />
                    <Input id="nameEn" name="nameEn" label="اسم المنتج (انجليزي)" value={formData.nameEn} onChange={handleChange} />
                    
                    <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">النوع</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                    </div>

                     <div>
                        <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">الوحدة</label>
                        <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
                    </div>
                    
                    <Input id="price" name="price" type="number" label="السعر" value={formData.price} onChange={handleChange} error={errors.price} min="0" step="0.01" required />
                    
                    <div>
                        <Input id="quantity" name="quantity" type="number" label="الكمية الافتتاحية" value={formData.quantity} onChange={handleChange} error={errors.quantity} min="0" required={!isEditing} disabled={isEditing} />
                        {isEditing && <p className="text-xs text-gray-500 -mt-3 pr-1">لا يمكن تعديل الكمية من هنا. استخدم حركات الإضافة والصرف.</p>}
                    </div>
                     
                     <div>
                        <label htmlFor="warehouse" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">المستودع</label>
                        <select id="warehouse" name="warehouse" value={formData.warehouse} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                           {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                         {errors.warehouse && <p className="mt-1 text-xs text-red-500">{errors.warehouse}</p>}
                    </div>

                    <Input id="minStockLevel" name="minStockLevel" type="number" label="حد الطلب (تنبيه)" value={formData.minStockLevel} onChange={handleChange} min="0" />
                    <Input id="barcode" name="barcode" label="الباركود" value={formData.barcode} onChange={handleChange} />
                    <Input id="location" name="location" label="الموقع في المستودع" value={formData.location} onChange={handleChange} />
                </div>
                 <div className="col-span-1 md:col-span-2">
                    <Input id="imageUrl" name="imageUrl" label="رابط الصورة (URL)" value={formData.imageUrl} onChange={handleChange} />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">وصف المنتج</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>

                 <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse border-t dark:border-gray-700 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddProductModal;
