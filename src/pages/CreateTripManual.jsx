// src/pages/CreateTripManual.jsx — 직접 짜기 wizard (도시 → 캘린더 → 스타일)
// AI wizard 와 달리 캘린더 입력 = 즉시 박제 (status=ACTIVE), 빈 day 카드 N개 자동 생성.
// 사용자는 ViewTrip 의 "+ 장소 추가" 로 슬롯 채워나감.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { createManualWithMeta } from '../api/itineraries';

// CreateTrip.jsx 와 동일한 옵션 셋 (시연용 복사 — 나중에 utils 로 추출 가능).
const CITY_GROUPS = [
  {
    country: '🇯🇵 일본',
    cities: [
      { name: '도쿄', emoji: '🗾' }, { name: '오사카', emoji: '🏯' },
      { name: '교토', emoji: '⛩️' }, { name: '후쿠오카', emoji: '🍜' },
      { name: '삿포로', emoji: '❄️' }, { name: '오키나와', emoji: '🏖️' },
    ],
  },
  {
    country: '🌴 동남아',
    cities: [
      { name: '발리', emoji: '🏝️' }, { name: '다낭', emoji: '🌊' },
      { name: '방콕', emoji: '🛕' }, { name: '싱가포르', emoji: '🌃' },
      { name: '코타키나발루', emoji: '🌅' }, { name: '쿠알라룸푸르', emoji: '🏙️' },
    ],
  },
  {
    country: '🇰🇷 한국',
    cities: [
      { name: '서울', emoji: '🏙️' }, { name: '부산', emoji: '🌊' },
      { name: '제주', emoji: '🍊' }, { name: '강릉·속초', emoji: '⛱️' },
      { name: '경주', emoji: '🏯' }, { name: '여수', emoji: '🌅' },
    ],
  },
  {
    country: '🌍 유럽 · 기타',
    cities: [
      { name: '파리', emoji: '🗼' }, { name: '로마', emoji: '🏛️' },
      { name: '바르셀로나', emoji: '⛪' }, { name: '런던', emoji: '🎡' },
      { name: '뉴욕', emoji: '🗽' }, { name: '대만', emoji: '🥟' },
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

const COMPANION_OPTIONS = [
  { id: 'SOLO', label: '혼자', emoji: '🚶' },
  { id: 'FRIENDS', label: '친구와', emoji: '👫' },
  { id: 'COUPLE', label: '연인과', emoji: '💑' },
  { id: 'COUPLE2', label: '배우자와', emoji: '💍', mapsTo: 'COUPLE' },
  { id: 'FAMILY', label: '아이와', emoji: '👨‍👩‍👧' },
  { id: 'PARENTS', label: '부모님과', emoji: '👵', mapsTo: 'FAMILY' },
];

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

const PACE_OPTIONS = [
  { id: 'RELAXED', label: '여유롭게', emoji: '🛌', sub: '하루 3곳' },
  { id: 'NORMAL', label: '보통', emoji: '🚶', sub: '하루 4곳' },
  { id: 'PACKED', label: '빼곡하게', emoji: '🏃', sub: '하루 6곳' },
];

const TOTAL_STEPS = 3;

const STEP_TITLE = [
  { title: '어디로 떠나시나요?', sub: '도시 1곳을 선택해 주세요' },
  { title: '여행 날짜를 정해주세요', sub: '시작과 끝 날짜를 선택하면 캘린더에 박제돼요' },
  { title: '어떤 스타일의 여행인가요?', sub: '여행기 카테고리에 활용돼요 · 건너뛰어도 OK' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const CreateTripManual = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cityKo, setCityKo] = useState(null);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [companions, setCompanions] = useState([]);
  const [styles, setStyles] = useState([]);
  const [pace, setPace] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dayCount = (() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e - s) / 86400000);
    return diff < 0 ? 0 : diff + 1;
  })();
  const validDates = startDate && endDate && new Date(endDate) >= new Date(startDate);

  const canProceed = (() => {
    switch (step) {
      case 0: return !!cityKo;
      case 1: return validDates;
      case 2: return true; // 스타일은 "다음에 하기" 가능
      default: return false;
    }
  })();

  const handleNext = () => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  };

  const toggle = (setter, list, id) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const cityEn = CITY_KO_TO_EN[cityKo] || cityKo;
      const country = CITY_TO_COUNTRY[cityEn] || '';

      const firstComp = companions[0];
      const compOpt = COMPANION_OPTIONS.find((c) => c.id === firstComp);
      const companionType = compOpt?.mapsTo || compOpt?.id || null;

      const themesSet = new Set();
      styles.forEach((sid) => {
        const opt = STYLE_OPTIONS.find((o) => o.id === sid);
        opt?.themes.forEach((t) => themesSet.add(t));
      });
      const themes = themesSet.size > 0 ? Array.from(themesSet) : null;

      const title = `${cityKo} ${dayCount > 1 ? `${dayCount - 1}박 ` : ''}${dayCount}일 일정`;

      const res = await createManualWithMeta({
        title, city: cityEn, country, startDate, endDate,
        companionType, themes, pace,
      });
      const newId = res?.itineraryId;
      if (!newId) throw new Error('일정 ID 를 받지 못했습니다.');
      navigate(`/trips/${newId}`);
    } catch (err) {
      setError(err.message || '생성 실패');
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button type="button" className="header-btn" onClick={handleBack} aria-label="뒤로">
            ←
          </button>
          <div className="header-title">직접 짜기</div>
          <div
            style={{
              fontSize: 12, fontWeight: 700, color: 'var(--primary-deep)',
              width: 36, textAlign: 'right',
            }}
          >
            {step + 1}/{TOTAL_STEPS}
          </div>
        </header>

        <main className="main loose">
          <div className="progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <h1 className="title">{STEP_TITLE[step].title}</h1>
          <p className="subtitle">{STEP_TITLE[step].sub}</p>

          {step === 0 && (
            <CityStep cityKo={cityKo} setCityKo={setCityKo} />
          )}

          {step === 1 && (
            <DateStep
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              dayCount={dayCount}
              valid={validDates}
            />
          )}

          {step === 2 && (
            <StyleStep
              companions={companions}
              styles={styles}
              pace={pace}
              toggleCompanion={(id) => toggle(setCompanions, companions, id)}
              toggleStyle={(id) => toggle(setStyles, styles, id)}
              setPace={setPace}
              cityKo={cityKo}
              dayCount={dayCount}
            />
          )}

          {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}

          <div style={{ height: 100 }} />
        </main>

        <div className="cta-fixed">
          {step === TOTAL_STEPS - 1 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn dark-ghost"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                다음에 하기
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? '만드는 중...' : '시작하기'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={handleNext}
              disabled={!canProceed}
            >
              다음 →
            </button>
          )}
        </div>

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
            fontSize: 11, fontWeight: 700, color: 'var(--text-soft)',
            letterSpacing: 0.5, margin: '6px 0 10px',
          }}
        >
          {g.country}
        </div>
        <div className="option-grid cols-3" style={{ marginBottom: 22 }}>
          {g.cities.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`option${cityKo === c.name ? ' selected' : ''}`}
              onClick={() => setCityKo(c.name)}
            >
              <span className="emoji">{c.emoji}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>
    ))}
  </>
);

