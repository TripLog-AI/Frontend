// src/pages/CreateTrip.jsx — Triple식 5-step wizard (객관식 wizard)
// Multi-step: 도시 → 기간 → 동행 → 페이스 → 스타일 → AI generate
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateAiItinerary,
  pollAiRequest,
} from '../api/itineraries';

// ─── Step 1: 기간 (객관식 + custom) ─────────────────────────────
const DURATION_OPTIONS = [
  { id: 'd1', label: '당일치기', days: 1 },
  { id: 'd2', label: '1박 2일', days: 2 },
  { id: 'd3', label: '2박 3일', days: 3 },
  { id: 'd4', label: '3박 4일', days: 4 },
  { id: 'd5', label: '4박 5일', days: 5 },
  { id: 'd6', label: '5박 6일', days: 6 },
];

// ─── Step 2: 동행 (다중 선택) — BE는 첫번째만 사용 ──────────────
const COMPANION_OPTIONS = [
  { id: 'SOLO', label: '혼자' },
  { id: 'FRIENDS', label: '친구와' },
  { id: 'COUPLE', label: '연인과' },
  { id: 'COUPLE2', label: '배우자와', mapsTo: 'COUPLE' },
  { id: 'FAMILY', label: '아이와' },
  { id: 'PARENTS', label: '부모님과' },
  { id: 'OTHER', label: '기타', mapsTo: 'FRIENDS' },
];

// ─── Step 3: 페이스 ─────────────────────────────────────────────
const PACE_OPTIONS = [
  { id: 'RELAXED', label: '여유롭게', sub: '하루 3곳' },
  { id: 'NORMAL', label: '보통', sub: '하루 4곳' },
  { id: 'PACKED', label: '빼곡하게', sub: '하루 6곳' },
];

// ─── Step 4: 스타일 (다중 선택, BE themes 매핑) ─────────────────
const STYLE_OPTIONS = [
  { id: 'activity', label: '체험·액티비티', themes: ['NATURE'] },
  { id: 'sns', label: 'SNS 핫플', themes: ['CULTURE'] },
  { id: 'nature', label: '자연과 함께', themes: ['NATURE'] },
  { id: 'famous', label: '유명 관광지', themes: ['CULTURE'] },
  { id: 'relax', label: '여유롭게 힐링', themes: ['RELAX'] },
  { id: 'culture', label: '문화·예술·역사', themes: ['CULTURE'] },
  { id: 'feel', label: '여행지 느낌 물씬', themes: ['CULTURE', 'NATURE'] },
  { id: 'shopping', label: '쇼핑은 열정적', themes: ['SHOPPING'] },
  { id: 'food', label: '관광보다 먹방', themes: ['FOOD'] },
];

// ─── Step 5: 도시 (국가 그룹) ───────────────────────────────────
const CITY_GROUPS = [
  {
    country: '일본',
    countryCode: 'Japan',
    cities: ['도쿄', '오사카', '교토', '후쿠오카', '삿포로', '오키나와'],
  },
  {
    country: '동남아',
    countryCode: 'SEA',
    cities: ['방콕', '쿠알라룸푸르', '싱가포르', '발리', '코타키나발루', '다낭'],
  },
  {
    country: '대한민국',
    countryCode: 'South Korea',
    cities: ['서울', '부산', '제주', '강릉·속초', '경주', '여수'],
  },
  {
    country: '유럽',
    countryCode: 'Europe',
    cities: ['파리', '로마', '바르셀로나', '런던', '암스테르담', '프라하'],
  },
  {
    country: '기타',
    countryCode: 'Other',
    cities: ['뉴욕', '두바이', '이스탄불', '시드니', '홍콩', '대만'],
  },
];

