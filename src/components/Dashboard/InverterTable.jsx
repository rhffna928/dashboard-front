import Card from "../common/Card";

export default function InverterTable({ rows = [] }) {
  return (
    <Card title="인버터 현황">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2">번호</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">출력전력</th>
              <th className="px-3 py-2">금일발전량</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.no ?? i} className="border-t">
                <td className="px-3 py-2">{r.no ?? "-"}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {r.status ?? "-"}
                  </span>
                </td>
                <td className="px-3 py-2">{r.power ?? "-"}</td>
                <td className="px-3 py-2">{r.today ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
