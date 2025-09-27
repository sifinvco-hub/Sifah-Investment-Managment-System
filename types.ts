export interface Product {
    id: string;
    sku: string;
    nameAr: string;
    nameEn?: string;
    category: string;
    unit: string;
    price: number;
    quantity: number;
    warehouse: string;
    location?: string;
    minStockLevel?: number;
    barcode?: string;
    imageUrl?: string;
    description?: string;
}

export type TransactionType = 'إضافة' | 'صرف' | 'إرجاع' | 'جرد';

export interface Transaction {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    type: TransactionType;
    date: string; // ISO string
    notes?: string;
    username: string;
    customerName?: string;
    invoiceNumber?: string;
    barcode?: string;
}

export interface TransactionPayload {
    productId: string;
    quantity: number;
    type: TransactionType;
    notes?: string;
    customerName?: string;
    invoiceNumber?: string;
}


export interface StockTakeItem {
    productId: string;
    productName: string;
    expectedQuantity: number;
    countedQuantity: number;
    discrepancy: number;
}

export interface StockTake {
    id: string;
    date: string; // ISO string
    items: StockTakeItem[];
}

export interface User {
    id:string;
    username: string;
    password?: string; // Should not be stored in frontend state, but needed for creation/update
    role: 'admin' | 'user';
}

export type View = 'dashboard' | 'products' | 'reports' | 'transactions';