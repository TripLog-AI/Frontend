// src/pages/Login.jsx — Triple 톤 mock UI (mock 직접 도안 없음 — hero + form 일관 톤)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, signup } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');
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
    <div className="mock-page">
      <div className="device">
        <main className="main">
          {/* hero (작은 버전) */}
          <section className="hero" style={{ paddingTop: 40, paddingBottom: 32 }}>
            <div className="hero-eyebrow">✨ 흩어진 정보를 한 줄로</div>
            <h1 className="hero-title" style={{ fontSize: 26 }}>
              TripLog AI
            </h1>
            <p className="hero-sub">
              여행은 가고 싶지만 일정 짜기 싫은 당신을 위해
            </p>
          </section>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="tab-group" style={{ marginBottom: 18 }}>
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                로그인
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => setMode('signup')}
              >
                회원가입
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">이메일</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div className="field">
                <label className="field-label">비밀번호</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="input"
                />
              </div>

              {mode === 'signup' && (
                <div className="field">
                  <label className="field-label">닉네임</label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="여행자"
                    className="input"
                  />
                </div>
              )}

              {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

              <button type="submit" disabled={submitting} className="btn primary">
                {submitting
                  ? '처리 중...'
                  : mode === 'signup'
                  ? '회원가입 후 시작하기'
                  : '로그인'}
              </button>
            </form>

            <p
              className="muted"
              style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5 }}
            >
              데모 계정이 미리 입력되어 있습니다. 그대로 로그인하셔도 됩니다.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
