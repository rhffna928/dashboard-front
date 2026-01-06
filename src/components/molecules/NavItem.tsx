// src/components/molecules/NavItem.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

type SubItem = { title: string; path: string };

type NavItemProps = {
  title: string;
  icon?: string;
  path?: string;        // 단일 메뉴만
  subItems?: SubItem[]; // 그룹 메뉴만
  isActive: boolean;    // 그룹이면 "하위 중 하나 활성"일 때 true로 들어오는 값
  activeMenu?: string;  // (선택) 현재 pathname, 서브 active 표시용
};

export const NavItem: React.FC<NavItemProps> = ({
  title,
  icon,
  path,
  subItems,
  isActive,
  activeMenu,
}) => {
  const navigate = useNavigate();
  const hasSub = !!subItems?.length;

  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(0);

  // 그룹에서 하위 메뉴가 활성화되면 자동으로 펼치기
  React.useEffect(() => {
    if (hasSub && isActive) setOpen(true);
  }, [hasSub, isActive]);

  // open 상태에 따라 실제 높이 계산해서 부드럽게 애니메이션
  React.useLayoutEffect(() => {
    if (!hasSub) return;
    const el = contentRef.current;
    if (!el) return;

    // open일 때는 scrollHeight 만큼, 닫힐 때는 0
    const nextHeight = open ? el.scrollHeight : 0;
    setHeight(nextHeight);
  }, [open, hasSub, subItems?.length]);

  // 내용이 동적으로 바뀌는 경우(예: 서브메뉴 갯수/폰트 로딩)도 대응
  React.useEffect(() => {
    if (!hasSub) return;
    const el = contentRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      if (open) setHeight(el.scrollHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, hasSub]);

  const onHeaderClick = () => {
    if (hasSub) {
      setOpen((v) => !v);
      return;
    }
    if (path) navigate(path);
  };

  const headerClass = [
    "w-full flex items-center justify-between px-6 py-3 text-left",
    "text-white hover:bg-slate-800",
    isActive ? "bg-slate-800 font-semibold" : "",
  ].join(" ");

  const arrowClass = [
    "text-gray-400 transition-transform duration-200",
    open ? "rotate-90" : "rotate-0",
  ].join(" ");

  return (
    <div>
      {/* 상위 메뉴: 그룹이면 토글, 단일이면 navigate */}
      <button
        type="button"
        onClick={onHeaderClick}
        className={headerClass}
        aria-expanded={hasSub ? open : undefined}
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </span>

        {hasSub && <span className={arrowClass}></span>}
      </button>

      {/* 서브메뉴: 조건부 렌더링 금지(항상 렌더링), height로 애니메이션 */}
      {hasSub && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height,                     // ✅ 핵심: height 애니메이션
            opacity: open ? 1 : 0,       // 페이드
            transform: open ? "translateY(0px)" : "translateY(-2px)", // 살짝 움직임
          }}
        >
          {/* 실제 콘텐츠 높이 측정을 위한 ref */}
          <div ref={contentRef} className="pl-10 py-1 border-l border-slate-700 ml-6">
            {subItems!.map((sub) => {
              const subActive = activeMenu ? sub.path === activeMenu : false;
              return (
                <Link
                  key={sub.path}
                  to={sub.path}
                  className={[
                    "block py-2 text-sm text-gray-200 hover:text-white",
                    subActive ? "font-semibold text-white" : "",
                  ].join(" ")}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
