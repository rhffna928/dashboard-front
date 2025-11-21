import { useEffect, useState } from "react";
import logo from "../assets/swlogo.png"; // 경로 맞게 조정
import Dashboard from "./Dashboard"; // 경로 맞게 조정
import { api } from "../apis/client";

export default function App(){

  const [form, setForm] = useState({id:"", pw:""});
  const [error, setError] = useState("");
  const [user, setUser] = useState('')
  
  useEffect(() => {
    me()
      .then((info) => setUser(info))
      .catch(() => setUser(null));
  }, []);

  
const onLogin = async () => {
    try {
      await login(email, password)
      const info = await me()
      setUser(info)
      setEmail(''); setPassword('')
    } catch {
      alert('로그인 실패')
    }
  }

  const onLogout = async () => {
    await logout()
    setUser(null)
    setWidgets([])
  }

  const loadWidgets = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/widgets') // 보호된 API
      setWidgets(data)
    } catch {
      alert('권한 없음 혹은 에러')
    } finally {
      setLoading(false)
    }
  }

return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1200px] shadow">
        {/* Left panel */}
        <aside className="hidden w-[38%] items-center justify-center bg-[#232B33] lg:flex">
          <div className="px-8">
            <p className="text-3xl font-bold leading-snug text-white">
              태양광발전
              <br />
              모니터링시스템
            </p>
          </div>
        </aside>

        {/* Right panel (form) */}
        <section className="flex flex-1 items-center justify-center bg-white">
          <div className="w-full max-w-[520px] px-8">
            <h1 className="mb-8 text-4xl font-semibold text-gray-300">Login</h1>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="id" className="mb-1 block text-sm text-gray-500">
                  ID
                </label>
                <input
                  id="id"
                  name="id"
                  value={form.id}
                  onChange={onChange}
                  autoComplete="username"
                  className="w-full rounded-md border border-gray-300 px-3 py-3 outline-none transition focus:border-orange-500"
                  placeholder="아이디를 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="pw" className="mb-1 block text-sm text-gray-500">
                  PW
                </label>
                <input
                  id="pw"
                  name="pw"
                  type="password"
                  value={form.pw}
                  onChange={onChange}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-gray-300 px-3 py-3 outline-none transition focus:border-orange-500"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-md bg-orange-500 py-3 text-white transition hover:bg-orange-600"
              >
                로그인
              </button>
            </form>

            <div className="mt-10 flex justify-center">
              <img src={logo} alt="SAMWHAN" className="h-10 w-auto opacity-90" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
    
}