// src/pages/LoginPage.tsx (AuthLayout 역할 포함)
import React from 'react';
import { LoginPanel } from '../components/organisms/LoginPanel';

export const LoginPage: React.FC = () => {
  // PDF [1, 4]의 2분할 레이아웃 반영
  return (
    <div className="flex h-screen">
      {/* Left Dark Panel: Background/Navigation [1] (slate-900 사용) */}
      <div className="w-1/3 bg-slate-900 flex flex-col justify-center items-right p-10">
        <div className="text-white text-right">
          <h1 className="text-2xl font-bold mb-2">태양광발전</h1>
          <h1 className="text-2xl font-bold">모니터링시스템</h1>
        </div>
      </div>

      {/* Right Login Panel Area */}
      <div className="w-2/3 flex items-center justify-center bg-gray-50">
        <LoginPanel />
      </div>
    </div>
  );
};