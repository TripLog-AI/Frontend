// src/pages/CreateTrip.jsx — Triple 톤 mock UI (ui_mock/02_wizard_city + 03_wizard_theme)
// 5-step wizard: 도시 → 기간 → 동행 → 페이스 → 스타일 → 생성중
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { generateAiItinerary, pollAiRequest } from '../api/itineraries';

// ─── Step 1: 도시 (국가 그룹) ──────────────────
const CITY_GROUPS = [
  {
    country: '🇯🇵 일본',
    cities: [
      { name: '도쿄', emoji: '🗾' },
      { name: '오사카', emoji: '🏯' },
      { name: '교토', emoji: '⛩️' },
      { name: '후쿠오카', emoji: '🍜' },
      { name: '삿포로', emoji: '❄️' },
      { name: '오키나와', emoji: '🏖️' },
    ],
  },
  {
    country: '🌴 동남아',
    cities: [
      { name: '발리', emoji: '🏝️' },
      { name: '다낭', emoji: '🌊' },
      { name: '방콕', emoji: '🛕' },
      { name: '싱가포르', emoji: '🌃' },
      { name: '코타키나발루', emoji: '🌅' },
      { name: '쿠알라룸푸르', emoji: '🏙️' },
    ],
  },
  {
    country: '🇰🇷 한국',
    cities: [
      { name: '서울', emoji: '🏙️' },
      { name: '부산', emoji: '🌊' },
      { name: '제주', emoji: '🍊' },
      { name: '강릉·속초', emoji: '⛱️' },
      { name: '경주', emoji: '🏯' },
      { name: '여수', emoji: '🌅' },
    ],
  },
  {
    country: '🌍 유럽 · 기타',
    cities: [
      { name: '파리', emoji: '🗼' },
      { name: '로마', emoji: '🏛️' },
      { name: '바르셀로나', emoji: '⛪' },
      { name: '런던', emoji: '🎡' },
      { name: '뉴욕', emoji: '🗽' },
      { name: '대만', emoji: '🥟' },
    ],
  },
];

const CITY_KO_TO_EN = {
  도쿄: 'Tokyo', 오사카: 'Osaka', 교토: 'Kyoto', 후쿠오카: 'Fukuoka',
  삿포로: 'Sapporo', 오키나와: 'Okinawa',
  방콕: 'Bangkok', 쿠알라룸푸르: 'Kuala Lumpur', 싱가포르: 'Singapore',
  발리: 'Bali', 코타키나발루: 'Kota Kinabalu', 다낭: 'Da Nang',
  서울: 'Seoul', 부산: 'Busan', 제주: 'Jeju',
  '강릉·속초': 'Gangneung', 경주: 'Gyeongju', 여수: 'Yeosu',
  파리: 'Paris', 로마: 'Rome', 바르셀로나: 'Barcelona',
  런던: 'London', 뉴욕: 'New York', 대만: 'Taipei',
};
const CITY_TO_COUNTRY = {
  Tokyo: 'Japan', Osaka: 'Japan', Kyoto: 'Japan', Fukuoka: 'Japan',
  Sapporo: 'Japan', Okinawa: 'Japan',
  Bangkok: 'Thailand', 'Kuala Lumpur': 'Malaysia', Singapore: 'Singapore',
  Bali: 'Indonesia', 'Kota Kinabalu': 'Malaysia', 'Da Nang': 'Vietnam',
  Seoul: 'South Korea', Busan: 'South Korea', Jeju: 'South Korea',
  Gangneung: 'South Korea', Gyeongju: 'South Korea', Yeosu: 'South Korea',
  Paris: 'France', Rome: 'Italy', Barcelona: 'Spain',
  London: 'United Kingdom', 'New York': 'USA', Taipei: 'Taiwan',
};

// ─── Step 2: 기간 ─────────────────────────────
const DURATION_OPTIONS = [
  { id: 'd1', label: '당일치기', emoji: '☀️', days: 1 },
  { id: 'd2', label: '1박 2일', emoji: '🌙', days: 2 },
  { id: 'd3', label: '2박 3일', emoji: '🌙', days: 3 },
  { id: 'd4', label: '3박 4일', emoji: '🌙', days: 4 },
  { id: 'd5', label: '4박 5일', emoji: '🌙', days: 5 },
  { id: 'd6', label: '5박 6일', emoji: '🌙', days: 6 },
];

// ─── Step 3: 동행 (다중) ───────────────────────
const COMPANION_OPTIONS = [
  { id: 'SOLO', label: '혼자', emoji: '🚶' },
  { id: 'FRIENDS', label: '친구와', emoji: '👫' },
  { id: 'COUPLE', label: '연인과', emoji: '💑' },
  { id: 'COUPLE2', label: '배우자와', emoji: '💍', mapsTo: 'COUPLE' },
  { id: 'FAMILY', label: '아이와', emoji: '👨‍👩‍👧' },
  { id: 'PARENTS', label: '부모님과', emoji: '👵', mapsTo: 'FAMILY' },
];

