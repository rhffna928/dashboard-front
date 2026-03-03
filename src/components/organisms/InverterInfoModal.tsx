import React from "react";
import { Button } from "../atoms/Button";
import type { InverterList2Row } from "../../types/interface/inverterList.interface";

type Props = {
  open: boolean;
  inverter: InverterList2Row | null;
  onClose: () => void;
};

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <tr className="border-b last:border-b-0">
    <td className="bg-slate-50 text-slate-600 px-4 py-2 w-[160px]">{label}</td>
    <td className="px-4 py-2 text-slate-900">{value ?? "-"}</td>
  </tr>
);

export const InverterInfoModal: React.FC<Props> = ({ open, inverter, onClose }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !inverter) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[720px] bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="text-lg font-semibold text-slate-900">인버터 상세정보</div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-slate-100"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <div className="border rounded overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="unit_id" value={inverter.unitId} />
                  <Row label="device_id" value={inverter.invId} />
                  <Row label="명칭" value={inverter.invName} />
                  <Row label="타입" value={inverter.invType} />
                  <Row label="모델명" value={inverter.invModel} />
                  <Row label="통신프로토콜" value={inverter.invProtocol} />
                  <Row label="용량(kW)" value={inverter.invCapacity} />
                  <Row label="출력범위(min)" value={inverter.minPower} />
                  <Row label="출력범위(max)" value={inverter.maxPower} />
                  <Row label="활성화" value={inverter.useYn} />
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="dark" onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};