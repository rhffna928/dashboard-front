// src/App.tsx
import { useEffect } from 'react';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CookiesProvider, useCookies } from 'react-cookie';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InverterPage } from './pages/InverterPage';
import { TrendPage } from './pages/TrendPage';
import { ReportPage } from './pages/ReportPage';
import { ALERT_PATH, AUTH_PATH, DMNG_PATH, HIST_PATH, INVT_PATH, MAIN_PATH, PTMNG_PATH, REPT_PATH, TRND_PATH, UMNG_PATH } from './constant';
import useLoginUserStore from './stores/login-user.store';
import type { GetSignInUserResponseDto } from 'apis/response/user';
import type { ResponseDto } from 'apis/response';
import type User from 'types/interface/user.interface';
import { getSignInUserRequest } from './apis';

function App() {

  //          state: 로그인 유저 전역 상태          //
  const {setLoginUser, resetLoginUser} = useLoginUserStore();
  //          state: cookie 상태          //
  const [cookies, setCookie] = useCookies();

  //          function: get sign in user response 처리함수          //
  const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto | null) =>{
    if (!responseBody) return;
    const { code } = responseBody;
    if(code ==='AF' || code === 'NU' || code === 'DBE') {
      resetLoginUser();
      return;
    }
    const loginUser: User = {...responseBody as GetSignInUserResponseDto};
    setLoginUser(loginUser);
  }
  //          effect: accessToken cookie 값이 변경될 때 마다 실행할 함수          //
  useEffect(()=>{
    if (!cookies.accessToken){
      resetLoginUser();
      return;
    }
    getSignInUserRequest(cookies.accessToken).then(getSignInUserResponse);
  },[cookies.accessToken]);
  // 로그인 페이지 : "/"
  // 메인대시보드 페이지 : "/dashboard"
  return (
    <Routes>
      {/* 로그인 페이지 */}
      <Route path={AUTH_PATH()} element={<LoginPage />} />
      {/* 대시보드 페이지 */}
      <Route path={MAIN_PATH()} element={<DashboardPage />} />
      <Route path={INVT_PATH()} element={<InverterPage />} />
      <Route path={TRND_PATH()} element={<TrendPage />} />
      <Route path={REPT_PATH()} element={<ReportPage />} />
      {/* <Route path={HIST_PATH()} element={<HistoryPage />} /> */}
      {/* <Route path={ALERT_PATH()} element={<AlertPage />} /> */}
      {/* <Route path={PTMNG_PATH()} element={<PlantManagementPage />} /> */}
      {/* <Route path={DMNG_PATH()} element={<DeviceManagementPage />} /> */}
      {/* <Route path={UMNG_PATH()} element={<UserManagementPage />} /> */}
    </Routes>
  );
}

export default function Root(){
  return (
    <CookiesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookiesProvider>
  );
}
