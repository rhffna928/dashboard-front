// src/components/organisms/InverterCreateModal.tsx
import React from "react";
import { Button } from "../atoms/Button";
import type { CreateInverterRequestDto } from "../../apis/request/inverter_list";
import type { GetPlantList2ResponseDto } from "../../apis/response/plant_list";

// ✅ 성공 DTO에서 row 타입 직접 추출
type Plant = GetPlantList2ResponseDto["plantList2"][number];

type Props = {
  open: boolean;
  plants: Plant[];
  accessToken: string;
  onClose: () => void;
  onCreated?: () => void;
  onCreate: (body: CreateInverterRequestDto, token: string) => Promise<any>;
};

// Row 컴포넌트 분리 + memo
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

export const InverterCreateModal: React.FC<Props> = ({
  open,
  plants,
  accessToken,
  onClose,
  onCreated,
  onCreate,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreateInverterRequestDto>({
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
    invFault: "0",
    mccbId: 0,
    mccbStatus: 0,
  });

  // 필드 setter
  const set = React.useCallback(
    <K extends keyof CreateInverterRequestDto>(key: K, value: CreateInverterRequestDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // select 옵션 - as any 제거
  const plantOptions = React.useMemo(
    () =>
      plants.map((p) => (
        
        <option key={p.plantId} value={p.plantId}>
          {p.plantId} - {p.plantName} (inv_count: {p.invCount})
        </option>
      )),
    [plants]
  );

  // unit 변경 시 plantId/groupId 동기화
  const onUnitChange = React.useCallback((unitId: number) => {
    setForm((prev) => ({
      ...prev,
      unitId,
      plantId: unitId,
      groupId: unitId,
    }));
  }, []);

  // 모달 오픈 시 기본값 세팅
  React.useEffect(() => {
    console.log(plants)
    if (!open) return;

    setError(null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, plants]);

  const submit = React.useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await onCreate(form, accessToken);

      if (res && res.code === "SU") {
        onCreated?.();
        onClose();
      } else {
        if(res?.code === "VF"){
          setError("값을 입력하세요.");
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "등록 중 오류");
    } finally {
      setSaving(false);
    }
  }, [accessToken, form, onClose, onCreate, onCreated]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white border shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-semibold text-slate-900">인버터 등록</div>
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
                value={form.unitId ?? ""}
                onChange={(e) => onUnitChange(Number(e.target.value))}
              >
                <option value="" >선택</option>
                {plantOptions }
              </select>
            </Row>

            <Row label="device_id">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invId}
                onChange={(e) => set("invId", e.target.value)}
              />
            </Row>

            <Row label="명칭">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invName}
                onChange={(e) => set("invName", e.target.value)}
              />
            </Row>

            <Row label="타입">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invType}
                onChange={(e) => set("invType", e.target.value)}
              />
            </Row>

            <Row label="모델명">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invModel}
                onChange={(e) => set("invModel", e.target.value)}
              />
            </Row>

            <Row label="통신프로토콜">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invProtocol}
                onChange={(e) => set("invProtocol", e.target.value)}
              />
            </Row>

            <Row label="용량(kW)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.invCapacity)}
                onChange={(e) =>
                  set("invCapacity", e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </Row>

            <Row label="출력범위(min)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.minPower)}
                onChange={(e) =>
                  set("minPower", e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </Row>

            <Row label="출력범위(max)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.maxPower)}
                onChange={(e) =>
                  set("maxPower", e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </Row>

            <Row label="활성화">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.useYn}
                onChange={(e) => set("useYn", e.target.value)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="blue"
              onClick={submit}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
            <Button
              variant="dark"
              onClick={onClose}
              className="border px-4 py-2 rounded disabled:opacity-60"
              disabled={saving}
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};