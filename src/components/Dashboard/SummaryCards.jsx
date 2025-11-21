import StatBox from "../common/StatBox";

export default function SummaryCards({ stats }) {
  const map = [
    { key: "current", label: "현재 발전량", unit: "kW", color: "orange" },
    { key: "today",   label: "금일 발전량", unit: "kWh", color: "teal" },
    { key: "yesterday", label: "전일 발전량", unit: "kWh", color: "cyan" },
    { key: "month",  label: "월간 생산량", unit: "kWh", color: "blue" },
    { key: "total",  label: "누적 발전량", unit: "kWh", color: "slate" },
    { key: "hours",  label: "발전 시간", unit: "시간", color: "violet" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {map.map(({ key, label, unit, color }) => (
        <StatBox key={key} label={label} value={stats[key]} unit={unit} color={color} />
      ))}
    </div>
  );
}