export default function PowerBadge({ value }) {
  return (
    <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white tabular-nums shadow-sm">
      {value}kW
    </span>
  );
}