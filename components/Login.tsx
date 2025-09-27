// Fix: Implement the Login component.
import React, { useState } from 'react';

interface LoginProps {
    onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!onLogin(username, password)) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">تسجيل الدخول</h1>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            اسم المستخدم
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        {/* FIX: Corrected typo `c lassName` to `className` */}
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="password"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            دخول
                        </button>
                    </div>
                     <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        للتجربة: admin / password
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;