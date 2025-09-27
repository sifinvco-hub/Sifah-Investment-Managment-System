import React from 'react';

interface ConnectionErrorProps {
    error: string;
    onRetry: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ error, onRetry }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 p-4">
            <div className="text-right bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m0-12.728L18.364 18.364" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">لا يمكن الاتصال بقاعدة البيانات</h2>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    حدث خطأ أثناء محاولة تحميل البيانات من Firestore. هذا يعني عادةً وجود مشكلة في الإعدادات أو الاتصال.
                </p>

                <div className="space-y-4 text-gray-800 dark:text-gray-200 mb-8 border-t dark:border-gray-700 pt-6">
                    <h3 className="font-bold text-lg mb-2">خطوات مقترحة للحل:</h3>
                    <div className="flex gap-3">
                        <div className="font-bold text-red-600 dark:text-red-400">1.</div>
                        <div>
                            <strong>(الأكثر شيوعاً) تفعيل قاعدة البيانات:</strong> تأكد من أنك قمت بإنشاء قاعدة بيانات Firestore في مشروعك.
                            <ul className="list-disc pr-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>اذهب إلى <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">لوحة تحكم Firebase</a>.</li>
                                <li>من القائمة، اختر <strong>Build &gt; Firestore Database</strong>.</li>
                                <li>انقر على "Create database" واختر البدء في <strong>"Test mode"</strong>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-red-600 dark:text-red-400">2.</div>
                        <div>
                            <strong>التحقق من اتصال الإنترنت:</strong> تأكد من أن جهازك متصل بالإنترنت وأنه لا يوجد جدار حماية يمنع الاتصال بـ Google Cloud.
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                    <p className="font-bold">رسالة الخطأ الفنية:</p>
                    <p className="font-mono dir-ltr text-left">{error}</p>
                </div>

                <button onClick={onRetry} className="mt-6 w-full py-3 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold">
                    إعادة المحاولة
                </button>
            </div>
        </div>
    );
};

export default ConnectionError;
