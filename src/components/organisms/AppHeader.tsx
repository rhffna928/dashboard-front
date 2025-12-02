// src/components/organisms/AppHeader.tsx
import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../atoms/StatusBadge';


export const AppHeader: React.FC = () => {
    // 기반 정보 반영
    const [headerInfo, setHeaderInfo] = useState({
        kwStatus: '3.0KW', // [5]
        location: '남해',
        temp: '기온 19.0℃',
        humidity: '습도 47%',
        wind: '풍속 1.6m/s',
        date: '',
    });
    // 시간 포매터
    const formatTime = () => {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);

        return (
            `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ` +
            `${now.getHours() >= 12 ? '오후' : '오전'} ` +
            `${pad(now.getHours() % 12 || 12)}:${pad(now.getMinutes())}
            ${pad(now.getSeconds()
            )}`
        );
    };

    useEffect(() => {
        // 처음 로딩 시 즉시 시간 세팅
        setHeaderInfo((prev) =>({
            ...prev,
            date: formatTime(),
        }));
        const clock = setInterval(() => {
            setHeaderInfo((prev) => ({
                ...prev,
                date:formatTime(),
            }));
        },1000);

        return () => {
            clearInterval(clock);
        };
    },[]);


    // 상단 SW 로고 및 KW 상태 반영
    const logoArea = (
        <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-orange-600">SW</span>
            <span className="text-sm font-semibold text-gray-800">태양광발전 모니터링시스템</span>
            <StatusBadge status="KW" value={headerInfo.kwStatus} />
        </div>
    );

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
            {/* Top Bar: System Info & Weather */}
            <div className="flex justify-between items-center h-12 px-6 border-b">
                {logoArea}
                
                {/* Weather and Time Info [5] */}
                <div className="text-xs text-gray-500 flex space-x-4">
                    <span>
                        {headerInfo.location}
                    </span>
                    <span>
                        {headerInfo.temp}
                    </span>
                    <span>
                        {headerInfo.humidity}
                    </span>
                    <span>
                        {headerInfo.wind}
                    </span>
                    <span className='text-gray-700 font-medium'>
                        {headerInfo.date}
                    </span>
                </div>
            </div>
            
        </header>
    );
};