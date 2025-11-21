import NavBar from "../components/Nav/Nav";
import TopBar from "../components/Header/TopBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <TopBar title="태양광발전 모니터링시스템" powerKw="3.00" />
      <main className="ml-64 pt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
