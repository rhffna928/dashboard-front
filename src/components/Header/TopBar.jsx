import logo from "../../assets/swlogo.png";

function PowerBadge({ value = "0.00" }) {
  return (
    <span className="ml-3 rounded-full bg-orange-500/90 px-3 py-1 text-sm font-semibold text-white shadow">
      {value}kW
    </span>
  );
}

function WeatherSummary({ temp="19.0℃", humidity="47%", windSpeed="1.8m/s", windDir="EE" }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="inline-flex items-center gap-1">
        <span className="i">🌤️</span> 기온 <b className="text-orange-600">{temp}</b>
      </span>
      <span className="inline-flex items-center gap-1">
        습도 <b className="text-orange-600">{humidity}</b>
      </span>
      <span className="inline-flex items-center gap-1">
        풍속 <b className="text-orange-600">{windSpeed}</b>
      </span>
      <span className="inline-flex items-center gap-1">
        풍향 <b className="text-orange-600">{windDir}</b>
      </span>
    </div>
  );
}

function TimestampPill({ value }) {
  return (
    <span className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600">
      {value}
    </span>
  );
}

function LogoTitle({ title = "태양광발전 모니터링시스템" }) {
  return (
    <div className="flex items-center">
      <img src={logo} alt="로고" className="mr-3 h-8 w-auto" />
      <span className="text-gray-800 font-semibold tracking-tight">{title}</span>
    </div>
  );
}

export default function TopBar({
  powerKw = "3.00",
  weather = { temp: "19.0℃", humidity: "47%", windSpeed: "1.8m/s", windDir: "EE" },
  timestamp = "2021. 10. 29. 오전 11:21:22",
  title,
}) {
  return (
    <header className="fixed top-0 left-64 right-0 z-50 h-16 border-b bg-white/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <LogoTitle title={title} />
          <PowerBadge value={powerKw} />
        </div>
        <div className="flex items-center gap-6">
          <WeatherSummary {...weather} />
          <TimestampPill value={timestamp} />
        </div>
      </div>
    </header>
  );
}