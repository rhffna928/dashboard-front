// src/components/organisms/InverterDetailModal.tsx
import React from "react";
import { Button } from "../atoms/Button";
import { fetchPlants } from "../../apis/plant/plant.api";
import type { UpdateInverterRequestDto } from "../../apis/request/inverter_list";

type Plant = Awaited<ReturnType<typeof fetchPlants>>[number];

export type InverterSummary = {
  id: number;
  plantId: number;
  groupId: number;
  unitId: number;
  invId: string;
  invName: string;
  invType: string;
  invModel: string;
  invProtocol: string;
  invCapacity: number;
  minPower: number;
  maxPower: number;
  todayGen: number;
  totalGen: number;
  useYn: string;
  invFault: string;
  mccbId: number;
  mccbStatus: number;
};

type Props = {
  open: boolean;
  inverter: InverterSummary | null;
  plants: Plant[];
  accessToken: string;

  onClose: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;

  onUpdate: (id: number, body: UpdateInverterRequestDto, token: string) => Promise<any>;
  onDelete: (id: number, token: string) => Promise<any>;
};

const Row = React.memo(function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b last:border-b-0">
      <div className="bg-slate-50 text-slate-700 text-sm px-3 py-2 flex items-center justify-center">
        {props.label}
      </div>
      <div className="px-3 py-2">{props.children}</div>
    </div>
  );
});

export const InverterDetailModal: React.FC<Props> = ({
  open,
  inverter,
  plants,
  accessToken,
  onClose,
  onSaved,
  onDeleted,
  onUpdate,
  onDelete,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<UpdateInverterRequestDto>({
    plantId: 0,
    groupId: 0,
    unitId: 0,
    invId: "",
    invName: "",
    invType: "",
    invModel: "",
    invProtocol: "",
    invCapacity: 0,
    minPower: 0,
    maxPower: 0,
    todayGen: 0,
    totalGen: 0,
    useYn: "Y",
    invFault: "",
    mccbId: 0,
    mccbStatus: 0,
  });

  const set = React.useCallback(
    <K extends keyof UpdateInverterRequestDto>(key: K, value: UpdateInverterRequestDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const plantOptions = React.useMemo(
    () =>
      plants.map((p) => (
        <option key={(p as any).id ?? (p as any).unitId} value={(p as any).id ?? (p as any).unitId}>
          {(p as any).id ?? (p as any).unitId}
          {(p as any).name ? ` - ${(p as any).name}` : ""} (inv_count: {(p as any).invCount ?? (p as any).inv_count})
        </option>
      )),
    [plants]
  );

  React.useEffect(() => {
    if (!open || !inverter) return;
    setError(null);

    const unit = inverter.unitId ?? inverter.plantId ?? inverter.groupId;

    setForm({
      unitId: unit,
      plantId: unit,
      groupId: unit,
      invId: inverter.invId ?? "",
      invName: inverter.invName ?? "",
      invType: inverter.invType ?? "",
      invModel: inverter.invModel ?? "",
      invProtocol: inverter.invProtocol ?? "",
      invCapacity: Number(inverter.invCapacity ?? 0),
      minPower: Number(inverter.minPower ?? 0),
      maxPower: Number(inverter.maxPower ?? 0),
      todayGen: Number(inverter.todayGen ?? 0),
      totalGen: Number(inverter.totalGen ?? 0),
      useYn: inverter.useYn ?? "Y",
      invFault: inverter.invFault ?? "",
      mccbId: Number(inverter.mccbId ?? 0),
      mccbStatus: Number(inverter.mccbStatus ?? 0),
    });
    // esc 닫기
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);

  }, [open,onClose, inverter]);

  const onUnitChange = React.useCallback((unitId: number) => {
    setForm((prev) => ({
      ...prev,
      unitId,
      plantId: unitId,
      groupId: unitId,
    }));
  }, []);

  const submit = React.useCallback(async () => {
    if (!inverter) return;

    setSaving(true);
    setError(null);

    try {
      const res = await onUpdate(inverter.id, form, accessToken);
      if (res && res.code === "SU") {
        onSaved?.();
        onClose();
      } else {
        setError(res?.message ?? "수정 실패");
      }
    } catch (e: any) {
      setError(e?.message ?? "수정 중 오류");
    } finally {
      setSaving(false);
    }
  }, [accessToken, form, inverter, onClose, onSaved, onUpdate]);

  const remove = React.useCallback(async () => {
    if (!inverter) return;
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await onDelete(inverter.id, accessToken);
      if (res && res.code === "SU") {
        onDeleted?.();
        onClose();
      } else {
        setError(res?.message ?? "삭제 실패");
      }
    } catch (e: any) {
      setError(e?.message ?? "삭제 중 오류");
    } finally {
      setDeleting(false);
    }
  }, [accessToken, inverter, onClose, onDelete, onDeleted]);

  if (!open || !inverter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white border shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-semibold text-slate-900">인버터 상세 / 수정</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="px-6 pb-4">
          {error && (
            <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="border rounded overflow-hidden">
            <Row label="unit_id">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.unitId}
                onChange={(e) => onUnitChange(Number(e.target.value))}
              >
                {plantOptions}
              </select>
              <div className="mt-1 text-xs text-slate-500">
                unit_id 변경 시 백엔드 트랜잭션 규칙으로 inv_count가 처리된 후 저장 성공 시 목록이 새로고침됩니다.
              </div>
            </Row>

            <Row label="device_id">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.invId} onChange={(e) => set("invId", e.target.value)} />
            </Row>

            <Row label="명칭">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.invName} onChange={(e) => set("invName", e.target.value)} />
            </Row>

            <Row label="타입">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.invType} onChange={(e) => set("invType", e.target.value)} />
            </Row>

            <Row label="모델명">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.invModel} onChange={(e) => set("invModel", e.target.value)} />
            </Row>

            <Row label="통신프로토콜">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.invProtocol} onChange={(e) => set("invProtocol", e.target.value)} />
            </Row>

            <Row label="용량(kW)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                inputMode="decimal"
                value={String(form.invCapacity)}
                onChange={(e) => set("invCapacity", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="출력범위(min)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                inputMode="decimal"
                value={String(form.minPower)}
                onChange={(e) => set("minPower", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="출력범위(max)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                inputMode="decimal"
                value={String(form.maxPower)}
                onChange={(e) => set("maxPower", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="활성화">
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.useYn} onChange={(e) => set("useYn", e.target.value)}>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>
          </div>

          <div className="flex justify-between mt-5">
            <Button onClick={remove} className="px-5 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm">
              {deleting ? "삭제 중..." : "삭제"}
            </Button>

            <div className="flex gap-2">
              <Button primary onClick={submit} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
                {saving ? "저장 중..." : "저장"}
              </Button>
              <Button onClick={onClose} className="px-6 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 text-sm">
                닫기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
