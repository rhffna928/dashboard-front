export const InverterTable = () => {
  return (
    <div className="bg-white border rounded overflow-x-auto">
      <table className="w-full text-sm text-center border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="border p-2">번호</th>
            <th className="border p-2">상태</th>
            <th className="border p-2">입력전압</th>
            <th className="border p-2">입력전류</th>
            <th className="border p-2">출력(kW)</th>
            <th className="border p-2">금일발전량(kWh)</th>
            <th className="border p-2">누적발전량(MWh)</th>
            <th className="border p-2">마지막 수신</th>
            <th className="border p-2">상세</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-2">INV01</td>
            <td className="border p-2 text-green-600">Run</td>
            <td className="border p-2">377.0</td>
            <td className="border p-2">7.0</td>
            <td className="border p-2">2.6</td>
            <td className="border p-2">69.9</td>
            <td className="border p-2">19.73</td>
            <td className="border p-2">2021-10-29 11:17:57</td>
            <td className="border p-2">
              <button className="border px-2 py-1 rounded">상세정보</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
