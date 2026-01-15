import React, { useEffect, useState, useCallback } from "react";
import { putAdminUserUpdateRequest } from "../../apis";
import { adminUserDeleteRequest } from "../../apis";
// 아래 2개는 백엔드 붙이면 apis에 추가해서 import 하세요.
// import { patchAdminUserPasswordResetRequest } from "../../apis";
// import { patchAdminUserPasswordSetRequest } from "../../apis";

type ResponseDto = { code: string; message: string };

export type AdminUserSummary = {
  id?: number;
  userId: string;
  userName: string;
  memo?: string;
  auth?: string;
  phone?: string;
  email?: string;
  smsYn?: "Y" | "N";
};


export type UpdateUserRequestDto = {
  userId: string;
  userName: string;
  memo: string;
  phone: string;
  email: string;
  auth: string;
  smsYn: "Y" | "N";
};

interface Props {
  open: boolean;
  user: AdminUserSummary | null;
  accessToken?: string;
  onClose: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export const UserDetailModal: React.FC<Props> = ({
  open,
  user,
  accessToken,
  onClose,
  onSaved,
  onDeleted,
}) => {
  if (!open) return null;

  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<AdminUserSummary | null>(null);
  const [phoneDigits, setPhoneDigits] = useState(""); // 숫자만 보관
  const phoneDisplay = formatKoreanMobile(phoneDigits);
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomainMode, setEmailDomainMode] = useState<string>("naver.com"); // 기본
  const [emailCustomDomain, setEmailCustomDomain] = useState(""); // 직접 입력용

  const emailDomain =
    emailDomainMode === "__custom__" ? emailCustomDomain.trim() : emailDomainMode;

  const emailFull =
    (emailLocal.trim() && emailDomain)
      ? `${emailLocal.trim()}@${emailDomain}`
      : ""; // 완성본

