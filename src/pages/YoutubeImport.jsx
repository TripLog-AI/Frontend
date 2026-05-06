// src/pages/YoutubeImport.jsx — YouTube URL 입력 → 일정 자동 생성 (description-first + cache-first)
// 흐름:
//   1. URL 붙여넣기
//   2. "분석 시작" → BE requestYoutubeParse (캐시 hit이면 즉시 완료)
//   3. 폴링 → 완료 시 /trips/{id} 이동 (DRAFT 상태로 ViewTrip preview)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { parseYoutubeItinerary, pollAiRequest } from '../api/itineraries';

const STEP_LABELS = [
  'description 분석 중...',
  'chapter timestamp 추출 중...',
  '장소 검증 (Google Places) 중...',
  '권역 클러스터로 동선 묶는 중...',
];

const YoutubeImport = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;
    if (!url.trim()) {
      setError('YouTube URL 을 입력해 주세요.');
      return;
    }
    setError(null);
    setSubmitting(true);
    setStepIdx(0);

    // step 라벨 자연 회전 (UX 디테일)
    let labelTimer = null;
    const startLabelRotation = () => {
      labelTimer = setInterval(() => {
        setStepIdx((idx) => (idx + 1) % STEP_LABELS.length);
      }, 1800);
    };
    startLabelRotation();

    try {
      const res = await parseYoutubeItinerary({ youtubeUrl: url.trim() });
      const requestId = res?.requestId;
      if (!requestId) throw new Error('AI 요청 ID 를 받지 못했습니다.');

      const result = await pollAiRequest(requestId, {
        intervalMs: 1500,
        timeoutMs: 90000,
      });

      if (result.status === 'COMPLETED' && result.itineraryId) {
        navigate(`/trips/${result.itineraryId}`);
      } else {
        throw new Error(humanizeError(result.errorMessage));
      }
    } catch (err) {
      setError(humanizeError(err.message));
      setSubmitting(false);
    } finally {
      if (labelTimer) clearInterval(labelTimer);
    }
  };

  function humanizeError(rawMessage) {
    const msg = (rawMessage || '').toString();
    // AI 가 raise 한 코드 / 메시지 키워드 매칭 → 친절 한국어로 변환
    if (msg.includes('NOT_TRAVEL_VIDEO') || msg.includes('여행 vlog')) {
      return '여행 vlog 가 아닌 것 같아요. 영상 description 에 chapter timestamp 가 박혀있거나 "여행" 키워드가 있는 영상으로 시도해 주세요.';
    }
    if (msg.includes('INVALID_URL') || msg.includes('유효하지 않은')) {
      return '유효하지 않은 YouTube URL 입니다. 주소 다시 확인해 주세요.';
    }
    if (msg.includes('시간 내에 도착하지')) {
      return '응답이 너무 늦어요. 잠시 후 다시 시도해 주세요.';
    }
    return msg || 'AI 분석에 실패했습니다.';
  }

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button
            type="button"
            className="header-btn"
            onClick={() => navigate(-1)}
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="header-title">YouTube 영상으로 일정 만들기</div>
          <div className="header-spacer" />
        </header>

        <main className="main loose">
          {!submitting ? (
            <>
              <h1 className="title">vlog URL 만 넣어주세요</h1>
              <p className="subtitle">
                description 의 chapter timestamp 를 우선 분석합니다 — 자막 없는 vlog 도 OK
              </p>

              <div className="info-box" style={{ marginBottom: 18 }}>
                <span className="label">💡 작동 방식</span>
                같은 영상을 다른 사용자가 이미 등록했다면 AI 호출 없이 즉시 일정으로 변환됩니다.
                새 영상이면 30초 정도 분석 시간이 걸려요.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label" htmlFor="yt-url">
                    YouTube URL
                  </label>
                  <input
                    id="yt-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

                <button type="submit" className="btn primary">
                  ✨ 분석 시작
                </button>
              </form>

              <h2 className="section-title">📋 어떤 영상이 잘 되나요</h2>
              <div className="card" style={{ background: 'var(--bg-soft)', border: 0 }}>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 13 }}>
                  <li>description 에 <strong>chapter timestamp</strong> 가 박힌 vlog (가장 정확)</li>
                  <li>"📍 다녀온 곳" 같이 장소 리스트가 정리된 vlog</li>
                  <li>해시태그로 도시·장소가 명시된 vlog</li>
                </ul>
                <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-soft)' }}>
                  자막이 없거나 description 이 짧아도 본문 텍스트 fallback 으로 처리돼요.
                </div>
              </div>

              <div style={{ height: 100 }} />
            </>
          ) : (
            <GeneratingBlock stepLabel={STEP_LABELS[stepIdx]} />
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

const GeneratingBlock = ({ stepLabel }) => (
  <section
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      paddingTop: 80,
      paddingBottom: 80,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          border: '4px solid rgba(234,135,117,0.8)',
          borderTopColor: 'transparent',
          animation: 'spin 1.6s linear infinite',
        }}
        aria-hidden
      />
      <span style={{ fontSize: 32, color: 'var(--accent-deep)' }}>▶</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
      vlog 분석 중
    </h3>
    <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-soft)', maxWidth: 280 }}>
      {stepLabel}
    </p>
  </section>
);

export default YoutubeImport;
