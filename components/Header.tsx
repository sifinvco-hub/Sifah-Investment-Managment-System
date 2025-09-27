import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md mb-8 rounded-xl">
            <div className="px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظام إدارة المخزون</h1>
            </div>
        </header>
    );
};

export default Header;