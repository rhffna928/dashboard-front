// src/App.tsx
import { useEffect } from 'react';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import useLoginUserStore from './stores/login-user.store';
import { getSignInUserRequest } from './apis';
import type { GetSignInUserResponseDto } from 'apis/response/user';
import { ResponseCode } from './types/enum';
//import type User from './types/interface/User';
import type { ResponseDto } from './apis/response';
import type User from 'types/interface/user.interface';

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
