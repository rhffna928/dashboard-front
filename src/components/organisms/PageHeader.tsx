// src/components/organisms/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
    pageTitle: string;
    pageSubtitle: string;
}

export const PageHeaderMetrics: React.FC<PageHeaderProps> = ({ pageTitle, pageSubtitle }) => {
    // 발전소 현황 및 현재 발전량 데이터 반영
    return (
 
        <div className="rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
            <h1 className="text-2xl font-semibold">
                {pageTitle} <span className="text-base font-light opacity-80">{pageSubtitle}</span>
            </h1>
        </div>
    );
};


