// src/components/atoms/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, primary = false, className = '', ...props }) => {
  const baseStyle =
    'px-4 py-2 font-semibold rounded text-sm ' +
    'transition-all duration-150 select-none touch-manipulation ' +
    'inline-flex items-center justify-center gap-2 ' +
    'cursor-pointer ' +
    'active:scale-[0.98] active:translate-y-px ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';
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