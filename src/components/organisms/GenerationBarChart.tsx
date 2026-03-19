import React from "react";

export type GenerationChartItem = {
  label: string;
  value: number;
};

type GenerationBarChartProps = {
  title?: string;
  data: GenerationChartItem[];
  loading?: boolean;
  height?: number;
  emptyMessage?: string;
  unit?: string;
  showValue?: boolean;
  className?: string;
};

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export const GenerationBarChart: React.FC<GenerationBarChartProps> = ({
  title = "발전 그래프",
  data,
  loading = false,
  height = 320,
  emptyMessage = "조회 결과가 없습니다.",
  unit = "",
  showValue = true,
  className = "",
}) => {
  const maxValue = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((item) => Number(item.value ?? 0)), 0);
  }, [data]);

  const chartBodyHeight = Math.max(height - 60, 180);

  return (
    <section className={`bg-white border rounded p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-900 font-semibold">{title}</div>
        {!loading && data?.length > 0 && (
          <div className="text-sm text-slate-500">총 {data.length}개 구간</div>
        )}
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height }}
        >
          불러오는 중...
        </div>
      ) : !data || data.length === 0 ? (
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className="border rounded p-4 overflow-x-auto">
          <div className="min-w-[720px]">
            <div
              className="flex items-end gap-3"
              style={{ height: chartBodyHeight }}
            >
              {data.map((item, idx) => {
                const value = Number(item.value ?? 0);
                const ratio = maxValue > 0 ? value / maxValue : 0;
                const barHeight = Math.max(ratio * (chartBodyHeight - 50), 4);

                return (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex-1 min-w-[32px] flex flex-col items-center justify-end"
                    title={`${item.label} / ${formatNumber(value)}${unit ? ` ${unit}` : ""}`}
                  >
                    {showValue && (
                      <div className="text-[11px] text-slate-500 mb-2 whitespace-nowrap">
                        {formatNumber(value)}
                        {unit ? ` ${unit}` : ""}
                      </div>
                    )}

                    <div
                      className="w-full max-w-[42px] bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                      style={{ height: `${barHeight}px` }}
                    />

                    <div className="mt-2 text-[11px] text-slate-600 text-center break-all">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GenerationBarChart;