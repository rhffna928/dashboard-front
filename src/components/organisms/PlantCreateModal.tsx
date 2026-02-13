// src/components/organisms/PlantCreateModal.tsx
import React from "react";
import { Button } from "../atoms/Button";
import type {CreatePlantRequestDto} from "../../apis/request/plant_list";
import type User from "types/interface/user.interface";

type Props = {
  open: boolean;
  accessToken: string;
  users: User[];
  onClose: () => void;
  onCreated?: () => void;
  onCreate: (body: CreatePlantRequestDto, token: string) => Promise<any>;
};

const Row = React.memo(function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] border-b last:border-b-0">
      <div className="bg-slate-50 text-slate-700 text-sm px-3 py-2 flex items-center justify-center">
        {props.label}
      </div>
      <div className="px-3 py-2">{props.children}</div>
    </div>
  );
});

export const PlantCreateModal: React.FC<Props> = ({
  open,
  accessToken,
  users,
  onClose,
  onCreated,
  onCreate,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreatePlantRequestDto>({
    plantCode: 0,
    plantName: "",
    plantOwner: "",
    plantMan: "",
    userId: "",
    plantCapacity: "",
    plantPrice: "",
    address: "",
    lat: "",
    lng: "",
    useYn: "Y",
    smsYn: "N",
    infoYn: "N",
    startYmd: "",
    startYear: "",
    moduleInfo: "",
    invInfo: "",
    getDataSec: 60,
    yesGen: 0,
    monthGen: 0,
  });

  const set = React.useCallback(
    <K extends keyof CreatePlantRequestDto>(key: K, value: CreatePlantRequestDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );
  const userOptions = React.useMemo(
    () =>
      users.map((u) => (
        <option key={u.userId} value={u.userId}>
          {u.userId} - {u.userName}
        </option>
      )),
    [users]
  );
  
  React.useEffect(() => {
    if (!open) return;
    console.log(users[1].userName)
    setError(null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
          alert()
          setError("값을 입력하세요.");
        }
        setError(res?.message ?? "등록 실패");
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
      <div className="w-full max-w-3xl rounded-xl bg-white border shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-semibold text-slate-900">발전소 등록</div>
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
            <Row label="plant_code">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.plantCode)}
                onChange={(e) => set("plantCode", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="발전소명">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.plantName}
                onChange={(e) => set("plantName", e.target.value)}
              />
            </Row>

            <Row label="소유자">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.plantOwner}
                onChange={(e) => set("plantOwner", e.target.value)}
              />
            </Row>

            <Row label="담당자">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.plantMan}
                onChange={(e) => set("plantMan", e.target.value)}
              />
            </Row>

            <Row label="사용자(user_id)">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.userId ?? ""}
                onChange={(e) => set("userId", e.target.value)}
              >
                <option value="">선택</option>
                {userOptions as any}
              </select>
            </Row>

            <Row label="용량">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.plantCapacity}
                onChange={(e) => set("plantCapacity", e.target.value)}
                placeholder="예: 100kW"
              />
            </Row>

            <Row label="단가(원)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.plantPrice}
                onChange={(e) => set("plantPrice", e.target.value)}
              />
            </Row>

            <Row label="주소">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Row>

            <Row label="위도(lat)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.lat ?? "")}
                onChange={(e) => set("lat", e.target.value)}
              />
            </Row>

            <Row label="경도(lng)">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.lng ?? "")}
                onChange={(e) => set("lng", e.target.value)}
              />
            </Row>

            <Row label="활성화(useYn)">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.useYn ?? "N"}
                onChange={(e) => set("useYn", e.target.value)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>

            <Row label="SMS(smsYn)">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.smsYn ?? "N"}
                onChange={(e) => set("smsYn", e.target.value)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>

            <Row label="INFO(infoYn)">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.infoYn ?? "N"}
                onChange={(e) => set("infoYn", e.target.value)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>

            <Row label="start_ymd">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.startYmd}
                onChange={(e) => set("startYmd", e.target.value)}
                placeholder="예: 20260101 또는 2026-01-01"
              />
            </Row>

            <Row label="start_year">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.startYear}
                onChange={(e) => set("startYear", e.target.value)}
                placeholder="예: 2026"
              />
            </Row>

            <Row label="module_info">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.moduleInfo}
                onChange={(e) => set("moduleInfo", e.target.value)}
              />
            </Row>

            <Row label="inv_info">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.invInfo}
                onChange={(e) => set("invInfo", e.target.value)}
              />
            </Row>

            <Row label="get_data_sec">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.getDataSec)}
                onChange={(e) => set("getDataSec", e.target.value === "" ? 0 : Number(e.target.value))}
              />
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