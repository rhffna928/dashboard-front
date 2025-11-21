import PowerBadge from "./PowerBadge";
import WeatherSummary from "./WeatherSummary";
import TimestampPill from "./TimestampPill";
import logo from "../../assets/swlogo.png";

function LogoTitle({ title = "태양광발전 모니터링시스템" }) {
  return (
    <div className="flex items-center gap-2">
      <div>
        <img
          src={logo}
          alt="로고"
          className="h-8 w-auto mr-3"
        />
      </div>
      <span className="text-gray-800 font-semibold tracking-tight">{title}</span>
    </div>
  );
}
export const HEADER_H = 56; // px (Tailwind h-14)
export default function TopBar({
  powerKw = "0.00",
  weather = { temp: "19.0℃", humidity: "47%", windSpeed: "1.8m/s", windDir: "EE" },
  timestamp = "2021. 10. 29. 오전 11:21:22",
  title,
}) {
  return (
    <header className="fixed inset-x-1 top-1 z-50 h-14 border-b bg-teal-50/80 bg-gray-50">
      <div className="flex h-full items-center justify-center text-base font-semibold">
        <div className="flex me-auto gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <LogoTitle title={title} />
            <PowerBadge value={powerKw} />
          </div>
        </div>
        <div className="flex ms-auto max-w-screen-2xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-6 text-sm">
            <WeatherSummary {...weather} />
            <TimestampPill value={timestamp} />
          </div>
        </div>
      </div>
    </header>
  );
}