// ─── Step 4: 페이스 ───────────────────────────
const PACE_OPTIONS = [
  { id: 'RELAXED', label: '여유롭게', emoji: '🛌', sub: '하루 3곳' },
  { id: 'NORMAL', label: '보통', emoji: '🚶', sub: '하루 4곳' },
  { id: 'PACKED', label: '빼곡하게', emoji: '🏃', sub: '하루 6곳' },
];

// ─── Step 5: 스타일 (다중, themes 매핑) ─────────
const STYLE_OPTIONS = [
  { id: 'food', label: '먹방', emoji: '🍜', themes: ['FOOD'] },
  { id: 'culture', label: '문화·역사', emoji: '🏛️', themes: ['CULTURE'] },
  { id: 'nature', label: '자연', emoji: '🌿', themes: ['NATURE'] },
  { id: 'shopping', label: '쇼핑', emoji: '🛍️', themes: ['SHOPPING'] },
  { id: 'relax', label: '여유 힐링', emoji: '🛌', themes: ['RELAX'] },
  { id: 'sns', label: 'SNS 핫플', emoji: '📷', themes: ['CULTURE'] },
  { id: 'music', label: '음악·공연', emoji: '🎵', themes: ['MUSIC'] },
  { id: 'activity', label: '액티비티', emoji: '🎢', themes: ['NATURE'] },
  { id: 'tradition', label: '전통 체험', emoji: '🏯', themes: ['CULTURE'] },
];

const TOTAL_STEPS = 5;

