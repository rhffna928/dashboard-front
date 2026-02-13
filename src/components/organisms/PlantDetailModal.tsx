// src/components/organisms/PlantDetailModal.tsx
import React from "react";
import { Button } from "../atoms/Button";
import type { PlantList2Row } from "../../types/interface/plantList2.interface";
import type { UpdatePlantRequestDto } from "../../apis/request/plant_list";
import type User from "types/interface/user.interface";

type Props = {
  open: boolean;
  plant: PlantList2Row | null;
  users: User[];
  accessToken: string;

  onClose: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;

  onUpdate: (id: number, body: UpdatePlantRequestDto, token: string) => Promise<any>;
  onDelete: (id: number, token: string) => Promise<any>;
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

// 유저 표시 문자열/값 추출 (User 타입이 프로젝트마다 달라서 안전하게)
const getUserValue = (u: any) => String(u.userId ?? u.id ?? u.username ?? "");
const getUserLabel = (u: any) => {
  const id = u.userId ?? u.id ?? u.username ?? "";
  const name = u.name ?? u.userName ?? u.nickname ?? u.email ?? "";
  return name ? `${id} - ${name}` : String(id);
};

export const PlantDetailModal: React.FC<Props> = ({
  open,
  plant,
  users,
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

  const [form, setForm] = React.useState<UpdatePlantRequestDto>({
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
    infoYn: "",
    startYmd: "",
    startYear: "",
    moduleInfo: "",
    invInfo: "",
    getDataSec: 60,
    yesGen: 0,
    monthGen: 0,
    regdate: "",
  });

  const set = React.useCallback(
    <K extends keyof UpdatePlantRequestDto>(key: K, value: UpdatePlantRequestDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const userOptions = React.useMemo(
    () =>
      users
        .map((u: any) => {
          const value = getUserValue(u);
          if (!value) return null;
          return (
            <option key={value} value={value}>
              {getUserLabel(u)}
            </option>
          );
        })
        .filter(Boolean),
    [users]
  );

  React.useEffect(() => {
    if (!open || !plant) return;

    setError(null);

    setForm({
      plantCode: Number(plant.plantCode ?? 0),
      plantName: plant.plantName ?? "",
      plantOwner: plant.plantOwner ?? "",
      plantMan: plant.plantMan ?? "",
      userId: plant.userId ?? "",
      plantCapacity: plant.plantCapacity ?? "",
      plantPrice: plant.plantPrice ?? "",
      address: plant.address ?? "",
      lat: plant.lat ?? "",
      lng: plant.lng ?? "",
      useYn: plant.useYn ?? "Y",
      smsYn: plant.smsYn ?? "N",
      infoYn: (plant as any).infoYn ?? "",
      startYmd: plant.startYmd ?? "",
      startYear: plant.startYear ?? "",
      moduleInfo: plant.moduleInfo ?? "",
      invInfo: (plant as any).invInfo ?? "",
      getDataSec: Number(plant.getDataSec ?? 0),
      yesGen: Number(plant.yesGen ?? 0),
      monthGen: Number(plant.monthGen ?? 0),
      regdate: plant.regDate ?? "",
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, plant, onClose]);

  const submit = React.useCallback(async () => {
    if (!plant) return;

    setSaving(true);
    setError(null);

    try {
      const res = await onUpdate(plant.plantId, form, accessToken);
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
  }, [accessToken, form, onClose, onSaved, onUpdate, plant]);

  const remove = React.useCallback(async () => {
    if (!plant) return;

    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await onDelete(plant.plantId, accessToken);
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
  }, [accessToken, onClose, onDelete, onDeleted, plant]);

  if (!open || !plant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white border shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-semibold text-slate-900">발전소 상세 / 수정</div>
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
            <Row label="plant_id">
              <div className="text-sm text-slate-800">{plant.plantId}</div>
            </Row>

            <Row label="plant_code">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.plantCode)}
                onChange={(e) => set("plantCode", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="발전소명">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.plantName} onChange={(e) => set("plantName", e.target.value)} />
            </Row>

            <Row label="소유주">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.plantOwner} onChange={(e) => set("plantOwner", e.target.value)} />
            </Row>

            <Row label="전문기업">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.plantMan} onChange={(e) => set("plantMan", e.target.value)} />
            </Row>

            {/* 여기! userId를 select로 */}
            <Row label="사용자(user_id)">
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.userId ?? ""}
                onChange={(e) => set("userId", e.target.value)}
              >
                <option value="">선택</option>
                {userOptions as any}
              </select>
              <div className="mt-1 text-xs text-slate-500">
                목록에 없으면 admin users API 응답 구조/필드(userId)가 다른지 확인 필요
              </div>
            </Row>

            <Row label="용량">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.plantCapacity} onChange={(e) => set("plantCapacity", e.target.value)} />
            </Row>

            <Row label="단가(원)">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.plantPrice} onChange={(e) => set("plantPrice", e.target.value)} />
            </Row>

            <Row label="주소">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Row>

            <Row label="위도(lat)">
              <input className="w-full border rounded px-3 py-2 text-sm" value={String(form.lat ?? "")} onChange={(e) => set("lat", e.target.value)} />
            </Row>

            <Row label="경도(lng)">
              <input className="w-full border rounded px-3 py-2 text-sm" value={String(form.lng ?? "")} onChange={(e) => set("lng", e.target.value)} />
            </Row>

            <Row label="인버터 수(inv_count)">
              <div className="text-sm text-slate-800">{plant.invCount}</div>
            </Row>

            <Row label="활성화(useYn)">
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.useYn ?? "N"} onChange={(e) => set("useYn", e.target.value)}>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>

            <Row label="SMS(smsYn)">
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.smsYn ?? "N"} onChange={(e) => set("smsYn", e.target.value)}>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Row>

            <Row label="start_ymd">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.startYmd} onChange={(e) => set("startYmd", e.target.value)} />
            </Row>

            <Row label="start_year">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.startYear} onChange={(e) => set("startYear", e.target.value)} />
            </Row>

            <Row label="module_info">
              <input className="w-full border rounded px-3 py-2 text-sm" value={form.moduleInfo} onChange={(e) => set("moduleInfo", e.target.value)} />
            </Row>

            <Row label="get_data_sec">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={String(form.getDataSec)}
                onChange={(e) => set("getDataSec", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>

            <Row label="yes_gen">
              <input className="w-full border rounded px-3 py-2 text-sm" value={String(form.yesGen)} onChange={(e) => set("yesGen", e.target.value === "" ? 0 : Number(e.target.value))} />
            </Row>

            <Row label="month_gen">
              <input className="w-full border rounded px-3 py-2 text-sm" value={String(form.monthGen)} onChange={(e) => set("monthGen", e.target.value === "" ? 0 : Number(e.target.value))} />
            </Row>

            <Row label="reg_date">
              <div className="text-sm text-slate-800">{plant.regDate}</div>
            </Row>
          </div>

          <div className="flex justify-between mt-5">
            <Button
              onClick={remove}
              className="px-5 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm"
              disabled={saving || deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </Button>

            <div className="flex gap-2">
              <Button
                primary
                onClick={submit}
                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                disabled={saving || deleting}
              >
                {saving ? "저장 중..." : "저장"}
              </Button>

              <Button
                onClick={onClose}
                className="px-6 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 text-sm"
                disabled={saving || deleting}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};