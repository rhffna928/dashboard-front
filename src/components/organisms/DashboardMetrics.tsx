// src/components/organisms/DashboardMetrics.tsx
import React from 'react';
import { StatusBadge } from '../atoms/StatusBadge';
import swpenal from "../../assets/swpenal.png";

interface MetricCardProps {
    title: string;
    value: string;
    unit: string;
    colorClass: string;
    subtitle?: string;
}

const KeyMetricCard: React.FC<MetricCardProps> = ({ title, value, unit, colorClass, subtitle }) => (
    // 6개의 지표 카드 구현
    <div className={`flex flex-col items-center justify-center p-3 ${colorClass} text-white rounded-lg shadow-md w-32 h-32 text-center`}>
        <div className="text-sm">{title}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
        <div className="text-xs">{unit} {subtitle && <span className='block text-xs opacity-70'>{subtitle}</span>}</div>
    </div>
);


export const DashboardMetrics: React.FC<MetricCardProps> = () => {
    // 발전소 현황 및 현재 발전량 데이터 반영
    return (
            
        <div className="grid grid-flow-col grid-rows-3 gap-4">
            <div className="row-span-3 ...">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">발전소 현황</h3>
                
                <div className="flex">
                    {/* Left side: Plant details and solar panel image [7] */}
                    <div className='w-200 pr-6'>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                            <div>**중전반동:** 2021. 1</div>
                            <div>**주소:** 광주광역...</div>
                            <div>**발전용량:** 3kW</div>
                            <div>**인버터:** 3kW x 1대</div>
                            <div>**모듈정보:** 250W x 12장</div>
                        </div>
                        {/* Solar Image Placeholder */}
                        <div className="w-full bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                            <img src={swpenal}></img>
                            
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div className="col-span-2 ...">
                <div className="flex flex-col-reverse ... bg-white p-6 rounded-lg shadow-md mb-6">
                {/* Right side: Key Metrics and Charts */}
                    <div className='w-180 pl-6 border-l'>
                        <h4 className="text-md font-semibold mb-4">현재 발전량</h4>
                        <div className="flex space-x-4 justify-start mb-6">
                            <KeyMetricCard title="현재 발전량" value="12" unit="kW" colorClass="bg-orange-600" />
                            <KeyMetricCard title="금일 발전량" value="5.6" unit="kWh" colorClass="bg-red-500" />
                            <KeyMetricCard title="전일 발전량" value="9.8" unit="kWh" colorClass="bg-cyan-500" />
                            <KeyMetricCard title="월간 발전량" value="188.8" unit="kWh" colorClass="bg-indigo-500" />
                            <KeyMetricCard title="누적 발전량" value="19.7" unit="MWh" colorClass="bg-gray-700" />
                            <KeyMetricCard title="발전 시간" value="1.87" unit="hr" colorClass="bg-gray-800" subtitle="(가동시간)" />
                        </div>
                        
                        {/* 인버터 현황 테이블 Placeholder [7] */}
                        <h4 className="text-md font-semibold mt-4 mb-2">인버터 현황</h4>
                        <table className="min-w-full text-sm border-collapse border border-gray-200">
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className="border p-2 text-left">번호</th>
                                    <th className="border p-2 text-left">상태</th>
                                    <th className="border p-2 text-left">출력전력</th>
                                    <th className="border p-2 text-left">금일 발전량</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='bg-white'>
                                    <td className="border p-2">INV01</td>
                                    <td className="border p-2"><StatusBadge status="Run" /></td>
                                    <td className="border p-2">2.54kW</td>
                                    <td className="border p-2">3.0 MWh</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="col-span-2 row-span-2 ...">
                <div className="flex flex-col-reverse ... bg-white p-6 rounded-lg shadow-md mb-6">
                {/* Right side: Key Metrics and Charts */}
                    <div className='w-180 pl-6 border-l'>
                        <h4 className="text-md font-semibold mb-4">현재 발전량</h4>
                        <div className="flex space-x-4 justify-start mb-6">
                            <KeyMetricCard title="현재 발전량" value="12" unit="kW" colorClass="bg-orange-600" />
                            <KeyMetricCard title="금일 발전량" value="5.6" unit="kWh" colorClass="bg-red-500" />
                            <KeyMetricCard title="전일 발전량" value="9.8" unit="kWh" colorClass="bg-cyan-500" />
                            <KeyMetricCard title="월간 발전량" value="188.8" unit="kWh" colorClass="bg-indigo-500" />
                            <KeyMetricCard title="누적 발전량" value="19.7" unit="MWh" colorClass="bg-gray-700" />
                            <KeyMetricCard title="발전 시간" value="1.87" unit="hr" colorClass="bg-gray-800" subtitle="(가동시간)" />
                        </div>
                        
                        {/* 인버터 현황 테이블 Placeholder [7] */}
                        <h4 className="text-md font-semibold mt-4 mb-2">인버터 현황</h4>
                        <table className="min-w-full text-sm border-collapse border border-gray-200">
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className="border p-2 text-left">번호</th>
                                    <th className="border p-2 text-left">상태</th>
                                    <th className="border p-2 text-left">출력전력</th>
                                    <th className="border p-2 text-left">금일 발전량</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='bg-white'>
                                    <td className="border p-2">INV01</td>
                                    <td className="border p-2"><StatusBadge status="Run" /></td>
                                    <td className="border p-2">2.54kW</td>
                                    <td className="border p-2">3.0 MWh</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            
        </div>
    );
};