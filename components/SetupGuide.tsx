import React from 'react';

interface SetupGuideProps {
    onRetry: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm text-left dir-ltr overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const SetupGuide: React.FC<SetupGuideProps> = ({ onRetry }) => {

    const configSnippet = `
// firebase/config.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// الصق إعدادات مشروع Firebase الخاصة بك هنا
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
    `.trim();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="text-right bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الخطوة الأخيرة: إعداد قاعدة البيانات</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    لتشغيل التطبيق، يجب ربطه بمشروعك الخاص على خدمة Firebase من Google. هذه العملية مجانية وتستغرق دقائق.
                </p>

                <div className="space-y-4 text-gray-800 dark:text-gray-200">
                    <div className="flex gap-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">1.</div>
                        <div>
                            <strong>اذهب إلى Firebase:</strong> افتح <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">وحدة تحكم Firebase</a> وانقر على "Add project" (إضافة مشروع).
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">2.</div>
                        <div>
                            <strong>أنشئ تطبيق ويب:</strong> بعد إنشاء المشروع، انقر على أيقونة الويب <strong>{`</>`}</strong>، أعطه اسماً، ثم انقر "Register app".
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">3.</div>
                        <div>
                            <strong>انسخ الإعدادات:</strong> سيُظهر لك Firebase كائنًا اسمه <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm">firebaseConfig</code>. انسخه بالكامل.
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">4.</div>
                        <div>
                            <strong>حدّث الملف:</strong> افتح ملف <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm">firebase/config.ts</code> في مشروعك والصق الإعدادات التي نسختها، كما هو موضح أدناه:
                            <CodeBlock>{configSnippet}</CodeBlock>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">5.</div>
                        <div>
                            <strong>فعّل قاعدة البيانات:</strong> من قائمة Firebase، اذهب إلى <strong>Build &gt; Firestore Database</strong>، انقر "Create database"، واختر البدء في <strong>"Test mode"</strong>.
                        </div>
                    </div>
                </div>

                <button onClick={onRetry} className="mt-8 w-full py-3 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold">
                    لقد أكملت الإعداد، أعد المحاولة!
                </button>
            </div>
        </div>
    );
};

export default SetupGuide;
