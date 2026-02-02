// src/components/organisms/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { NavItem } from '../molecules/NavItem';
import { StatusBadge } from '../atoms/StatusBadge';
import { useCookies } from 'react-cookie';
import { getSignInUserRequest } from '../../apis';
import useLoginUserStore from '../../stores/login-user.store';
import { useNavigate } from 'react-router-dom';
import { AUTH_PATH } from '../../constant';
import { Button } from '../atoms/Button';

interface SidebarProps {
    activeMenu: string;
}


export const Sidebar: React.FC<SidebarProps> = ({ activeMenu }) => {
    const navigate = useNavigate();
    const { resetLoginUser } = useLoginUserStore();
    const [cookies , , removeCookie] = useCookies(["accessToken"]);
    const [userInfo, setUserInfo] = useState<any>(null); // 유저 정보 상태
    const [userAuth, setUserAuth] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ✅ 로그아웃 공통 처리
    const logout = (reason?: string) => {
        // 1) 전역 유저 상태 초기화
        resetLoginUser();

        // 2) 토큰 쿠키 제거 (중요: path 지정해야 제대로 삭제됨)
        removeCookie("accessToken", { path: "/" });

        // 3) 화면 상태도 정리
        setUserInfo(null);
        setError(reason ?? null);

        // 4) 로그인으로 이동
        navigate(AUTH_PATH(), { replace: true });
    };
    useEffect(() => {
        const token = cookies.accessToken;
        if (!token) {
            logout("세션 만료");
        setError('Error fetching user info');
        } else {
        getSignInUserRequest(token).then((response) => {
            if (response && response.code === 'SU') {
                setUserAuth(response.auth);
                setUserInfo(response.userId); // 정상적인 사용자 정보 설정
            } else {
                setError('Error fetching user info');
            }
        });
        }
    }, [cookies.accessToken]);
    const isAdmin = userAuth === '5';
    // PDF [5, 6, 20]의 메뉴 구조 반영
    const menuData = [
        { title: '대시보드', icon: '🏠', path: '/dashboard' },
        { title: '인버터', icon: '🔋', path: '/inverter' },
        { title: '트렌드', icon: '📈', path: '/trend' },
        { title: '보고서', icon: '📰', path: '/report' },
        { title: '기록', icon: '📄', path: '/history' },
        { title: '알림', icon: '🔔', path: '/alert' },
        {
          title: '관리', icon: '⚙️', subItems: [
            { title: '발전소 관리', path: '/plant-management' }, 
            { title: '설비 관리', path: '/device-management' }, 
            { title: '사용자 관리', path: '/user-management' },
          ],
          path: 'management'
        },
    ];


    return (
        <div className="top-10 w-64 bg-slate-900 h-screen fixed">
            {/* Sidebar Header/Logo Area [5] */}
            <div className="p-4 bg-gray-800 flex items-center justify-between">
                <div>
                    <span className="text-xl font-bold text-white"></span>
                    <span className="ml-2 text-sm text-white">{userInfo}님</span> 
                </div>
                {/* ✅ 수동 로그아웃도 동작하게 */}
                <Button primary className="text-lg" onClick={() => logout()}>
                    로그아웃
                </Button>
            </div>

            {/* Navigation Items */}
            <nav className="mt-5">
                {/* 상단 탭 (대시보드 옆의 '총괄통합')은 단순 Placeholder 처리 [5] */}
                <div className="text-gray-500 text-sm px-6 mb-2">총괄통합 메뉴</div>
                
                {menuData  
                    .filter((item) => item.title !== '관리' || isAdmin)
                    .map((item) => (
                    <NavItem 
                        key={item.title} 
                        title={item.title} 
                        icon={item.icon} 
                        subItems={item.subItems} 
                        path={item.path}
                        isActive={activeMenu === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenu))}
                    />
                ))}
            </nav>
        </div>
    );
};