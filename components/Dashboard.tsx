
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 rtl:space-x-reverse">
        <div className="flex-shrink-0">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                {icon}
            </div>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

interface DashboardProps {
    stats: {
        totalProducts: number;
        totalItems: number;
        totalValue: number;
    };
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">نظرة عامة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="إجمالي المنتجات" 
                    value={stats.totalProducts.toLocaleString('ar-EG')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatCard 
                    title="إجمالي عدد القطع" 
                    value={stats.totalItems.toLocaleString('ar-EG')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <StatCard 
                    title="قيمة المخزون الإجمالية" 
                    value={`${stats.totalValue.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })}`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
            </div>
        </div>
    );
};

export default Dashboard;
