// src/pages/Login.jsx — 데모 진입점. JWT 발급/저장.
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, signup } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('demo@triplog.ai');
  const [password, setPassword] = useState('demo1234');
  const [nickname, setNickname] = useState('지원');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup({ email, password, nickname });
      }
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || '로그인 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-stretch"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgb(248, 249, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
    >
      <header className="w-full pt-12 pb-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <span
            className="material-symbols-outlined text-[#4f46e5] text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            travel_explore
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[28px] tracking-tight text-[#4f46e5]">
            TripLog AI
          </h1>
        </div>
        <p className="mt-2 font-['Inter'] text-[14px] text-[#464555]">
          여행은 가고 싶지만 일정 짜기 싫은 당신을 위해
        </p>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 pt-4 pb-10">
        <section className="bg-white border border-[rgba(199,196,216,0.3)] rounded-xl shadow-[0_4px_6px_rgba(53,37,205,0.04)] p-6">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-['Inter'] text-[14px] font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-[#4f46e5] text-white'
                  : 'bg-[#f8f9ff] text-[#464555] hover:bg-[#e5eeff]'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-['Inter'] text-[14px] font-semibold transition-colors ${
                mode === 'signup'
                  ? 'bg-[#4f46e5] text-white'
                  : 'bg-[#f8f9ff] text-[#464555] hover:bg-[#e5eeff]'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-['Inter'] text-[12px] font-medium text-[#464555] tracking-[0.24px]">
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 px-3 rounded-lg border border-[#c7c4d8] bg-[#f8f9ff] outline-none font-['Inter'] text-[15px] text-[#0b1c30] focus:border-[#4f46e5] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-['Inter'] text-[12px] font-medium text-[#464555] tracking-[0.24px]">
                비밀번호
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="h-11 px-3 rounded-lg border border-[#c7c4d8] bg-[#f8f9ff] outline-none font-['Inter'] text-[15px] text-[#0b1c30] focus:border-[#4f46e5] focus:bg-white transition-colors"
              />
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-['Inter'] text-[12px] font-medium text-[#464555] tracking-[0.24px]">
                  닉네임
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="여행자"
                  className="h-11 px-3 rounded-lg border border-[#c7c4d8] bg-[#f8f9ff] outline-none font-['Inter'] text-[15px] text-[#0b1c30] focus:border-[#4f46e5] focus:bg-white transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-['Inter'] text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 mt-2 rounded-lg bg-[#4f46e5] text-white font-['Inter'] text-[15px] font-semibold tracking-[0.3px] hover:bg-[#3525cd] active:scale-[0.99] transition-all disabled:bg-[#c7c4d8] disabled:cursor-not-allowed"
            >
              {submitting ? '처리 중...' : mode === 'signup' ? '회원가입 후 시작하기' : '로그인'}
            </button>
          </form>

          <p className="mt-4 text-center font-['Inter'] text-[12px] text-[#94a3b8]">
            데모 계정이 미리 입력되어 있습니다. 그대로 로그인하셔도 됩니다.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;
