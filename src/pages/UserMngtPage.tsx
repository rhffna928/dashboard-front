import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { getAdminUsersRequest } from "../apis";
import { Button } from "../components/atoms/Button";

import { UserCreateModal } from "../components/organisms/UserCreateModal";
import { UserDetailModal, type AdminUserSummary } from "../components/organisms/UserDetailModal";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const PAGE_SIZE = 10;

export const UserMngtPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const [users, setUsers] = React.useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ 모달
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<AdminUserSummary | null>(null);

  // ✅ 검색/페이징
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminUsersRequest(token);
      if (response && response.code === "SU") {
        setUsers(response.users ?? []);
      } else {
        setError((response as any)?.message ?? "Error fetching user info");
      }
    } catch (e: any) {
      setError(e?.message ?? "사용자 목록 조회 중 오류");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 검색어 바뀌면 페이지 1로 리셋
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    // 이름 기준 검색 + 보너스로 userId도 같이 검색되게(원하면 제거 가능)
    return users.filter((u) => {
      const name = (u.userName ?? "").toLowerCase();
      const id = (u.userId ?? "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [users, query]);

  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  }, [filteredUsers.length]);

  const currentPageUsers = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const openDetail = (u: AdminUserSummary) => setSelected(u);
  const closeDetail = () => setSelected(null);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <MainLayout activeMenu="/user-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="사용자 관리" pageSubtitle="User Management" />

        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="text-slate-900 font-semibold">사용자 목록</div>

            <div className="flex items-center gap-2">
              {/* ✅ 이름 검색 */}
              <input
                className="border rounded px-3 py-2 text-sm w-[260px]"
                placeholder="이름(또는 아이디)으로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Button
                onClick={fetchUsers}
                className="px-3 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
              >
                새로고침
              </Button>

              <Button
                primary
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                신규 등록
              </Button>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">순번</th>
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
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  currentPageUsers.map((u, idx) => (
                    <tr
                      key={u.userId}
                      className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}
                    >
                      <td className="px-4 py-3 text-slate-900">{idx+1}</td>
                      <td className="px-4 py-3 text-slate-900">{u.userId}</td>
                      <td className="px-4 py-3 text-slate-900">{u.userName}</td>
                      <td className="px-4 py-3 text-slate-700">{u.memo}</td>
                      <td className="px-4 py-3 text-slate-700">{u.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="blue"
                          type="button"
                          onClick={() => openDetail(u)}
                          className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          상세정보
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ 페이징 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              총 {filteredUsers.length}명 · {page}/{totalPages} 페이지
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                onClick={goPrev}
                disabled={page <= 1}
              >
                이전
              </button>
              <button
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                onClick={goNext}
                disabled={page >= totalPages}
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ 신규 등록 (토큰 전달 중요) */}
      <UserCreateModal
        open={createOpen}
        accessToken={token}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchUsers}
      />

      {/* ✅ 상세/수정/삭제 (토큰 전달 중요) */}
      <UserDetailModal
        open={!!selected}
        user={selected}
        accessToken={token}
        onClose={closeDetail}
        onSaved={fetchUsers}
        onDeleted={fetchUsers}
      />
    </MainLayout>
  );
};
