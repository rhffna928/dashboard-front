// src/components/atoms/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
    status: string;
    value?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, value }) => {
    // PDF [5]에 나타난 3.0KW 상태 바 및 [7]의 INV01 Run 상태 반영
    let bgColor = 'bg-gray-600';
    if (status === 'KW') {
        bgColor = 'bg-orange-600';
    } else if (status === 'Run') {
        bgColor = 'bg-blue-500';
    } else if (status === 'Stop') {
        bgColor = 'bg-red-500';
    }

    return (
        <span className={`inline-flex items-center text-white px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {value && <span className="mr-1">{value}</span>}
            {status}
        </span>
    );
};