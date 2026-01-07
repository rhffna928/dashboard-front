// src/components/organisms/UserCreateModal.tsx
import React from "react";
import { Button } from "../atoms/Button";
import { signUpRequest } from "../../apis";
import type SignUpRequestDto from "../../apis/request/auth/SignUpRequest.dto";
import type ResponseDto from "../../apis/response/Response.dto";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export const UserCreateModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    userId: "",
    userName: "",
    password: "",
    passwordConfirm: "",
    memo: "",
    phone: "",
    email: "",
    auth: "1",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      userId: "",
      userName: "",
      password: "",
      passwordConfirm: "",
      memo: "",
      phone: "",
      email: "",
      auth: "1",
    });
    setError(null);
    setSaving(false);
  }, [open]);

  const validate = () => {
    if (!form.userId.trim()) return "아이디는 필수입니다.";
    if (!form.userName.trim()) return "성명은 필수입니다.";
    if (!form.password) return "비밀번호는 필수입니다.";
    if (form.password !== form.passwordConfirm) return "비밀번호 확인이 일치하지 않습니다.";
    return null;
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError(null);

    const requestBody: SignUpRequestDto = {
      userId: form.userId.trim(),
      userName: form.userName.trim(),
      userPassword: form.password, // ✅ DTO 필드명이 이게 맞아야 함
      memo: form.memo,
      phone: form.phone,
      email: form.email,
      auth: form.auth,
    };

    const res = await signUpRequest(requestBody);

    if (!res) {
      setError("서버 응답이 없습니다.");
      setSaving(false);
      return;
    }

    const { code, message } = res as ResponseDto;
    if (code !== "SU") {
      setError(message ?? "등록 실패");
      setSaving(false);
      return;
    }

    onCreated?.();
    onClose();
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900">사용자 등록</div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="닫기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="아이디" value={form.userId} onChange={(v) => setForm((p) => ({ ...p, userId: v }))} />
            <Field label="성명" value={form.userName} onChange={(v) => setForm((p) => ({ ...p, userName: v }))} />

            <Field
              label="비밀번호"
              type="password"
              value={form.password}
              onChange={(v) => setForm((p) => ({ ...p, password: v }))}
            />
            <Field
              label="비밀번호 확인"
              type="password"
              value={form.passwordConfirm}
              onChange={(v) => setForm((p) => ({ ...p, passwordConfirm: v }))}
            />

            <Field label="소속/메모" value={form.memo} onChange={(v) => setForm((p) => ({ ...p, memo: v }))} />
            <Field label="핸드폰 번호" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />

            <Field label="이메일" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
            <Field label="권한(auth)" value={form.auth} onChange={(v) => setForm((p) => ({ ...p, auth: v }))} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2">
          <Button primary onClick={onSave} disabled={saving} className="px-4 py-2">
            {saving ? "저장 중..." : "저장"}
          </Button>
          <Button onClick={onClose} disabled={saving} className="px-4 py-2">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}> = ({ label, value, type = "text", onChange }) => (
  <label className="space-y-1">
    <div className="text-xs text-slate-500">{label}</div>
    <input
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);
