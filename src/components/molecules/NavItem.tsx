// src/components/molecules/NavItem.tsx
import React, { useState } from 'react';

// Icon Placeholder (실제로는 SVG 또는 react-icons 사용)
const PlaceholderIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1l-.75-3M3 13h18M14 17h6l1-1V5l-1-1H3l-1 1v10l1 1h6"></path></svg>
);
const ChevronDown: React.FC = () => (
    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

interface SubItem {
    title: string;
    path: string;
}

interface NavItemProps {
    title: string;
    icon: React.ReactNode;
    subItems?: SubItem[];
    path: string;
    isActive: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ title, icon, subItems = [], isActive }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // PDF [5]의 다크 테마 메뉴 스타일 반영
    const activeClass = isActive ? 'bg-slate-700 text-white font-semibold' : 'text-gray-400 hover:bg-slate-700 hover:text-white';
    const baseClass = `flex items-center p-3 text-sm transition duration-200 cursor-pointer ${activeClass}`;

    return (
        <div>
            <div className={baseClass} onClick={() => subItems.length > 0 && setIsOpen(!isOpen)}>
                <span className="w-5 h-5 mr-3">{icon || <PlaceholderIcon />}</span> 
                {title}
                {subItems.length > 0 && <ChevronDown />}
            </div>
            {subItems.length > 0 && isOpen && (
                <div className="pl-6 bg-slate-700">
                    {subItems.map((item, index) => (
                        <div key={index} className="p-2 text-sm text-gray-300 hover:bg-slate-600 cursor-pointer">
                            {item.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};