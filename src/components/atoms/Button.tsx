// src/components/atoms/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, primary = false, className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 font-semibold rounded transition duration-150 text-sm';
  // 주황색/파란색 기본 색상 사용
  const primaryStyle = 'bg-orange-600 hover:bg-orange-700 text-white shadow-md';
  const secondaryStyle = 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300';
  
  return (
    <button
      className={`${baseStyle} ${primary ? primaryStyle : secondaryStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};