// 한글 도시 → 영문 city 매핑 (AI 호출용)
const CITY_KO_TO_EN = {
  도쿄: 'Tokyo', 오사카: 'Osaka', 교토: 'Kyoto', 후쿠오카: 'Fukuoka',
  삿포로: 'Sapporo', 오키나와: 'Okinawa',
  방콕: 'Bangkok', 쿠알라룸푸르: 'Kuala Lumpur', 싱가포르: 'Singapore',
  발리: 'Bali', 코타키나발루: 'Kota Kinabalu', 다낭: 'Da Nang',
  서울: 'Seoul', 부산: 'Busan', 제주: 'Jeju',
  '강릉·속초': 'Gangneung', 경주: 'Gyeongju', 여수: 'Yeosu',
  파리: 'Paris', 로마: 'Rome', 바르셀로나: 'Barcelona',
  런던: 'London', 암스테르담: 'Amsterdam', 프라하: 'Prague',
  뉴욕: 'New York', 두바이: 'Dubai', 이스탄불: 'Istanbul',
  시드니: 'Sydney', 홍콩: 'Hong Kong', 대만: 'Taipei',
};

const CITY_TO_COUNTRY = {
  Tokyo: 'Japan', Osaka: 'Japan', Kyoto: 'Japan', Fukuoka: 'Japan',
  Sapporo: 'Japan', Okinawa: 'Japan',
  Bangkok: 'Thailand', 'Kuala Lumpur': 'Malaysia', Singapore: 'Singapore',
  Bali: 'Indonesia', 'Kota Kinabalu': 'Malaysia', 'Da Nang': 'Vietnam',
  Seoul: 'South Korea', Busan: 'South Korea', Jeju: 'South Korea',
  Gangneung: 'South Korea', Gyeongju: 'South Korea', Yeosu: 'South Korea',
  Paris: 'France', Rome: 'Italy', Barcelona: 'Spain',
  London: 'United Kingdom', Amsterdam: 'Netherlands', Prague: 'Czech Republic',
  'New York': 'USA', Dubai: 'United Arab Emirates', Istanbul: 'Turkey',
  Sydney: 'Australia', 'Hong Kong': 'China', Taipei: 'Taiwan',
};

