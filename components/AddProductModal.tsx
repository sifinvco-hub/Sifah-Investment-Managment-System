import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>) => void;
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
    const getInitialFormData = () => ({
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

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (editingProduct) {
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
                setFormData({
                    ...getInitialFormData(),
                    category: categories[0] || '',
                    unit: units[0] || '',
                    warehouse: warehouses[0] || '',
                });
            }
            setErrors({});
        }
    }, [editingProduct, isOpen, categories, units, warehouses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.sku.trim()) newErrors.sku = 'SKU مطلوب.';
        else {
            const isDuplicate = products.some(p => 
                p.sku.toLowerCase() === formData.sku.toLowerCase() && p.id !== editingProduct?.id
            );
            if(isDuplicate) newErrors.sku = 'SKU موجود بالفعل.';
        }
        if (!formData.nameAr.trim()) newErrors.nameAr = 'الاسم بالعربية مطلوب.';
        if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) newErrors.price = 'الرجاء إدخال سعر صحيح.';
        if (isNaN(parseInt(formData.quantity, 10)) || parseInt(formData.quantity, 10) < 0) newErrors.quantity = 'الرجاء إدخال كمية صحيحة.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const productData: Omit<Product, 'id'> = {
                sku: formData.sku.trim(),
                nameAr: formData.nameAr.trim(),
                nameEn: formData.nameEn.trim(),
                category: formData.category,
                unit: formData.unit,
                price: parseFloat(formData.price) || 0,
                quantity: parseInt(formData.quantity, 10) || 0,
                warehouse: formData.warehouse,
                location: formData.location.trim(),
                minStockLevel: parseInt(formData.minStockLevel, 10) || 5,
                barcode: formData.barcode.trim(),
                imageUrl: formData.imageUrl.trim(),
                description: formData.description.trim(),
            };
            onSave(productData);
        }
    };

    const title = editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image Upload Section */}
                    <div className="lg:col-span-1 space-y-2 flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">صورة المنتج</label>
                        <div className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-700">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="معاينة المنتج" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-xs mt-1">لا توجد صورة</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm py-1 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                {formData.imageUrl ? 'تغيير الصورة' : 'إضافة صورة'}
                            </button>
                            {formData.imageUrl && (
                                <button type="button" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))} className="text-sm py-1 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                                    إزالة
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input id="sku" name="sku" label="SKU (رقم التعريف)" value={formData.sku} onChange={handleChange} error={errors.sku} required />
                            <Input id="nameAr" name="nameAr" label="الاسم (بالعربية)" value={formData.nameAr} onChange={handleChange} error={errors.nameAr} required />
                            <Input id="nameEn" name="nameEn" label="الاسم (بالإنجليزية)" value={formData.nameEn} onChange={handleChange} />
                            <Input id="barcode" name="barcode" label="الباركود" value={formData.barcode} onChange={handleChange} />
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">النوع</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">الوحدة</label>
                                <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                   {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                </select>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input id="price" name="price" label="السعر" type="number" value={formData.price} onChange={handleChange} error={errors.price} required min="0" step="0.01" />
                            <Input id="quantity" name="quantity" label="الكمية" type="number" value={formData.quantity} onChange={handleChange} error={errors.quantity} required min="0" />
                            <Input id="minStockLevel" name="minStockLevel" label="حد الطلب" type="number" value={formData.minStockLevel} onChange={handleChange} min="0" />
                        </div>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="warehouse" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">المستودع</label>
                                <select id="warehouse" name="warehouse" value={formData.warehouse} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                   {warehouses.map(wh => <option key={wh} value={wh}>{wh}</option>)}
                                </select>
                            </div>
                            <Input id="location" name="location" label="الموقع في المستودع" value={formData.location} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">الوصف / المكونات</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder='للمنتجات المجمّعة، أدخل المكونات بصيغة JSON. مثال: [{"sku":"SKU1","quantity":2},{"sku":"SKU2","quantity":1}]'
                    />
                </div>

                <div className="mt-8 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        إلغاء
                    </button>
                    <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingProduct ? 'حفظ التعديلات' : 'حفظ المنتج'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddProductModal;