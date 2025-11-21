// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/" element={<LoginPage />} />

        {/* 대시보드 페이지 */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
