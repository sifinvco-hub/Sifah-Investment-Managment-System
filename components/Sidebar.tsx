import React, { useRef } from 'react';
import { User, View } from '../types';

interface SidebarProps {
    onAction: (action: 'addProduct' | 'stockTake' | 'categories' | 'units' | 'warehouses' | 'users' | 'export') => void;
    onImport: (file: File) => void;
    onLogout: () => void;
    currentUser: User | null;
    currentView: View;
    onNavigate: (view: View) => void;
}

const NavButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode; }> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`w-full text-right py-2.5 px-4 rounded-lg transition-colors flex items-center gap-3 ${
            isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span>{children}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ onAction, onImport, onLogout, currentUser, currentView, onNavigate }) => {
    const isAdmin = currentUser?.role === 'admin';
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
            event.target.value = '';
        }
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col rounded-l-xl shadow-lg space-y-6 h-screen sticky top-0">
            <div>
                 <h2 className="text-lg font-bold mb-4 text-gray-500 dark:text-gray-400 border-b pb-2 border-gray-200 dark:border-gray-700">التنقل</h2>
                <nav className="space-y-2">
                     <NavButton 
                        isActive={currentView === 'dashboard'} 
                        onClick={() => onNavigate('dashboard')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                    >
                        الرئيسية
                    </NavButton>
                    <NavButton 
                        isActive={currentView === 'products'} 
                        onClick={() => onNavigate('products')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    >
                        المنتجات
                    </NavButton>
                    <NavButton 
                        isActive={currentView === 'transactions'} 
                        onClick={() => onNavigate('transactions')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                    >
                        سجل الحركات
                    </NavButton>
                     {isAdmin && (
                        <NavButton
                            isActive={currentView === 'reports'}
                            onClick={() => onNavigate('reports')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 00-4-4H3V9h2a4 4 0 004-4V3l4 4-4 4zm11-1V5l-4-4-4 4v2a4 4 0 004 4h2v2h-2a4 4 0 00-4 4v2l4-4 4 4z" /></svg>}
                        >
                            التقارير
                        </NavButton>
                    )}
                </nav>
            </div>
            
            <div className="pt-4 border-t dark:border-gray-700">
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">الإجراءات</h3>
                <nav className="space-y-1">
                    <button onClick={() => onAction('addProduct')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">إضافة منتج جديد</button>
                    <button onClick={() => onAction('stockTake')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">جرد المخزون</button>
                    <button onClick={() => onAction('categories')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">إدارة الأنواع</button>
                    <button onClick={() => onAction('units')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">إدارة الوحدات</button>
                    <button onClick={() => onAction('warehouses')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">إدارة المستودعات</button>
                    {isAdmin && (
                        <button onClick={() => onAction('users')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">إدارة المستخدمين</button>
                    )}
                </nav>
            </div>
             {isAdmin && (
                 <div className="pt-4 border-t dark:border-gray-700">
                    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">استيراد / تصدير</h3>
                    <nav className="space-y-1">
                        <button onClick={handleImportClick} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">استيراد Excel</button>
                        <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                        <button onClick={() => onAction('export')} className="w-full text-right py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">تصدير Excel</button>
                    </nav>
                </div>
            )}
            <div className="mt-auto pt-4 border-t dark:border-gray-700">
                 {currentUser && (
                    <div className="text-center mb-4 text-sm">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">مرحباً, {currentUser.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">({currentUser.role === 'admin' ? 'مدير' : 'مستخدم'})</p>
                    </div>
                )}
                <button onClick={onLogout} className="w-full text-center py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;