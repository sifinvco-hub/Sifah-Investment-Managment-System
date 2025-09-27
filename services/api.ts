import { Product, Transaction, StockTake, User, TransactionPayload, StockTakeItem } from '../types';

// Simple ID generator
const generateId = () => crypto.randomUUID();

// --- Default Data for Initialization ---
const getInitialData = () => ({
    products: [
        { id: generateId(), sku: 'FOOD-001', nameAr: 'أرز بسمتي', nameEn: 'Basmati Rice', category: 'مواد غذائية', unit: 'كيس', price: 55, quantity: 100, warehouse: 'المستودع الرئيسي', minStockLevel: 20, barcode: '6281001234567' },
        { id: generateId(), sku: 'DRNK-001', nameAr: 'مياه معدنية', nameEn: 'Mineral Water', category: 'مشروبات', unit: 'كرتون', price: 20, quantity: 50, warehouse: 'المستودع الرئيسي', minStockLevel: 10, barcode: '6281007654321' },
        { id: generateId(), sku: 'CLNR-001', nameAr: 'منظف متعدد الأغراض', nameEn: 'Multi-purpose Cleaner', category: 'منظفات', unit: 'حبة', price: 15, quantity: 80, warehouse: 'فرع العليا', minStockLevel: 15, barcode: '6281009876543' },
    ],
    transactions: [],
    stockTakes: [],
    users: [
        { id: 'user-1', username: 'admin', password: 'password', role: 'admin' as const },
        { id: 'user-2', username: 'user', password: 'password', role: 'user' as const },
    ],
    categories: ['مواد غذائية', 'مشروبات', 'منظفات', 'معلبات'],
    units: ['حبة', 'كرتون', 'كيلو', 'صندوق'],
    warehouses: ['المستودع الرئيسي', 'فرع العليا']
});

// --- localStorage Helper Functions ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// --- Initialize Storage if it's the first run ---
const initializeStorage = () => {
    if (!localStorage.getItem('inventory_initialized')) {
        const initialData = getInitialData();
        saveToStorage('inventory_products', initialData.products);
        saveToStorage('inventory_transactions', initialData.transactions);
        saveToStorage('inventory_stockTakes', initialData.stockTakes);
        saveToStorage('inventory_users', initialData.users);
        saveToStorage('inventory_categories', initialData.categories);
        saveToStorage('inventory_units', initialData.units);
        saveToStorage('inventory_warehouses', initialData.warehouses);
        localStorage.setItem('inventory_initialized', 'true');
    }
};

initializeStorage();

// Mock async behavior
const simulateDelay = (ms: number = 50) => new Promise(res => setTimeout(res, ms));

