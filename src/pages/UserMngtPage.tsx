// src/pages/UserManagementPage.tsx
import React from "react";
import { useCookies } from "react-cookie";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { getAdminUsersRequest } from "../apis";
import { Button } from '../components/atoms/Button';
import { UserCreateModal } from "../components/organisms/UserCreateModal";

type ModalMode = "none" | "detail" | "create";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Modal(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { open, title, subtitle, onClose, children, footer } = props;

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[760px] rounded-xl bg-white shadow-xl border">
          <div className="px-6 py-4 border-b flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">{title}</div>
              {subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
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
          <div className="px-6 py-5">{children}</div>
          {footer && <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export const UserMngtPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string | undefined = cookies.accessToken;

  const [users, setUsers] = React.useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [mode, setMode] = React.useState<ModalMode>("none");
  const [selected, setSelected] = React.useState<AdminUserSummary | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      
      getAdminUsersRequest(token).then((response) => {
        if (response && response.code === 'SU') {
            setUsers(response.users ?? []);
        } else {
            setError('Error fetching user info');
        }
      });

    } catch (e: any) {
      setError(e?.message ?? "사용자 목록 조회 중 오류");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openDetail = (u: AdminUserSummary) => {
    // 지금 백엔드는 목록 API만 있다고 했으니
    // 상세 API 붙이기 전까지는 row 데이터를 그대로 보여주는 모달로 처리
    setSelected(u);
    setMode("detail");
  };

  const openCreate = () => {
    // 신규등록 API 붙일 때 여기에 form 초기화 넣으면 됨
    setMode("create");
  };

  const closeModal = () => {
    setMode("none");
    setSelected(null);
  };

  return (
    <MainLayout activeMenu="/user-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="사용자 관리" pageSubtitle="User Management" />

        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">사용자 목록</div>

            <div className="flex gap-2">
              <Button
                onClick={fetchUsers}
                className="px-3 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
              >
                새로고침
              </Button>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">아이디</th>
                  <th className="text-left font-medium px-4 py-3">성명</th>
                  <th className="text-left font-medium px-4 py-3">정보</th>
                  <th className="text-left font-medium px-4 py-3 w-[300px]">핸드폰 번호</th>
                  <th className="text-center font-medium px-4 py-3">상세</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={u.userId} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      
                      <td className="px-4 py-3 text-slate-900">{u.userId}</td>
                      <td className="px-4 py-3 text-slate-900">{u.userName}</td>
                      <td className="px-4 py-3 text-slate-700">{u.memo}</td>
                      <td className="px-4 py-3 text-slate-700">{u.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDetail(u)}
                          className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          상세정보
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <Button primary 
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              신규 등록
            </Button>
          </div>
        </section>
      </div>

      <UserCreateModal
        open={createOpen}
        accessToken={token}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchUsers}
      />
      {/* 상세 모달(목록 데이터로 표시) */}
      <Modal
        open={mode === "detail"}
        title="사용자 상세정보"
        subtitle="User Detail"
        onClose={closeModal}
        footer={
          <div className="flex justify-end">
            <Button
              onClick={closeModal}
              className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              닫기
            </Button>
          </div>
        }
      >
        {!selected ? (
          <div className="text-slate-400">데이터가 없습니다.</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">번호</div>
              <div className="col-span-9 text-slate-900">{selected.id}</div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">아이디</div>
              <div className="col-span-9 text-slate-900">{selected.userId}</div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">성명</div>
              <div className="col-span-9 text-slate-900">{selected.userName}</div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">소속</div>
              <div className="col-span-9 text-slate-900">{selected.memo}</div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">핸드폰</div>
              <div className="col-span-9 text-slate-900">{selected.phone}</div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 text-slate-500">권한</div>
              <div className="col-span-9 text-slate-900">
                {selected.auth} {selected.auth === "5" ? "(관리자)" : ""}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 신규 등록 모달: 다음 단계에서 POST API 연결 */}
      <Modal
        open={mode === "create"}
        title="신규 사용자 등록"
        subtitle="Create User"
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              닫기
            </button>
          </div>
        }
      >
        <div className="text-slate-500 text-sm">
          신규 등록은 다음 단계에서 <span className="font-semibold">POST /api/v1/admin/users</span> API를 만들고 연결하면 됩니다.
        </div>
      </Modal>
    </MainLayout>
  );
};
