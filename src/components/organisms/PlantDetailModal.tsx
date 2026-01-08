import React, { useEffect, useState } from "react";
import type { Plant } from "../../types/interface/plant.interface";

interface Props {
  open: boolean;
  plant: Plant | null;
  onClose: () => void;
  onSave: (updated: Plant) => void;
  onDelete: (id: number) => void;
}

export const PlantDetailModal: React.FC<Props> = ({ open, plant, onClose, onSave, onDelete }) => {
  if (!open) return null;

  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Plant | null>(null);

  
  useEffect(() => {
    setForm(plant);
  }, [plant]);



  const handleClickEdit = () => setIsEdit(true);


  
  const handleClickCancel = () => {
    if (plant) setForm({ ...plant });
    setIsEdit(false);
  };



  const handleClickSave = async () => {
    if (!form) return;

    const ok = window.confirm("저장하시겠습니까?");
    if (!ok) return;

    await onSave(form);

    alert("저장되었습니다.");   // ✅ 추가
    setIsEdit(false);
  };


  const handleClickDelete = async () => {
    if (!plant) return;

    const ok = window.confirm("발전소 정보를 삭제 하시겠습니까?");
    if (!ok) return;

    await onDelete(plant.id);
  };




  const setField = <K extends keyof Plant>(key: K, value: Plant[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-[720px] rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">발전소 상세정보</div>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        {/* 상단 버튼 */}
        <div className="flex gap-2 mb-3">
          {!isEdit && (
            <>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleClickEdit}>
                수정
              </button>
              
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleClickDelete}>
                삭제
              </button>
            </>
          )}
        </div>


        {/* 내용 */}
        <div className="border">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {/* 발전소명 */}
              <Row
                label="발전소명"
                isEdit={isEdit}
                value={form?.name ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.name ?? ""}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                )}
              />

              {/* 접속URL */}
              <Row
                label="접속URL"
                isEdit={isEdit}
                value={form?.connectUrl ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.connectUrl ?? ""}
                    onChange={(e) => setField("connectUrl", e.target.value)}
                  />
                )}
              />

              {/* 발전용량 */}
              <Row
                label="발전용량(kW)"
                isEdit={isEdit}
                value={form?.capacityKw ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.capacityKw ?? ""}
                    onChange={(e) => setField("capacityKw", Number(e.target.value) as any)}
                    type="number"
                    step="0.01"
                  />
                )}
              />

              {/* 발전단가 */}
              <Row
                label="발전단가(원)"
                isEdit={isEdit}
                value={form?.plantPrice ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.plantPrice ?? ""}
                    onChange={(e) => setField("plantPrice", e.target.value)}
                  />
                )}
              />

              {/* 주소 */}
              <Row
                label="주소"
                isEdit={isEdit}
                value={form?.address ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.address ?? ""}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                )}
              />

              {/* 위도/경도 */}
              <Row
                label="위도"
                isEdit={isEdit}
                value={form?.lat ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.lat ?? ""}
                    onChange={(e) => setField("lat", Number(e.target.value) as any)}
                    type="number"
                    step="0.000001"
                  />
                )}
              />
              <Row
                label="경도"
                isEdit={isEdit}
                value={form?.lng ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.lng ?? ""}
                    onChange={(e) => setField("lng", Number(e.target.value) as any)}
                    type="number"
                    step="0.000001"
                  />
                )}
              />

              {/* Y/N 항목들 */}
              <Row
                label="활성화 여부"
                isEdit={isEdit}
                value={form?.activeYn ?? ""}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.activeYn ?? "N"}
                    onChange={(e) => setField("activeYn", e.target.value as any)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
              <Row
                label="계량기 유무"
                isEdit={isEdit}
                value={form?.meterYn ?? ""}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.meterYn ?? "N"}
                    onChange={(e) => setField("meterYn", e.target.value as any)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
              <Row
                label="센서망 유무"
                isEdit={isEdit}
                value={form?.sensorYn ?? ""}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.sensorYn ?? "N"}
                    onChange={(e) => setField("sensorYn", e.target.value as any)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
              <Row
                label="접속IP 유무"
                isEdit={isEdit}
                value={form?.accessIpYn ?? ""}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.accessIpYn ?? "N"}
                    onChange={(e) => setField("accessIpYn", e.target.value as any)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 */}
        {!isEdit ? (
          <div className="flex justify-end mt-4">
            <button
              className="border px-4 py-2 rounded"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleClickSave}
            >
              저장
            </button>

            <button
              className="border px-4 py-2 rounded"
              onClick={handleClickCancel}
            >
              취소
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const Row: React.FC<{
  label: string;
  isEdit: boolean;
  value: string | number;
  renderEdit: () => React.ReactNode;
}> = ({ label, isEdit, value, renderEdit }) => {
  return (
    <tr>
      <td className="border px-2 py-2 bg-slate-50 w-40">{label}</td>
      <td className="border px-2 py-2">
        {isEdit ? renderEdit() : value}
      </td>
    </tr>
  );
};