const api = {
    // --- Data Fetching ---
    fetchAllData: async () => {
        await simulateDelay();
        return {
            products: getFromStorage<Product[]>('inventory_products', []).sort((a,b) => a.nameAr.localeCompare(b.nameAr)),
            transactions: getFromStorage<Transaction[]>('inventory_transactions', []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            stockTakes: getFromStorage<StockTake[]>('inventory_stockTakes', []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            users: getFromStorage<User[]>('inventory_users', []),
            categories: getFromStorage<string[]>('inventory_categories', []),
            units: getFromStorage<string[]>('inventory_units', []),
            warehouses: getFromStorage<string[]>('inventory_warehouses', []),
        };
    },

    // --- Products ---
    saveProduct: async (productData: Omit<Product, 'id'> | Product): Promise<Product> => {
        await simulateDelay();
        const products = getFromStorage<Product[]>('inventory_products', []);
        if ('id' in productData) { // Editing
            const index = products.findIndex(p => p.id === productData.id);
            if (index !== -1) products[index] = productData;
            saveToStorage('inventory_products', products);
            return productData;
        } else { // Adding
            const newProduct = { ...productData, id: generateId() };
            products.push(newProduct);
            saveToStorage('inventory_products', products);
            return newProduct;
        }
    },

    deleteProduct: async (productId: string): Promise<void> => {
        await simulateDelay();
        let products = getFromStorage<Product[]>('inventory_products', []);
        products = products.filter(p => p.id !== productId);
        saveToStorage('inventory_products', products);
    },

    // --- Transactions ---
    handleTransaction: async (payload: TransactionPayload, currentUser: User): Promise<{ updatedProduct: Product, newTransaction: Transaction }> => {
        await simulateDelay();
        const products = getFromStorage<Product[]>('inventory_products', []);
        const transactions = getFromStorage<Transaction[]>('inventory_transactions', []);
        const productIndex = products.findIndex(p => p.id === payload.productId);

        if (productIndex === -1) throw new Error("المنتج غير موجود.");
        
        const product = products[productIndex];
        let newQuantity = product.quantity;

        if (payload.type === 'إضافة' || payload.type === 'إرجاع') {
            newQuantity += payload.quantity;
        } else if (payload.type === 'صرف') {
            if (payload.quantity > product.quantity) {
                throw new Error("الكمية المطلوبة أكبر من الكمية المتوفرة في المخزون.");
            }
            newQuantity -= payload.quantity;
        }

        const updatedProduct = { ...product, quantity: newQuantity };
        products[productIndex] = updatedProduct;
        
        const newTransaction: Transaction = {
            id: generateId(),
            productId: payload.productId,
            productName: product.nameAr,
            barcode: product.barcode,
            quantity: payload.quantity,
            type: payload.type,
            date: new Date().toISOString(),
            notes: payload.notes,
            customerName: payload.customerName,
            invoiceNumber: payload.invoiceNumber,
            username: currentUser.username,
        };
        transactions.push(newTransaction);

        saveToStorage('inventory_products', products);
        saveToStorage('inventory_transactions', transactions);
        
        return { updatedProduct, newTransaction };
    },
    
    saveEditedTransaction: async (transactionId: string, updatedData: { quantity: number; date: string; notes?: string; customerName?: string; invoiceNumber?: string; }): Promise<{ updatedProduct: Product, updatedTransaction: Transaction }> => {
         await simulateDelay();
        const products = getFromStorage<Product[]>('inventory_products', []);
        const transactions = getFromStorage<Transaction[]>('inventory_transactions', []);
        const txIndex = transactions.findIndex(t => t.id === transactionId);

        if (txIndex === -1) throw new Error("الحركة غير موجودة.");

        const originalTransaction = transactions[txIndex];
        const productIndex = products.findIndex(p => p.id === originalTransaction.productId);
        if (productIndex === -1) throw new Error("المنتج المرتبط بالحركة غير موجود.");
        
        const product = products[productIndex];
        const quantityDiff = updatedData.quantity - originalTransaction.quantity;
        let stockAdjustment = 0;

        if (originalTransaction.type === 'إضافة' || originalTransaction.type === 'إرجاع') {
            stockAdjustment = quantityDiff;
        } else { // 'صرف'
            stockAdjustment = -quantityDiff;
        }
        
        const newProductQuantity = product.quantity + stockAdjustment;
        if (newProductQuantity < 0) throw new Error(`سيؤدي هذا التعديل إلى كمية سالبة للمنتج.`);
        
        const updatedProduct = { ...product, quantity: newProductQuantity };
        products[productIndex] = updatedProduct;

        const updatedTransaction = { ...originalTransaction, ...updatedData };
        transactions[txIndex] = updatedTransaction;

        saveToStorage('inventory_products', products);
        saveToStorage('inventory_transactions', transactions);

        return { updatedProduct, updatedTransaction };
    },

    deleteTransaction: async (transactionId: string): Promise<{ updatedProduct: Product | null }> => {
        await simulateDelay();
        const products = getFromStorage<Product[]>('inventory_products', []);
        let transactions = getFromStorage<Transaction[]>('inventory_transactions', []);
        const txToDelete = transactions.find(t => t.id === transactionId);

        if (!txToDelete) throw new Error("لم يتم العثور على الحركة.");

        let updatedProduct: Product | null = null;
        const productIndex = products.findIndex(p => p.id === txToDelete.productId);

        if (productIndex !== -1) {
            const product = products[productIndex];
            let newQuantity = product.quantity;
            if (txToDelete.type === 'إضافة' || txToDelete.type === 'إرجاع') {
                newQuantity -= txToDelete.quantity;
            } else { // 'صرف'
                newQuantity += txToDelete.quantity;
            }
            if (newQuantity < 0) newQuantity = 0;
            
            updatedProduct = { ...product, quantity: newQuantity };
            products[productIndex] = updatedProduct;
        }

        transactions = transactions.filter(t => t.id !== transactionId);

        saveToStorage('inventory_products', products);
        saveToStorage('inventory_transactions', transactions);

        return { updatedProduct };
    },

    // --- Stock Take ---
    saveStockTake: async (items: {productId: string; expectedQuantity: number; countedQuantity: number}[], currentUser: User): Promise<void> => {
        await simulateDelay();
        const products = getFromStorage<Product[]>('inventory_products', []);
        const transactions = getFromStorage<Transaction[]>('inventory_transactions', []);
        const stockTakes = getFromStorage<StockTake[]>('inventory_stockTakes', []);
        
        const stockTakeItems: StockTakeItem[] = [];
        
        for (const item of items) {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                const product = products[productIndex];
                const discrepancy = item.countedQuantity - item.expectedQuantity;
                
                if (discrepancy !== 0) {
                    products[productIndex].quantity = item.countedQuantity;
                    const transaction: Transaction = {
                        id: generateId(),
                        productId: item.productId,
                        productName: product.nameAr,
                        barcode: product.barcode,
                        quantity: Math.abs(discrepancy),
                        type: 'جرد',
                        date: new Date().toISOString(),
                        notes: `تعديل جرد: ${discrepancy > 0 ? '+' : ''}${discrepancy}`,
                        username: currentUser.username,
                    };
                    transactions.push(transaction);
                }
                stockTakeItems.push({ ...item, productName: product.nameAr, discrepancy });
            }
        }
        
        const newStockTake: StockTake = {
            id: generateId(),
            date: new Date().toISOString(),
            items: stockTakeItems
        };
        stockTakes.push(newStockTake);

        saveToStorage('inventory_products', products);
        saveToStorage('inventory_transactions', transactions);
        saveToStorage('inventory_stockTakes', stockTakes);
    },

    // --- Simple CRUD for Categories, Units, Warehouses ---
    saveListItem: async (listKey: 'categories' | 'units' | 'warehouses', item: string): Promise<string[]> => {
        await simulateDelay();
        const storageKey = `inventory_${listKey}`;
        const list = getFromStorage<string[]>(storageKey, []);
        if (!list.includes(item)) {
            const newList = [...list, item];
            saveToStorage(storageKey, newList);
            return newList;
        }
        return list;
    },

    deleteListItem: async (listKey: 'categories' | 'units' | 'warehouses', item: string): Promise<string[]> => {
        await simulateDelay();
        const storageKey = `inventory_${listKey}`;
        let list = getFromStorage<string[]>(storageKey, []);
        const newList = list.filter((i: string) => i !== item);
        saveToStorage(storageKey, newList);
        return newList;
    },

    // --- Users ---
    saveUser: async (userData: Omit<User, 'id'> | User): Promise<User> => {
        await simulateDelay();
        const users = getFromStorage<User[]>('inventory_users', []);
        if ('id' in userData) {
            const index = users.findIndex(u => u.id === userData.id);
            if (index !== -1) users[index] = { ...users[index], ...userData };
            saveToStorage('inventory_users', users);
            return userData;
        } else {
            const newUser = { ...userData, id: generateId() };
            users.push(newUser);
            saveToStorage('inventory_users', users);
            return newUser;
        }
    },

    deleteUser: async (userId: string): Promise<void> => {
        await simulateDelay();
        let users = getFromStorage<User[]>('inventory_users', []);
        users = users.filter(u => u.id !== userId);
        saveToStorage('inventory_users', users);
    }
};

export default api;