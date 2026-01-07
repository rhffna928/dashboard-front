// src/components/organisms/UserDetailModal.tsx
import React from "react";
import {
  AdminUser,
  updateAdminUserRequest,
  deleteAdminUserRequest,
  UpdateAdminUserRequestDto,
} from "../../apis";

type Props = {
  open: boolean;
  user: AdminUser | null;
  accessToken: string | undefined;
  onClose: () => void;
  onUpdated: () => void; // 저장 성공 후 목록 재조회
  onDeleted: () => void; // 삭제 성공 후 목록 재조회
};

function FieldRow(props: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b">
      <th className="bg-slate-50 text-slate-700 font-medium w-[160px] px-4 py-3">
        {props.label}
      </th>
      <td className="px-4 py-3 text-slate-900">{props.children}</td>
    </tr>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const UserDetailModal: React.FC<Props> = ({
  open,
  user,
  accessToken,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [isEdit, setIsEdit] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 편집 폼
  const [form, setForm] = React.useState<UpdateAdminUserRequestDto>({
    userName: "",
    memo: "",
    phone: "",
    auth: "1",
    email: "",
  });

  // 비밀번호(선택)
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");

  // 열릴 때/유저 바뀔 때 폼 초기화
  React.useEffect(() => {
    if (!open || !user) return;

    setIsEdit(false);
    setError(null);
    setSaving(false);
    setDeleting(false);

    setForm({
      userName: user.userName ?? "",
      memo: user.memo ?? "",
      phone: user.phone ?? "",
      auth: user.auth ?? "1",
      email: user.email ?? "",
    });

    setPassword("");
    setPasswordConfirm("");
  }, [open, user]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const canInteract = !!user && !!accessToken;

  const startEdit = () => {
    if (!user) return;
    setError(null);
    setIsEdit(true);
  };

  const cancelEdit = () => {
    if (!user) return;
    setError(null);
    setIsEdit(false);

    // 폼 원복
    setForm({
      userName: user.userName ?? "",
      memo: user.memo ?? "",
      phone: user.phone ?? "",
      auth: user.auth ?? "1",
      email: user.email ?? "",
    });
    setPassword("");
    setPasswordConfirm("");
  };

  const onSave = async () => {
    if (!user) return;
    if (!accessToken) {
      setError("토큰이 없습니다. 다시 로그인하세요.");
      return;
    }

    setError(null);

    // 검증
    if (!form.userName.trim()) return setError("성명을 입력하세요.");
    if (!form.phone.trim()) return setError("핸드폰 번호를 입력하세요.");

    // 비밀번호는 입력했을 때만 업데이트(선택)
    const wantsPasswordChange = password.trim().length > 0 || passwordConfirm.trim().length > 0;
    if (wantsPasswordChange) {
      if (password.trim().length < 6) return setError("비밀번호는 최소 6자 이상 권장입니다.");
      if (password !== passwordConfirm) return setError("비밀번호 확인이 일치하지 않습니다.");
    }

    const body: UpdateAdminUserRequestDto = {
      userName: form.userName.trim(),
      memo: form.memo ?? "",
      phone: form.phone ?? "",
      auth: form.auth ?? "1",
      email: form.email ?? "",
      ...(wantsPasswordChange ? { password } : {}),
    };

    setSaving(true);
    try {
      const res = await updateAdminUserRequest(accessToken, user.userId, body);
      if (!res || res.code !== "SU") throw new Error(res?.message ?? "수정 실패");

      setIsEdit(false);
      onUpdated(); // 목록 재조회
      onClose();   // 스샷처럼 저장 후 닫히게(원하면 닫지 말고 유지 가능)
    } catch (e: any) {
      setError(e?.message ?? "수정 중 오류");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!user) return;
    if (!accessToken) {
      setError("토큰이 없습니다. 다시 로그인하세요.");
      return;
    }

    const ok = window.confirm(`정말 삭제하시겠습니까?\n대상: ${user.userId}`);
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await deleteAdminUserRequest(accessToken, user.userId);
      if (!res || res.code !== "SU") throw new Error(res?.message ?? "삭제 실패");

      onDeleted(); // 목록 재조회
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "삭제 중 오류");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl border">
          {/* header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-base font-semibold text-slate-900">사용자 상세정보</div>

              {!isEdit ? (
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded text-white",
                    canInteract ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  )}
                  onClick={startEdit}
                  disabled={!canInteract}
                >
                  수정
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded text-white",
                      saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    )}
                    onClick={onSave}
                    disabled={saving}
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    취소
                  </button>
                </>
              )}

              <button
                type="button"
                className={cn(
                  "px-3 py-1.5 rounded text-white",
                  canInteract && !deleting
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-rose-300 cursor-not-allowed"
                )}
                onClick={onDelete}
                disabled={!canInteract || deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="닫기"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* body */}
          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            {!user ? (
              <div className="text-slate-400">선택된 사용자가 없습니다.</div>
            ) : (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <FieldRow label="아이디">{user.userId}</FieldRow>

                    <FieldRow label="성명">
                      {!isEdit ? (
                        user.userName
                      ) : (
                        <input
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={form.userName}
                          onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="비밀번호">
                      {!isEdit ? (
                        <span className="text-slate-400">********</span>
                      ) : (
                        <input
                          type="password"
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="변경 시에만 입력"
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="비밀번호 확인">
                      {!isEdit ? (
                        <span className="text-slate-400">********</span>
                      ) : (
                        <input
                          type="password"
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          placeholder="변경 시에만 입력"
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="소속/메모">
                      {!isEdit ? (
                        user.memo
                      ) : (
                        <input
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={form.memo}
                          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="핸드폰 번호">
                      {!isEdit ? (
                        user.phone
                      ) : (
                        <input
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="이메일">
                      {!isEdit ? (
                        user.email
                      ) : (
                        <input
                          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      )}
                    </FieldRow>

                    <FieldRow label="권한(auth)">
                      {!isEdit ? (
                        <>
                          {user.auth} {user.auth === "5" ? "(관리자)" : "(일반)"}
                        </>
                      ) : (
                        <select
                          className="w-full px-3 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={form.auth}
                          onChange={(e) => setForm((p) => ({ ...p, auth: e.target.value }))}
                        >
                          <option value="1">1 (일반)</option>
                          <option value="5">5 (관리자)</option>
                        </select>
                      )}
                    </FieldRow>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t bg-slate-50 rounded-b-2xl flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-800"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
