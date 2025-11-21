// src/components/organisms/AppHeader.tsx
import React from 'react';
import { StatusBadge } from '../atoms/StatusBadge';

interface AppHeaderProps {
    pageTitle: string;
    pageSubtitle: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ pageTitle, pageSubtitle }) => {
    // PDF [5, 6] 기반 정보 반영
    const headerInfo = {
        kwStatus: '3.0KW', // [5]
        location: '남해',
        temp: '기온 19.0℃',
        humidity: '습도 47%',
        wind: '풍속 1.6m/s',
        date: '2021. 10. 29. 오전 11:31:22',
    };
    
    // PDF [5]의 상단 SW 로고 및 KW 상태 반영
    const logoArea = (
        <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-orange-600">SW</span>
            <span className="text-sm font-semibold text-gray-800">태양광발전 모니터링시스템</span>
            <StatusBadge status="KW" value={headerInfo.kwStatus} />
        </div>
    );

    return (
        <header className="fixed top-0 left-64 right-0 bg-white shadow-sm z-10">
            {/* Top Bar: System Info & Weather */}
            <div className="flex justify-between items-center h-12 px-6 border-b">
                {logoArea}
                
                {/* Weather and Time Info [5] */}
                <div className="text-xs text-gray-500 flex space-x-4">
                    <span>{headerInfo.location}</span>
                    <span>{headerInfo.temp}</span>
                    <span>{headerInfo.humidity}</span>
                    <span>{headerInfo.wind}</span>
                    <span className='text-gray-700 font-medium'>{headerInfo.date}</span>
                </div>
            </div>
            
            {/* Page Title Bar (Red/Orange Gradient) [5] */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
                <h1 className="text-2xl font-semibold">
                    {pageTitle} <span className="text-base font-light opacity-80">{pageSubtitle}</span>
                </h1>
            </div>
        </header>
    );
};