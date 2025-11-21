import { NavLink } from "react-router-dom";

const base = "flex items-center gap-2 rounded-md px-3 py-2";
const idle = "text-gray-200 hover:bg-gray-800";
const active = "bg-gray-800 text-white font-semibold";

const Item = ({ to, icon, label }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      end={to === "/"}  // 대시보드만 정확히 일치
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  </li>
);

export default function NavBar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="font-semibold">홍길동 님</div>
        <button className="rounded bg-gray-700 px-2 py-1 text-xs">로그아웃</button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          <Item to="/" icon="💻" label="대시보드" />
          <Item to="/inverters" icon="📟" label="인버터" />
          <Item to="/trends" icon="📈" label="트렌드" />
          <Item to="/reports" icon="📄" label="보고서" />
          <Item to="/logs" icon="🧾" label="기록" />
          <Item to="/alarms" icon="⚠️" label="알람" />

          <li className="mt-3 text-xs uppercase text-gray-400">관리</li>
          <Item to="/admin/plants" icon="🏭" label="발전소 관리" />
          <Item to="/admin/equipment" icon="🛠️" label="설비 관리" />
          <Item to="/admin/users" icon="👤" label="사용자 관리" />
        </ul>
      </nav>

      <div className="px-3 pb-3 text-xs text-gray-400">v1.0</div>
    </aside>
  );
}