const TOTAL_STEPS = 5;

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0~4 = 5 steps. 5 = generating.
  const [duration, setDuration] = useState(null); // {id, days}
  const [companions, setCompanions] = useState([]); // ids
  const [pace, setPace] = useState('NORMAL');
  const [styles, setStyles] = useState([]); // style ids
  const [cityKo, setCityKo] = useState(null);

  const [stepLabel, setStepLabel] = useState('');
  const [error, setError] = useState(null);

  // Step 순서: City → Duration → Companion → Pace → Style
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

  const toggleCompanion = (id) => {
    setCompanions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const toggleStyle = (id) => {
    setStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  };

  const handleGenerate = async () => {
    setError(null);
    setStep(5); // generating screen

    try {
      const cityEn = CITY_KO_TO_EN[cityKo] || cityKo;
      const country = CITY_TO_COUNTRY[cityEn] || '';

      const days = duration.days;
      const startDate = todayPlus(7);
      const endDate = todayPlus(7 + Math.max(1, days) - 1);

      // companions 다중 → BE 단일 (첫번째 사용, mapsTo 적용)
      const firstComp = companions[0];
      const compOpt = COMPANION_OPTIONS.find((c) => c.id === firstComp);
      const companionType = compOpt?.mapsTo || compOpt?.id || 'SOLO';

      // styles 다중 → BE themes 배열 (중복 제거)
      const themesSet = new Set();
      styles.forEach((sid) => {
        const opt = STYLE_OPTIONS.find((o) => o.id === sid);
        opt?.themes.forEach((t) => themesSet.add(t));
      });
      const themes = Array.from(themesSet);

      setStepLabel('AI generating with RAG...');
      const res = await generateAiItinerary({
        city: cityEn,
        country,
        startDate,
        endDate,
        companionType,
        themes,
        pace,
      });
      const requestId = res.requestId;

      if (!requestId) throw new Error('AI 요청 ID를 받지 못했습니다.');

      setStepLabel('Mapping geographical points...');
      const result = await pollAiRequest(requestId, { intervalMs: 1500, timeoutMs: 90000 });

      if (result.status === 'COMPLETED' && result.itineraryId) {
        setStepLabel('Finalizing itinerary...');
        navigate(`/trips/${result.itineraryId}`);
      } else {
        throw new Error(result.errorMessage || 'AI 생성에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '생성 실패');
      setStep(TOTAL_STEPS - 1); // 마지막 step으로 복귀
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-[2] backdrop-blur-[6px] bg-white/90 border-b border-[#f3f4f6] max-w-xl mx-auto left-0 right-0">
        <div className="flex h-12 items-center justify-between px-4">
          <button
            type="button"
            onClick={handleBack}
            className="size-9 rounded-full flex items-center justify-center hover:bg-slate-100"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[#0b1c30] text-[22px]" aria-hidden>
              arrow_back
            </span>
          </button>
          {step < TOTAL_STEPS && (
            <span className="font-['Inter'] text-[14px] font-semibold text-[#4f46e5] tracking-tight">
              {step + 1}/{TOTAL_STEPS}
            </span>
          )}
          <div className="size-9" />
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 pt-[60px] pb-[120px] flex flex-col">
        {step === 0 && <Step1City cityKo={cityKo} setCityKo={setCityKo} />}
        {step === 1 && <Step2Duration duration={duration} setDuration={setDuration} />}
        {step === 2 && <Step3Companion companions={companions} toggleCompanion={toggleCompanion} />}
        {step === 3 && <Step4Pace pace={pace} setPace={setPace} />}
        {step === 4 && <Step5Style styles={styles} toggleStyle={toggleStyle} />}
        {step === 5 && <GeneratingScreen stepLabel={stepLabel} error={error} onRetry={() => setStep(TOTAL_STEPS - 1)} />}
      </main>

      {/* 하단 Next 버튼 (generating step 제외) */}
      {step < TOTAL_STEPS && (
        <footer className="fixed bottom-0 w-full max-w-xl mx-auto left-0 right-0 px-4 pb-6 pt-3 bg-white/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full h-14 rounded-xl font-['Inter'] text-[16px] font-semibold tracking-tight transition-colors ${
              canProceed
                ? 'bg-[#4f46e5] text-white hover:bg-[#3525cd] active:scale-[0.99]'
                : 'bg-[#e5eeff] text-[#94a3b8] cursor-not-allowed'
            }`}
          >
            {step === TOTAL_STEPS - 1 ? '맞춤 일정 받기' : '다음'}
          </button>
        </footer>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// Step Components
// ════════════════════════════════════════════════════════════════════

const StepHeader = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center text-center pt-4 pb-8">
    <span
      className="material-symbols-outlined text-[#4f46e5] text-[40px] mb-3"
      style={{ fontVariationSettings: "'FILL' 1" }}
      aria-hidden
    >
      {icon}
    </span>
    <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] leading-9 text-[#0b1c30]">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-1 font-['Inter'] text-[14px] text-[#777587]">{subtitle}</p>
    )}
  </div>
);

const Pill = ({ active, children, onClick, twoLine }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-[48px] px-5 rounded-full border font-['Inter'] text-[15px] font-medium tracking-tight transition-colors ${
      active
        ? 'border-[#4f46e5] bg-[rgba(195,192,255,0.15)] text-[#3525cd] font-semibold'
        : 'border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:border-[#c7c4d8]'
    } ${twoLine ? 'leading-tight py-2' : ''}`}
  >
    {children}
  </button>
);

const Step2Duration = ({ duration, setDuration }) => (
  <>
    <StepHeader icon="calendar_month" title="여행 기간은?" subtitle="원하는 기간을 선택해 주세요." />
    <div className="grid grid-cols-3 gap-3">
      {DURATION_OPTIONS.map((opt) => (
        <Pill
          key={opt.id}
          active={duration?.id === opt.id}
          onClick={() => setDuration(opt)}
        >
          {opt.label}
        </Pill>
      ))}
    </div>
  </>
);

const Step3Companion = ({ companions, toggleCompanion }) => (
  <>
    <StepHeader icon="group" title="누구와 떠나요?" subtitle="다중 선택이 가능해요." />
    <div className="grid grid-cols-3 gap-3">
      {COMPANION_OPTIONS.map((opt) => (
        <Pill
          key={opt.id}
          active={companions.includes(opt.id)}
          onClick={() => toggleCompanion(opt.id)}
        >
          {opt.label}
        </Pill>
      ))}
    </div>
  </>
);

const Step4Pace = ({ pace, setPace }) => (
  <>
    <StepHeader icon="speed" title="여행 페이스는?" subtitle="하루에 몇 곳을 갈지 정해요." />
    <div className="flex flex-col gap-3">
      {PACE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setPace(opt.id)}
          className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${
            pace === opt.id
              ? 'border-[#4f46e5] bg-[rgba(195,192,255,0.15)]'
              : 'border-[#e2e8f0] bg-white hover:border-[#c7c4d8]'
          }`}
        >
          <div>
            <div className={`font-['Plus_Jakarta_Sans'] text-[18px] font-semibold ${pace === opt.id ? 'text-[#3525cd]' : 'text-[#0b1c30]'}`}>
              {opt.label}
            </div>
            <div className="font-['Inter'] text-[13px] text-[#777587] mt-0.5">{opt.sub}</div>
          </div>
          <span
            className={`size-6 rounded-full border-2 flex items-center justify-center ${
              pace === opt.id ? 'border-[#4f46e5] bg-[#4f46e5]' : 'border-[#c7c4d8]'
            }`}
          >
            {pace === opt.id && (
              <span className="material-symbols-outlined text-white text-[16px]" aria-hidden>
                check
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  </>
);

const Step5Style = ({ styles, toggleStyle }) => (
  <>
    <StepHeader icon="palette" title="선호하는 여행 스타일은?" subtitle="다중 선택이 가능해요." />
    <div className="grid grid-cols-2 gap-3">
      {STYLE_OPTIONS.map((opt) => (
        <Pill
          key={opt.id}
          active={styles.includes(opt.id)}
          onClick={() => toggleStyle(opt.id)}
        >
          {opt.label}
        </Pill>
      ))}
    </div>
  </>
);

const Step1City = ({ cityKo, setCityKo }) => (
  <>
    <StepHeader icon="public" title="떠나고 싶은 도시는?" subtitle="도시 1곳을 선택해 주세요." />

    <div className="flex flex-col gap-6">
      {CITY_GROUPS.map((g) => (
        <div key={g.country}>
          <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[15px] text-[#464555] mb-2.5">
            {g.country}
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {g.cities.map((c) => (
              <Pill key={c} active={cityKo === c} onClick={() => setCityKo(c)}>
                {c}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);

const GeneratingScreen = ({ stepLabel, error, onRetry }) => (
  <section
    className="flex-1 flex flex-col items-center justify-center text-center"
    style={{
      backgroundImage:
        'linear-gradient(180deg, rgb(248, 249, 255) 0%, rgb(229, 238, 255) 100%)',
    }}
  >
    <div className="relative size-[88px] rounded-full bg-white flex items-center justify-center mb-6 shadow-md">
      <div
        className="absolute inset-[-12px] rounded-full border-4 border-[#3525cd]/80 border-t-transparent animate-spin"
        style={{ animationDuration: '2s' }}
        aria-hidden
      />
      <span className="material-symbols-outlined text-[#3525cd] text-[28px]" aria-hidden>
        auto_awesome
      </span>
    </div>
    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[22px] text-[#0b1c30] mb-2">
      AI가 일정을 만들고 있어요
    </h3>
    <p className="font-['Inter'] text-[14px] text-[#464555] max-w-[280px]">
      {stepLabel || '잠시만 기다려 주세요...'}
    </p>
    {error && (
      <div className="mt-6 max-w-[300px] bg-red-50 border border-red-200 rounded-lg p-3 font-['Inter'] text-[13px] text-red-700">
        {error}
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 font-semibold underline"
        >
          다시 시도
        </button>
      </div>
    )}
  </section>
);

export default CreateTrip;
