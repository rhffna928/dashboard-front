function WeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M6 19a4 4 0 1 1 1.2-7.82A6 6 0 0 1 18 7a6 6 0 0 1 1.26 11.86L6 19z" />
    </svg>
  );
}

export default function WeatherSummary({ temp, humidity, windSpeed, windDir }) {
  const L = "text-orange-600 font-semibold";
  const N = "tabular-nums";
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gray-500">날씨</span>
      <WeatherIcon />
      <span className={L}>기온</span><span className={N}>{temp}</span>
      <span className={L}>습도</span><span className={N}>{humidity}</span>
      <span className={L}>풍속</span><span className={N}>{windSpeed}</span>
      <span className={L}>풍향</span><span className={N}>{windDir}</span>
    </div>
  );
}