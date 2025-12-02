// src/pages/DashboardPage.tsx
import React from 'react';
import { MainLayout } from '../templates/MainLayout';
import { DashboardMetrics } from '../components/organisms/DashboardMetrics';
import { PageHeaderMetrics } from '../components/organisms/PageHeader';

interface MetricCardProps {
    title: string;
    value: string;
    unit: string;
    colorClass: string;
    subtitle?: string;
    pageTitle: string;
    pageSubtitle: string;
}

export const DashboardPage: React.FC<MetricCardProps> = ({pageTitle, pageSubtitle}) => {
    return (
        
        <MainLayout activeMenu="dashboard">
            <div>
                <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard"/>

                <DashboardMetrics title={''} value={''} unit={''} colorClass={''} />
                
                {/* Chart Panel Placeholder 1 (일일 발전량) [5, 7] */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-4">일일 발전량</h3>
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 border border-dashed">
                        [차트 영역: 일일 발전량 (Bar Chart) - PDF [5]의 중앙 그래프]
                    </div>
                </div>

                {/* Chart Panel Placeholder 2 (누적 발전량) [5, 7] */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-4">누적 발전량</h3>
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 border border-dashed">
                        [차트 영역: 인버터 일일 발전량 (Line Chart) - PDF [5]의 하단 그래프]
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};