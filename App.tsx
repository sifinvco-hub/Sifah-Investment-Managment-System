import React, { useState, useEffect, useCallback } from 'react';
import { Product, Transaction, StockTake, User, TransactionType, View, TransactionPayload } from './types';
import api from './services/api';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import AddProductModal from './components/AddProductModal';
import TransactionModal from './components/TransactionModal';
import TransactionList from './components/TransactionList';
import StockTakeModal from './components/StockTakeModal';
import StockTakeHistoryList from './components/StockTakeHistoryList';
import CategoryModal from './components/CategoryModal';
import UnitModal from './components/UnitModal';
import WarehouseModal from './components/WarehouseModal';
import LowStockAlerts from './components/LowStockAlerts';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import UserManagementModal from './components/UserManagementModal';
import Reports from './components/Reports';
import AlertModal from './components/common/AlertModal';
import ConfirmModal from './components/common/ConfirmModal';
import EditTransactionModal from './components/EditTransactionModal';

// Helper to convert ISO strings to Date objects
export const toDate = (date: string): Date => {
    if (!date) return new Date();
    return new Date(date);
};

const App: React.FC = () => {
    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [warehouses, setWarehouses] = useState<string[]>([]);
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [currentView, setCurrentView] = useState<View>('dashboard');
    
    // Modal states
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isStockTakeModalOpen, setIsStockTakeModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
    const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);

    // Data for modals
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [transactionProduct, setTransactionProduct] = useState<Product | null>(null);
    const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Alert and Confirm Modals State
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    // --- Data Loading ---
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.fetchAllData();
            setProducts(data.products);
            setTransactions(data.transactions);
            setStockTakes(data.stockTakes);
            setUsers(data.users);
            setCategories(data.categories);
            setUnits(data.units);
            setWarehouses(data.warehouses);
        } catch (error: any) {
            console.error("Failed to load data:", error);
            // This part is less likely to fail with localStorage but good to have.
             setAlertConfig({isOpen: true, title: 'خطأ', message: 'فشل تحميل البيانات من التخزين المحلي.'});
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Persist current user to localStorage for session management
    useEffect(() => {
        if (currentUser) {
            const userToStore = {
                id: currentUser.id,
                username: currentUser.username,
                role: currentUser.role,
            };
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);
    
    // --- Authentication ---
    const handleLogin = (username: string, password: string): boolean => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const plainUser = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            setCurrentUser(plainUser);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('dashboard');
    };

    // --- CRUD Operations ---
    
    // Products
    const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
        const savedProduct = await api.saveProduct(productData);
        if ('id' in productData) {
            setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts([...products, savedProduct]);
        }
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = (productId: string) => {
        const productHasTransactions = transactions.some(t => t.productId === productId);
        if (productHasTransactions) {
            setAlertConfig({ isOpen: true, title: 'لا يمكن حذف المنتج', message: 'لا يمكن حذف هذا المنتج لوجود حركات مسجلة عليه.' });
            return;
        }
        
        setConfirmConfig({
            isOpen: true,
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا المنتج؟',
            onConfirm: async () => {
                await api.deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
                setConfirmConfig({ ...confirmConfig, isOpen: false });
            }
        });
    };

    // Transactions
    const handleTransaction = async (payload: TransactionPayload): Promise<string | null> => {
        try {
            const { updatedProduct, newTransaction } = await api.handleTransaction(payload, currentUser!);
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setTransactions([newTransaction, ...transactions]);
            return null; // Success
        } catch (error: any) {
            return error.message; // Failure
        }
    };

    const handleOpenEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditTransactionModalOpen(true);
    };

    const handleSaveEditedTransaction = async (
        transactionId: string, 
        updatedData: { quantity: number; date: string; notes?: string; customerName?: string; invoiceNumber?: string; }
    ): Promise<string | null> => {
        try {
            const { updatedProduct, updatedTransaction } = await api.saveEditedTransaction(transactionId, updatedData);
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
            return null; // success
        } catch (error: any) {
            return error.message;
        }
    };

    const handleDeleteTransaction = (transactionId: string) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;

        setConfirmConfig({
            isOpen: true,
            title: 'تأكيد حذف الحركة',
            message: `هل أنت متأكد من حذف هذه الحركة؟ سيتم عكس تأثيرها على كمية المنتج.`,
            onConfirm: async () => {
                try {
                    const { updatedProduct } = await api.deleteTransaction(transactionId);
                    if (updatedProduct) {
                        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                    }
                    setTransactions(transactions.filter(t => t.id !== transactionId));
                } catch(error: any) {
                    setAlertConfig({isOpen: true, title: 'خطأ', message: error.message});
                } finally {
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }
            }
        });
    };

    // Stock Take
    const handleSaveStockTake = async (items: {productId: string; expectedQuantity: number; countedQuantity: number}[]) => {
        await api.saveStockTake(items, currentUser!);
        await loadData(); // Reload all data to reflect changes
        setIsStockTakeModalOpen(false);
    };

    // Categories, Units, Warehouses
    const createCrudHandlers = (
        listKey: 'categories' | 'units' | 'warehouses',
        setState: React.Dispatch<React.SetStateAction<string[]>>
    ) => ({
        onAdd: async (item: string) => {
            const newList = await api.saveListItem(listKey, item);
            setState(newList);
        },
        onDelete: async (item: string) => {
            const newList = await api.deleteListItem(listKey, item);
            setState(newList);
        }
    });
    
    const categoryHandlers = createCrudHandlers('categories', setCategories);
    const unitHandlers = createCrudHandlers('units', setUnits);
    const warehouseHandlers = createCrudHandlers('warehouses', setWarehouses);

    // Users
    const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
        const savedUser = await api.saveUser(userData);
        if ('id' in userData) {
             setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsers([...users, savedUser]);
        }
    };
    
    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        setConfirmConfig({
            isOpen: true,
            title: 'تأكيد حذف المستخدم',
            message: `هل أنت متأكد من حذف المستخدم '${userToDelete.username}'؟`,
            onConfirm: async () => {
                await api.deleteUser(userId);
                setUsers(users.filter(u => u.id !== userId));
                setConfirmConfig({ ...confirmConfig, isOpen: false });
            }
        });
    };

    // --- Import / Export ---
    const handleExportToCSV = () => {
        const headers = ['sku', 'nameAr', 'nameEn', 'category', 'unit', 'price', 'quantity', 'warehouse', 'location', 'minStockLevel', 'barcode', 'imageUrl', 'description'];
        const csvRows = [
            headers.join(';'),
            ...products.map(p => {
                const values = headers.map(header => {
                    const value = p[header as keyof Product] ?? '';
                    const stringValue = String(value).replace(/"/g, '""');
                    return `"${stringValue}"`;
                });
                return values.join(';');
            })
        ];
        const csvString = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'products.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFromCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const rows = text.split('\n').filter(row => row.trim() !== '');
            const headers = rows.shift()?.trim().split(';').map(h => h.replace(/"/g, '')) ?? [];
            
            let updatedCount = 0;
            let addedCount = 0;
            let skippedCount = 0;

            for (const row of rows) {
                const values = row.trim().split(';').map(v => v.replace(/"/g, ''));
                const productData: any = {};
                headers.forEach((header, index) => {
                    productData[header] = values[index] ?? '';
                });

                if (!productData.sku) {
                    skippedCount++;
                    continue;
                }

                const existingProduct = products.find(p => p.sku === productData.sku);
                
                const parsedProduct = {
                    sku: productData.sku,
                    nameAr: productData.nameAr,
                    nameEn: productData.nameEn,
                    category: productData.category,
                    unit: productData.unit,
                    price: parseFloat(productData.price) || 0,
                    warehouse: productData.warehouse,
                    location: productData.location,
                    minStockLevel: parseInt(productData.minStockLevel, 10) || 0,
                    barcode: productData.barcode,
                    imageUrl: productData.imageUrl,
                    description: productData.description,
                };
                
                const quantity = parseInt(productData.quantity, 10);

                if (existingProduct) {
                    const productToSave: Product = { 
                        ...existingProduct, 
                        ...parsedProduct, 
                        quantity: !isNaN(quantity) ? quantity : existingProduct.quantity 
                    };
                    await api.saveProduct(productToSave);
                    updatedCount++;
                } else {
                    const productToSave: Omit<Product, 'id'> = { 
                        ...parsedProduct, 
                        quantity: !isNaN(quantity) ? quantity : 0
                    };
                    await api.saveProduct(productToSave);
                    addedCount++;
                }
            };
            
            await loadData();
            
            setAlertConfig({isOpen: true, title: 'اكتمل الاستيراد', message: `تمت إضافة: ${addedCount} منتج\nتم تحديث: ${updatedCount} منتج\nتم تجاهل: ${skippedCount} صف`});
        };
        reader.readAsText(file, 'utf-8');
    };

    // --- Modal Openers ---
    const handleOpenAddProduct = () => {
        setEditingProduct(null);
        setIsAddProductModalOpen(true);
    };

    const handleOpenEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsAddProductModalOpen(true);
    };
    
    const handleOpenTransaction = (product: Product, type: TransactionType) => {
        setTransactionProduct(product);
        setTransactionType(type);
        setIsTransactionModalOpen(true);
    };

    const handleSidebarAction = (action: 'addProduct' | 'stockTake' | 'categories' | 'units' | 'warehouses' | 'users' | 'import' | 'export') => {
        switch(action) {
            case 'addProduct': handleOpenAddProduct(); break;
            case 'stockTake': setIsStockTakeModalOpen(true); break;
            case 'categories': setIsCategoryModalOpen(true); break;
            case 'units': setIsUnitModalOpen(true); break;
            case 'warehouses': setIsWarehouseModalOpen(true); break;
            case 'users': setIsUserManagementModalOpen(true); break;
            case 'export': handleExportToCSV(); break;
        }
    }

    // --- Computed values ---
    const dashboardStats = {
        totalProducts: products.length,
        totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
        totalValue: products.reduce((sum, p) => sum + p.quantity * p.price, 0),
    };
    
    const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel ?? 5));
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">جاري تحميل البيانات...</div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div dir="rtl" className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <div className="flex">
                 <Sidebar 
                    onAction={handleSidebarAction} 
                    onLogout={handleLogout} 
                    currentUser={currentUser}
                    onImport={handleImportFromCSV} 
                    currentView={currentView}
                    onNavigate={setCurrentView}
                 />
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                     <Header />
                     <main className="space-y-8">
                        {currentView === 'dashboard' && (
                            <>
                                <Dashboard stats={dashboardStats} />
                                {lowStockProducts.length > 0 && <LowStockAlerts products={lowStockProducts} />}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <TransactionList 
                                        transactions={transactions} 
                                        isFullPage={false} 
                                        onEdit={handleOpenEditTransaction}
                                        onDelete={handleDeleteTransaction}
                                        currentUser={currentUser}
                                   />
                                   <StockTakeHistoryList stockTakes={stockTakes} />
                                </div>
                            </>
                        )}
                        {currentView === 'products' && (
                            <ProductList 
                                products={products} 
                                onTransaction={handleOpenTransaction}
                                onEdit={handleOpenEditProduct}
                                onDelete={handleDeleteProduct}
                                categories={categories}
                                warehouses={warehouses}
                                currentUser={currentUser}
                            />
                        )}
                         {currentView === 'reports' && (
                            <Reports
                                products={products}
                                transactions={transactions}
                                categories={categories}
                                warehouses={warehouses}
                            />
                        )}
                        {currentView === 'transactions' && (
                            <TransactionList 
                                transactions={transactions} 
                                products={products}
                                isFullPage={true}
                                onEdit={handleOpenEditTransaction}
                                onDelete={handleDeleteTransaction}
                                currentUser={currentUser}
                            />
                        )}
                    </main>
                </div>
            </div>
            
            {/* Modals */}
            <AddProductModal 
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                onSave={handleSaveProduct}
                editingProduct={editingProduct}
                products={products}
                categories={categories}
                units={units}
                warehouses={warehouses}
            />
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={handleTransaction}
                product={transactionProduct}
                transactionType={transactionType}
            />
             <EditTransactionModal
                isOpen={isEditTransactionModalOpen}
                onClose={() => setIsEditTransactionModalOpen(false)}
                onSave={handleSaveEditedTransaction}
                transaction={editingTransaction}
            />
            <StockTakeModal 
                isOpen={isStockTakeModalOpen}
                onClose={() => setIsStockTakeModalOpen(false)}
                onSave={handleSaveStockTake}
                products={products}
            />
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onAdd={categoryHandlers.onAdd}
                onDelete={categoryHandlers.onDelete}
            />
            <UnitModal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                units={units}
                onAdd={unitHandlers.onAdd}
                onDelete={unitHandlers.onDelete}
            />
            <WarehouseModal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                warehouses={warehouses}
                onAdd={warehouseHandlers.onAdd}
                onDelete={warehouseHandlers.onDelete}
            />
             {currentUser.role === 'admin' && (
                <UserManagementModal
                    isOpen={isUserManagementModalOpen}
                    onClose={() => setIsUserManagementModalOpen(false)}
                    users={users}
                    onSaveUser={handleSaveUser}
                    onDeleteUser={handleDeleteUser}
                />
             )}
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
            />
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
            />
        </div>
    );
};

export default App;