const DateStep = ({ startDate, endDate, setStartDate, setEndDate, dayCount, valid }) => {
  const today = todayStr();
  return (
    <>
      <div className="field">
        <label className="field-label" htmlFor="start-date">시작 날짜</label>
        <input
          id="start-date"
          type="date"
          className="input"
          value={startDate}
          min={today}
          onChange={(e) => {
            const v = e.target.value;
            setStartDate(v);
            if (endDate && new Date(endDate) < new Date(v)) setEndDate(v);
          }}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="end-date">끝 날짜</label>
        <input
          id="end-date"
          type="date"
          className="input"
          value={endDate}
          min={startDate || today}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="info-box" style={{ marginTop: 18 }}>
        <span className="label">📅 선택한 기간</span>
        {valid && dayCount > 0 ? (
          <>
            <strong>{dayCount > 1 ? `${dayCount - 1}박 ${dayCount}일` : '당일치기'}</strong>
            {' · 빈 day 카드 '}
            <strong>{dayCount}개</strong>
            {' 가 자동 생성돼요'}
          </>
        ) : (
          '끝 날짜는 시작 날짜 이후로 정해 주세요'
        )}
      </div>
    </>
  );
};

const StyleStep = ({ companions, styles, pace, toggleCompanion, toggleStyle, setPace, cityKo, dayCount }) => (
  <>
    <h2 className="section-title" style={{ marginTop: 0 }}>👫 누구와 떠나요?</h2>
    <div className="option-grid cols-3" style={{ marginBottom: 22 }}>
      {COMPANION_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`option${companions.includes(opt.id) ? ' selected' : ''}`}
          onClick={() => toggleCompanion(opt.id)}
        >
          <span className="emoji">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>

    <h2 className="section-title">🎨 어떤 스타일?</h2>
    <div className="option-grid cols-3" style={{ marginBottom: 22 }}>
      {STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`option${styles.includes(opt.id) ? ' selected' : ''}`}
          onClick={() => toggleStyle(opt.id)}
        >
          <span className="emoji">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>

    <h2 className="section-title">⏱️ 페이스</h2>
    <div className="option-grid cols-3">
      {PACE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`option${pace === opt.id ? ' selected' : ''}`}
          onClick={() => setPace(opt.id)}
        >
          <span className="emoji">{opt.emoji}</span>
          {opt.label}
          <div style={{ fontSize: 10.5, color: 'var(--text-soft)', marginTop: 2, fontWeight: 500 }}>
            {opt.sub}
          </div>
        </button>
      ))}
    </div>

    <h2 className="section-title">📋 요약</h2>
    <div className="card" style={{ background: 'var(--bg-soft)', border: 0 }}>
      {cityKo && <span className="chip">🗾 {cityKo}</span>}
      {dayCount > 0 && <span className="chip coral">{dayCount > 1 ? `${dayCount - 1}박 ${dayCount}일` : '당일치기'}</span>}
      <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-soft)', lineHeight: 1.55 }}>
        💡 입력하지 않아도 OK. 추후 여행기 발행 시 카테고리 자동 매칭에 활용돼요.
      </div>
    </div>
  </>
);

export default CreateTripManual;