const STEP_TITLE = [
  { title: '떠나고 싶은 도시는?', sub: '도시 1곳을 선택해 주세요' },
  { title: '여행 기간은?', sub: '머무를 기간을 골라 주세요' },
  { title: '누구와 떠나요?', sub: '다중 선택이 가능해요' },
  { title: '여행 페이스는?', sub: '하루에 몇 곳을 갈지 정해요' },
  { title: '선호하는 스타일은?', sub: '관심 있는 테마를 모두 선택해 주세요 · 다중 선택' },
];

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0~4 (5 = generating)
  const [cityKo, setCityKo] = useState(null);
  const [duration, setDuration] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [pace, setPace] = useState('NORMAL');
  const [styles, setStyles] = useState([]);
  const [stepLabel, setStepLabel] = useState('');
  const [error, setError] = useState(null);

  const canProceed = (() => {
    switch (step) {
      case 0: return !!cityKo;
      case 1: return !!duration;
      case 2: return companions.length > 0;
      case 3: return !!pace;
      case 4: return styles.length > 0;
      default: return false;
    }
  })();

  const toggle = (setter, list) => (id) => {
    setter(list.includes(id) ? list.filter((c) => c !== id) : [...list, id]);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleGenerate();
  };

  const handleBack = () => {
    if (step > 0 && step < TOTAL_STEPS) setStep(step - 1);
    else if (step >= TOTAL_STEPS) setStep(TOTAL_STEPS - 1);
    else navigate(-1);
  };

  const handleGenerate = async () => {
    setError(null);
    setStep(TOTAL_STEPS); // generating screen

    try {
      const cityEn = CITY_KO_TO_EN[cityKo] || cityKo;
      const country = CITY_TO_COUNTRY[cityEn] || '';
      const days = duration.days;
      const startDate = todayPlus(7);
      const endDate = todayPlus(7 + Math.max(1, days) - 1);

      const firstComp = companions[0];
      const compOpt = COMPANION_OPTIONS.find((c) => c.id === firstComp);
      const companionType = compOpt?.mapsTo || compOpt?.id || 'SOLO';

      const themesSet = new Set();
      styles.forEach((sid) => {
        const opt = STYLE_OPTIONS.find((o) => o.id === sid);
        opt?.themes.forEach((t) => themesSet.add(t));
      });
      const themes = Array.from(themesSet);

      setStepLabel('AI가 RAG로 후보를 모으는 중...');
      const res = await generateAiItinerary({
        city: cityEn, country, startDate, endDate, companionType, themes, pace,
      });
      const requestId = res.requestId;
      if (!requestId) throw new Error('AI 요청 ID를 받지 못했습니다.');

      setStepLabel('지리 클러스터로 동선을 묶는 중...');
      const result = await pollAiRequest(requestId, { intervalMs: 1500, timeoutMs: 90000 });

      if (result.status === 'COMPLETED' && result.itineraryId) {
        setStepLabel('일정을 마무리하는 중...');
        navigate(`/trips/${result.itineraryId}`);
      } else {
        throw new Error(result.errorMessage || 'AI 생성에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '생성 실패');
      setStep(TOTAL_STEPS - 1);
    }
  };

  const progress = step < TOTAL_STEPS ? ((step + 1) / TOTAL_STEPS) * 100 : 100;

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button type="button" className="header-btn" onClick={handleBack} aria-label="뒤로">
            ←
          </button>
          <div className="header-title">AI 맞춤 일정 만들기</div>
          {step < TOTAL_STEPS ? (
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary-deep)',
                width: 36,
                textAlign: 'right',
              }}
            >
              {step + 1}/{TOTAL_STEPS}
            </div>
          ) : (
            <div className="header-spacer" />
          )}
        </header>

        <main className="main loose">
          {step < TOTAL_STEPS && (
            <>
              <div className="progress">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <h1 className="title">{STEP_TITLE[step].title}</h1>
              <p className="subtitle">{STEP_TITLE[step].sub}</p>
            </>
          )}

          {step === 0 && (
            <CityStep cityKo={cityKo} setCityKo={setCityKo} />
          )}

          {step === 1 && (
            <div className="option-grid cols-3">
              {DURATION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={duration?.id === opt.id}
                  onClick={() => setDuration(opt)}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="option-grid cols-3">
              {COMPANION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={companions.includes(opt.id)}
                  onClick={() => toggle(setCompanions, companions)(opt.id)}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="option-grid cols-3">
              {PACE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  emoji={opt.emoji}
                  label={opt.label}
                  sub={opt.sub}
                  selected={pace === opt.id}
                  onClick={() => setPace(opt.id)}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <>
              <div className="option-grid cols-3">
                {STYLE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    emoji={opt.emoji}
                    label={opt.label}
                    selected={styles.includes(opt.id)}
                    onClick={() => toggle(setStyles, styles)(opt.id)}
                  />
                ))}
              </div>

              {/* 선택 요약 */}
              <h2 className="section-title">📋 선택하신 조건</h2>
              <div className="card" style={{ background: 'var(--bg-soft)', border: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {cityKo && <span className="chip">🗾 {cityKo}</span>}
                  {duration && <span className="chip">{duration.label}</span>}
                  {companions.map((cid) => {
                    const o = COMPANION_OPTIONS.find((x) => x.id === cid);
                    return o && <span key={cid} className="chip">{o.label}</span>;
                  })}
                  {pace && (
                    <span className="chip">
                      {PACE_OPTIONS.find((p) => p.id === pace)?.label}
                    </span>
                  )}
                  {styles.map((sid) => {
                    const o = STYLE_OPTIONS.find((x) => x.id === sid);
                    return o && <span key={sid} className="chip coral">{o.emoji} {o.label}</span>;
                  })}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11.5,
                    color: 'var(--text-soft)',
                    lineHeight: 1.55,
                  }}
                >
                  💡 사용자 history도 함께 분석되어 RAG Layer 2 개인화로 추천됩니다
                </div>
              </div>
            </>
          )}

          {step === TOTAL_STEPS && (
            <GeneratingScreen
              stepLabel={stepLabel}
              error={error}
              onRetry={() => setStep(TOTAL_STEPS - 1)}
            />
          )}

          <div style={{ height: 100 }} />
        </main>

        {step < TOTAL_STEPS && (
          <div className="cta-fixed">
            <button
              type="button"
              className={`btn ${step === TOTAL_STEPS - 1 ? 'coral' : 'primary'}`}
              disabled={!canProceed}
              onClick={handleNext}
            >
              {step === TOTAL_STEPS - 1 ? '✨ AI 일정 만들기' : '다음 →'}
            </button>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

const CityStep = ({ cityKo, setCityKo }) => (
  <>
    {CITY_GROUPS.map((g) => (
      <div key={g.country}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-soft)',
            letterSpacing: 0.5,
            margin: '6px 0 10px',
          }}
        >
          {g.country}
        </div>
        <div className="option-grid cols-3" style={{ marginBottom: 22 }}>
          {g.cities.map((c) => (
            <OptionCard
              key={c.name}
              emoji={c.emoji}
              label={c.name}
              selected={cityKo === c.name}
              onClick={() => setCityKo(c.name)}
            />
          ))}
        </div>
      </div>
    ))}
  </>
);

const OptionCard = ({ emoji, label, sub, selected, onClick }) => (
  <button
    type="button"
    className={`option${selected ? ' selected' : ''}`}
    onClick={onClick}
  >
    {emoji && <span className="emoji">{emoji}</span>}
    {label}
    {sub && (
      <div style={{ fontSize: 10.5, color: 'var(--text-soft)', marginTop: 2, fontWeight: 500 }}>
        {sub}
      </div>
    )}
  </button>
);

const GeneratingScreen = ({ stepLabel, error, onRetry }) => (
  <section
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      paddingTop: 60,
      paddingBottom: 60,
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
          border: '4px solid rgba(93,168,197,0.8)',
          borderTopColor: 'transparent',
          animation: 'spin 1.6s linear infinite',
        }}
        aria-hidden
      />
      <span style={{ fontSize: 32, color: 'var(--primary-deep)' }}>✨</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
      AI가 일정을 만들고 있어요
    </h3>
    <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-soft)', maxWidth: 280 }}>
      {stepLabel || '잠시만 기다려 주세요...'}
    </p>
    {error && (
      <div className="error-box" style={{ marginTop: 24, maxWidth: 300 }}>
        {error}
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginLeft: 8,
            background: 'transparent',
            border: 0,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </div>
    )}
  </section>
);

export default CreateTrip;
