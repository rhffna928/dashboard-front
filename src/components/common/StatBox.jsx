export default function StatBox({ label, value, unit, color = "orange" }) {
  const palette = {
    orange: "from-orange-500 to-orange-600",
    teal: "from-teal-500 to-teal-600",
    cyan: "from-cyan-500 to-cyan-600",
    blue: "from-blue-500 to-blue-600",
    slate: "from-slate-600 to-slate-700",
    violet: "from-violet-500 to-violet-600",
  };
  return (
    <div className="rounded-lg bg-gradient-to-br p-[1px] shadow">
      <div className={`rounded-lg bg-white`}>
        <div className={`rounded-t-lg bg-gradient-to-r ${palette[color]} px-3 py-1 text-xs font-semibold text-white`}>
          {label}
        </div>
        <div className="flex items-end justify-between px-3 pb-2 pt-3">
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className="text-xs text-gray-500">{unit}</div>
        </div>
      </div>
    </div>
  );
}
