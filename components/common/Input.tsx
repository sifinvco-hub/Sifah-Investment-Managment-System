
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
    const baseClasses = "bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white";
    const normalClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600";
    const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500";
    
    return (
      <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          {label}
        </label>
        <input
          id={id}
          {...props}
          className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
};

export default Input;
