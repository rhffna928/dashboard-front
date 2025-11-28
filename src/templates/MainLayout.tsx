// src/templates/MainLayout.tsx
import React from 'react';
import { Sidebar } from '../components/organisms/Sidebar';
import { AppHeader } from '../components/organisms/AppHeader';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
    activeMenu: string;
    pageTitle: string;
    pageSubtitle: string;
    children: React.ReactNode;
}



export const MainLayout: React.FC<MainLayoutProps> = ({ activeMenu, pageTitle, pageSubtitle, children }) => {

    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token"); // JWT 삭제
        navigate("/");
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />
            
            <div className="flex-1 ml-64">
                <AppHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
                
                {/* Content Area (Header의 12px + 4*2rem = 12 + 80 = 92px 높이만큼 여백) */}
                <main className="pt-[110px] p-6"> 
                    {children}
                </main>
            </div>
        </div>
    );
};