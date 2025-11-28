// src/components/organisms/Sidebar.tsx
import React from 'react';
import { NavItem } from '../molecules/NavItem';
import { StatusBadge } from '../atoms/StatusBadge';

interface SidebarProps {
    activeMenu: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu }) => {
    // PDF [5, 6, 20]의 메뉴 구조 반영
    const menuData = [
        { title: '대시보드', icon: '🏠', path: 'dashboard' },
        { title: '인버터', icon: '🔋', path: 'inverter' },
        { title: '트렌드', icon: '📈', path: 'trend' },
        { title: '보고서', icon: '📰', path: 'report' },
        { title: '기록', icon: '📄', path: 'history' },
        { title: '알림', icon: '🔔', path: 'alert' },
        {
          title: '관리', icon: '⚙️', subItems: [
            { title: '발전소 관리', path: 'plant-management' }, // [20]
            { title: '설비 관리', path: 'device-management' }, // [22]
            { title: '사용자 관리', path: 'user-management' }, // [23]
          ],
          path: 'management'
        },
    ];

    return (
        <div className="top-28 w-64 bg-slate-900 h-screen fixed">
            {/* Sidebar Header/Logo Area [5] */}
            <div className="p-4 bg-gray-800 flex items-center justify-between">
                <div>
                    <span className="text-xl font-bold text-white"></span>
                    <span className="ml-2 text-sm text-white">님</span> 
                </div>
                <StatusBadge status="KW" value="3.0KW" />
            </div>

            {/* Navigation Items */}
            <nav className="mt-5">
                {/* 상단 탭 (대시보드 옆의 '총괄통합')은 단순 Placeholder 처리 [5] */}
                <div className="text-gray-500 text-sm px-6 mb-2">총괄통합 메뉴</div>
                {menuData.map((item) => (
                    <NavItem 
                        key={item.title} 
                        title={item.title} 
                        icon={item.icon} 
                        subItems={item.subItems} 
                        path={item.path}
                        isActive={activeMenu === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenu))}
                    />
                ))}
            </nav>
        </div>
    );
};