  useEffect(() => {
  if (!open) return;

  if (!user) {
    setForm(null);
    setIsEdit(false);

    setPhoneDigits("");
    setEmailLocal("");
    setEmailDomainMode("naver.com");
    setEmailCustomDomain("");
    return;
  }

  setForm({ ...user });
  setIsEdit(false);

  // phone 초기값: 하이픈 있든 없든 digits로 변환
  const digits = onlyDigits(user.phone ?? "");
  setPhoneDigits(digits);

  // email 초기값 분해
  const email = (user.email ?? "").trim();
  const [local, domain] = email.split("@");
  setEmailLocal(local ?? "");

  // 도메인이 옵션에 있으면 선택, 없으면 직접입력
  const known = EMAIL_DOMAIN_OPTIONS.find((o) => o.value === domain);
  if (domain && known) {
    setEmailDomainMode(domain);
    setEmailCustomDomain("");
  } else if (domain) {
    setEmailDomainMode("__custom__");
    setEmailCustomDomain(domain);
  } else {
    setEmailDomainMode("naver.com");
    setEmailCustomDomain("");
  }
  // esc 닫기
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);

}, [open,onClose, user?.userId]);

  const setField = useCallback(
    <K extends keyof AdminUserSummary>(key: K, value: AdminUserSummary[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    []
  );

  const handleClickEdit = () => setIsEdit(true);

  const handleClickCancel = () => {
    if (user) setForm({ ...user });
    setIsEdit(false);
  };
  function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

  // 01012345678 -> 010-1234-5678
  // 0101234567  -> 010-123-4567
  function formatKoreanMobile(digits: string) {
    const d = onlyDigits(digits).slice(0, 11);

    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;

    // 10자리: 3-3-4, 11자리: 3-4-4
    if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }

  function isValidEmail(email: string) {
    // 너무 빡세게 잡지 말고 기본만
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
  const EMAIL_DOMAIN_OPTIONS = [
    { label: "직접 입력", value: "__custom__" },
    { label: "naver.com", value: "naver.com" },
    { label: "gmail.com", value: "gmail.com" },
    { label: "daum.net", value: "daum.net" },
    { label: "nate.com", value: "nate.com" },
    { label: "outlook.com", value: "outlook.com" },
    { label: "hotmail.com", value: "hotmail.com" },
    { label: "icloud.com", value: "icloud.com" },
    { label: "yahoo.com", value: "yahoo.com" },
  ];
  // ✅ 저장: 사용자 정보 PUT + (선택) 새 비밀번호 변경 PATCH
  const handleClickSave = async () => {
    if (!accessToken) return alert("로그인이 필요합니다. (토큰 없음)");
    if (!form) return;

    if (!form.userName?.trim()) return alert("성명을 입력하세요.");
    if (phoneDigits.length < 10) return alert("핸드폰 번호를 정확히 입력하세요.");
    if (!emailFull || !isValidEmail(emailFull)) return alert("이메일 형식이 올바르지 않습니다.");
    

    const ok = window.confirm("저장하시겠습니까?");
    if (!ok) return;

    const body: UpdateUserRequestDto = {
      userId: form.userId.trim(),
      userName: form.userName.trim(),
      memo: form.memo ?? "",
      phone: phoneDisplay,      // 하이픈 포함해서 전송
      email: emailFull,         // @ 포함 완성본 전송
      auth: (form.auth ?? "0").trim(),
      smsYn: (form.smsYn ?? "N") as "Y" | "N",
    };

    try {
      // 1) ✅ 사용자 정보 업데이트
      const res = await putAdminUserUpdateRequest(form.userId, body, accessToken);
      if (!res) return alert("서버 응답이 없습니다.");

      if ((res as any).code !== "SU") {
        return alert((res as any).message ?? "저장 실패");
      }

      alert("저장되었습니다.");
      setIsEdit(false);
      onSaved?.();
    } catch (e: any) {
      alert(e?.message ?? "저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 비밀번호 초기화: 별도 버튼으로 처리 (권장)
  const handleClickResetPassword = async () => {
    if (!accessToken) return alert("로그인이 필요합니다. (토큰 없음)");
    if (!form) return;

    const ok = window.confirm(`${form.userId} 비밀번호를 초기화 하시겠습니까?`);
    if (!ok) return;

    try {
      // 백엔드 붙이면 아래 API 호출로 교체
      // const res = await patchAdminUserPasswordResetRequest(form.userId, accessToken);
      // if (!res) return alert("서버 응답이 없습니다.");
      // if ((res as any).code !== "SU") return alert((res as any).message ?? "초기화 실패");
      // const temp = (res as any).tempPassword;
      // alert(temp ? `초기화 완료\n임시 비밀번호: ${temp}` : "비밀번호가 초기화되었습니다.");

      alert("비밀번호 초기화 API 연결이 필요합니다. (PATCH /admin/users/{userId}/password-reset)");
    } catch (e: any) {
      alert(e?.message ?? "초기화 중 오류가 발생했습니다.");
    }
  };

  const handleClickDelete = async () => {
    if (!accessToken) return alert("로그인이 필요합니다. (토큰 없음)");
    if (!form) return;

    const ok = window.confirm(`${form.userId}님의 사용자 정보를 삭제 하시겠습니까?`);
    if (!ok) return;

    try {
      // TODO: DELETE API 연결
      const res = await adminUserDeleteRequest(form.userId, accessToken);
      if (!res) return alert("서버 응답이 없습니다.");
      if ((res as any).code !== "SU") return alert((res as any).message ?? "삭제 실패");

      // 연결 후에는:
      alert("삭제되었습니다.");
      onDeleted?.();
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-[720px] rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">사용자 상세정보</div>
          <button className="text-gray-500" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ✅ 상단 버튼: 수정/초기화/삭제 유지 */}
        <div className="flex gap-2 mb-3">
          {!isEdit && (
            <>
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleClickEdit}>
                수정
              </button>

              <button
                className="bg-amber-500 text-white px-3 py-1 rounded"
                onClick={handleClickResetPassword}
              >
                비밀번호 초기화
              </button>

              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleClickDelete}>
                삭제
              </button>
            </>
          )}
        </div>

        <div className="border">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <Row label="번호" isEdit={false} value={form?.id ?? ""} renderEdit={() => null} />
              <Row 
                label="아이디"
                isEdit={isEdit}
                value={form?.userId ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.userId ?? ""}
                    onChange={(e) => setField("userId", e.target.value)}
                  />
                )} />

              <Row
                label="성명"
                isEdit={isEdit}
                value={form?.userName ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.userName ?? ""}
                    onChange={(e) => setField("userName", e.target.value)}
                  />
                )}
              />

              <Row
                label="소속/메모"
                isEdit={isEdit}
                value={form?.memo ?? ""}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form?.memo ?? ""}
                    onChange={(e) => setField("memo", e.target.value)}
                  />
                )}
              />

              <Row
                label="핸드폰 번호"
                isEdit={isEdit}
                value={phoneDisplay}
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="010-1234-5678"
                    value={phoneDisplay}
                    onChange={(e) => setPhoneDigits(onlyDigits(e.target.value))}
                  />
                )}
              />

              <Row
                label="이메일"
                isEdit={isEdit}
                value={emailFull}
                renderEdit={() => (
                  <div className="flex items-center gap-2">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      placeholder="아이디"
                      value={emailLocal}
                      onChange={(e) => setEmailLocal(e.target.value.replace(/\s/g, ""))}
                    />
                    <span className="text-slate-500">@</span>

                    <select
                      className="border rounded px-2 py-1"
                      value={emailDomainMode}
                      onChange={(e) => setEmailDomainMode(e.target.value)}
                    >
                      {EMAIL_DOMAIN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    {emailDomainMode === "__custom__" && (
                      <input
                        className="border rounded px-2 py-1 w-[220px]"
                        placeholder="domain.com"
                        value={emailCustomDomain}
                        onChange={(e) => setEmailCustomDomain(e.target.value.replace(/\s/g, ""))}
                      />
                    )}
                  </div>
                )}
              />

              <Row
                label="권한"
                isEdit={isEdit}
                value={form?.auth ?? ""}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.auth ?? "0"}
                    onChange={(e) => setField("auth", e.target.value)}
                  >
                    <option value="0">일반</option>
                    <option value="5">관리자</option>
                  </select>
                )}
              />

              <Row
                label="SMS 수신여부"
                isEdit={isEdit}
                value={form?.smsYn ?? "N"}
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form?.smsYn ?? "N"}
                    onChange={(e) => setField("smsYn", e.target.value as "Y" | "N")}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
            </tbody>
          </table>
        </div>

        {!isEdit ? (
          <div className="flex justify-end mt-4">
            <button className="border px-4 py-2 rounded" onClick={onClose}>
              닫기
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleClickSave}>
              저장
            </button>
            <button className="border px-4 py-2 rounded" onClick={handleClickCancel}>
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
}> = ({ label, isEdit, value, renderEdit }) => (
  <tr>
    <td className="border px-2 py-2 bg-slate-50 w-40">{label}</td>
    <td className="border px-2 py-2">{isEdit ? renderEdit() : value}</td>
  </tr>
);
