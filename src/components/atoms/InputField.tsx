// src/components/atoms/InputField.tsx
import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm
                    focus:border-orange-500 focus:ring-orange-500 ${className}`}
        {...props}
      />
    </div>
  );
};
