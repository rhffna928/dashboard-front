import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const PlaceholderIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9.75 17L9 20l-1 1h8l-1-1l-.75-3M3 13h18M14 17h6l1-1V5l-1-1H3l-1 1v10l1 1h6" />
  </svg>
);

const ChevronDown: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

interface SubItem {
  title: string;
  path: string;
}

interface NavItemProps {
  title: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
  path: string;
  isActive: boolean; // 기존 그대로 유지
}

export const NavItem: React.FC<NavItemProps> = ({
  title,
  icon,
  subItems = [],
  path,
  isActive,
}) => {
  const location = useLocation();
  const hasSub = subItems.length > 0;

  // ✅ path가 "dashboard"처럼 슬래시 없을 수도 있으니 표준화
  const to = useMemo(() => (path.startsWith("/") ? path : `/${path}`), [path]);

  // ✅ 현재 경로가 subItem 중 하나면 자동으로 열리게
  const isSubActive = useMemo(() => {
    if (!hasSub) return false;
    return subItems.some((s) => {
      const subTo = s.path.startsWith("/") ? s.path : `/${s.path}`;
      return location.pathname === subTo || location.pathname.startsWith(`${subTo}/`);
    });
  }, [hasSub, subItems, location.pathname]);

  const [isOpen, setIsOpen] = useState<boolean>(isActive || isSubActive);

  useEffect(() => {
    if (hasSub) setIsOpen(isActive || isSubActive);
  }, [isActive, isSubActive, hasSub]);

  const activeClass = isActive || isSubActive
    ? "bg-slate-700 text-white font-semibold"
    : "text-gray-400 hover:bg-slate-700 hover:text-white";

  return (
    <div>
      <div className={`flex items-center p-3 text-sm transition duration-200 ${activeClass}`}>
        <span className="w-5 h-5 mr-3">{icon || <PlaceholderIcon />}</span>

        {/* ✅ 여기서 라우팅 발생 */}
        <NavLink to={to} className="flex-1">
          {title}
        </NavLink>

        {hasSub && (
          <button
            type="button"
            className="ml-2"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={`${title} 하위 메뉴 ${isOpen ? "접기" : "펼치기"}`}
          >
            <ChevronDown open={isOpen} />
          </button>
        )}
      </div>

      {hasSub && isOpen && (
        <div className="pl-6 bg-slate-700">
          {subItems.map((item) => {
            const subTo = item.path.startsWith("/") ? item.path : `/${item.path}`;
            return (
              <NavLink
                key={item.title}
                to={subTo}
                className={({ isActive }) =>
                  `block p-2 text-sm cursor-pointer ${
                    isActive ? "text-white font-semibold bg-slate-600" : "text-gray-300 hover:bg-slate-600"
                  }`
                }
              >
                {item.title}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
