import React, { useEffect, useState, useCallback } from "react";
import { signUpRequest } from "../../apis";
import { Button } from "../atoms/Button";

type ResponseDto = { code: string; message: string };

export type CreateUserRequestDto = {
  userId: string;
  userName: string;
  userPassword: string;
  memo?: string;
  auth: string;
  phone: string;  // ✅ "010-1234-5678" 형태로 전송
  smsYn: string;  // "Y" | "N"
  email: string;  // ✅ "local@domain.tld" 형태로 전송
};

interface Props {
  open: boolean;
  accessToken?: string;
  onClose: () => void;
  onCreated?: () => void;
}

const makeEmpty = (): CreateUserRequestDto => ({
  userId: "",
  userName: "",
  userPassword: "",
  memo: "",
  auth: "0",
  phone: "",
  smsYn: "N",
  email: "",
});

// ====== utils ======
function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function formatKoreanMobile(digits: string) {
  const d = onlyDigits(digits).slice(0, 11);

  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;

  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// ====== email domains ======
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

export const UserCreateModal: React.FC<Props> = ({ open, accessToken, onClose, onCreated }) => {
  if (!open) return null;

  const [form, setForm] = useState<CreateUserRequestDto>(makeEmpty());
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ phone/email 입력 전용 state (끊김 방지 + 포맷팅)
  const [phoneDigits, setPhoneDigits] = useState("");
  const phoneDisplay = formatKoreanMobile(phoneDigits);

  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomainMode, setEmailDomainMode] = useState<string>("naver.com");
  const [emailCustomDomain, setEmailCustomDomain] = useState("");

  const emailDomain =
    emailDomainMode === "__custom__" ? emailCustomDomain.trim() : emailDomainMode;

  const emailFull =
    emailLocal.trim() && emailDomain ? `${emailLocal.trim()}@${emailDomain}` : "";

  useEffect(() => {
    if (!open) return;

    setForm(makeEmpty());
    setPw2("");
    setSubmitting(false);

    // ✅ 초기화
    setPhoneDigits("");
    setEmailLocal("");
    setEmailDomainMode("naver.com");
    setEmailCustomDomain("");

    // esc 닫기
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const setField = useCallback(<K extends keyof CreateUserRequestDto>(key: K, value: CreateUserRequestDto[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validate = () => {
    if (!form.userId.trim()) return "아이디를 입력하세요.";
    if (!form.userName.trim()) return "성명을 입력하세요.";

    // ✅ phoneDigits 기준으로 검증 (10~11자리)
    if (phoneDigits.length < 10) return "핸드폰 번호를 정확히 입력하세요.";

    // ✅ 이메일 완성본 검증
    if (!emailFull) return "이메일을 입력하세요.";
    if (!isValidEmail(emailFull)) return "이메일 형식이 올바르지 않습니다.";

    if (!form.userPassword) return "비밀번호를 입력하세요.";
    if (form.userPassword !== pw2) return "비밀번호 확인이 일치하지 않습니다.";

    if (form.smsYn !== "Y" && form.smsYn !== "N") return "SMS 수신여부는 Y/N만 가능합니다.";

    // (선택) auth 유효성
    if (form.auth !== "0" && form.auth !== "5") return "권한 값이 올바르지 않습니다.";

    return null;
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) return alert(msg);

    const ok = window.confirm("등록하시겠습니까?");
    if (!ok) return;

    try {
      setSubmitting(true);

      // ✅ 백엔드로 보낼 payload (phone/email 완성본 주입)
      const payload: CreateUserRequestDto = {
        ...form,
        phone: phoneDisplay.trim(), // ✅ 하이픈 포함
        email: emailFull.trim(),    // ✅ @ 포함 완성본
        smsYn: (form.smsYn ?? "N").trim(),
        memo: form.memo ?? "",
        auth: (form.auth ?? "0").trim(),
      };
      
      const res = await signUpRequest(payload);
      if (!res) return alert("서버 응답이 없습니다.");
      

      const code = (res as any).code;
      const message = (res as any)?.message as string | undefined;
      const CODE_ALERT: Record<string, string> = {
        DI: "동일한 아이디가 이미 존재합니다.",
        NP: "권한이 없습니다.",            // 예시(네 ResponseCode에 맞게 추가)
        VE: "입력값이 올바르지 않습니다.",  // 예시
        DBE: "DB 오류가 발생했습니다.",      // 예시
      };

      if (!res) return alert("서버 응답이 없습니다.");
      if (code === "SU") {
        alert("등록되었습니다.");

        onCreated?.();
        onClose();
        return;
      }
      alert(CODE_ALERT[code ?? ""] ?? message ?? "등록 실패");
    } catch (e: any) {
      alert(e?.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const ok = window.confirm("입력한 내용을 취소하시겠습니까?");
    if (!ok) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-[720px] rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">사용자 신규 등록</div>
          <button className="text-gray-500" onClick={onClose} disabled={submitting}>
            ✕
          </button>
        </div>

        <div className="border">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <Row
                label="아이디"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form.userId}
                    onChange={(e) => setField("userId", e.target.value)}
                  />
                )}
              />

              <Row
                label="성명"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form.userName}
                    onChange={(e) => setField("userName", e.target.value)}
                  />
                )}
              />

              <Row
                label="비밀번호"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    type="password"
                    value={form.userPassword}
                    onChange={(e) => setField("userPassword", e.target.value)}
                  />
                )}
              />

              <Row
                label="비밀번호 확인"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                  />
                )}
              />

              <Row
                label="소속/메모"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form.memo ?? ""}
                    onChange={(e) => setField("memo", e.target.value)}
                  />
                )}
              />

              {/* ✅ 핸드폰: 숫자만 입력해도 자동 하이픈 */}
              <Row
                label="핸드폰 번호"
                renderEdit={() => (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="010-1234-5678"
                    value={phoneDisplay}
                    onChange={(e) => setPhoneDigits(onlyDigits(e.target.value))}
                  />
                )}
              />

              {/* ✅ 이메일: 아이디 + 도메인 선택/직접입력 */}
              <Row
                label="이메일"
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
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
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
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form.auth}
                    onChange={(e) => setField("auth", e.target.value)}
                  >
                    <option value="0">일반</option>
                    <option value="5">관리자</option>
                  </select>
                )}
              />

              <Row
                label="SMS 수신여부"
                renderEdit={() => (
                  <select
                    className="border rounded px-2 py-1"
                    value={form.smsYn}
                    onChange={(e) => setField("smsYn", e.target.value)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              />
            </tbody>
          </table>
        </div>

        {/* (선택) 현재 완성된 이메일 미리보기 */}
        <div className="text-xs text-slate-500 mt-2">
          이메일 미리보기: <span className="font-medium">{emailFull || "-"}</span>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="blue"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            onClick={handleSave}
            disabled={submitting}
          >
            저장
          </Button>

          <Button
            
            variant="dark"
            className="border px-4 py-2 rounded disabled:opacity-60"
            onClick={handleCancel}
            disabled={submitting}
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
};

const Row = React.memo(function Row(props: {
  label: string;
  renderEdit: () => React.ReactNode;
}) {
  return (
    <tr>
      <td className="border px-2 py-2 bg-slate-50 w-40">{props.label}</td>
      <td className="border px-2 py-2">{props.renderEdit()}</td>
    </tr>
  );
});
