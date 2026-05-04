// src/pages/CreateTrip.jsx — Figma node 1:11057 + BE AI generate / YouTube parse 연동
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import {
  generateAiItinerary,
  parseYoutubeItinerary,
  pollAiRequest,
} from '../api/itineraries';

const imgYouTubeField =
  'https://www.figma.com/api/mcp/asset/7ac6a48d-52d1-4312-ace0-e1b8a954c097';
const imgGenerateSparkle =
  'https://www.figma.com/api/mcp/asset/f964be6f-fe8e-43d9-8f89-7b8d435a5364';

// UI 'Budget Level' 라벨 → BE Pace enum 매핑
const PACE_OPTIONS = [
  { id: 'RELAXED', label: 'Relaxed' },
  { id: 'NORMAL', label: 'Normal', twoLine: false },
  { id: 'PACKED', label: 'Packed' },
];

// UI 테마 → BE themes 배열 매핑
const themeOptions = [
  { id: 'NATURE', themes: ['NATURE'], label: 'Nature', icon: 'landscape', col: 1, row: 1 },
  { id: 'CITY', themes: ['CULTURE'], label: 'City Explorer', icon: 'apartment', col: 2, row: 1, twoLine: true },
  { id: 'FOOD', themes: ['FOOD'], label: 'Culinary', icon: 'restaurant', col: 1, row: 2 },
  { id: 'CULTURE', themes: ['CULTURE', 'FOOD'], label: 'Culture', icon: 'museum', col: 2, row: 2 },
];

function todayPlus(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const [pace, setPace] = useState('NORMAL');
  const [themeId, setThemeId] = useState('CITY');
  const [city, setCity] = useState('Tokyo');
  const [days, setDays] = useState(4);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [generating, setGenerating] = useState(false);
  const [stepLabel, setStepLabel] = useState('');
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e?.preventDefault?.();
    if (generating) return;
    setError(null);
    setGenerating(true);

    const themeOption = themeOptions.find((t) => t.id === themeId) || themeOptions[1];

    try {
      let requestId;
      if (youtubeUrl.trim()) {
        setStepLabel('Parsing video transcript...');
        const res = await parseYoutubeItinerary({ youtubeUrl: youtubeUrl.trim() });
        requestId = res.requestId;
      } else {
        setStepLabel('Generating with AI...');
        const startDate = todayPlus(7);
        const endDate = todayPlus(7 + Math.max(1, days) - 1);
        const res = await generateAiItinerary({
          city,
          country: '',
          startDate,
          endDate,
          companionType: 'COUPLE',
          themes: themeOption.themes,
          pace,
        });
        requestId = res.requestId;
      }

      if (!requestId) throw new Error('AI 요청 ID를 받지 못했습니다.');

      setStepLabel('Mapping geographical points...');
      const result = await pollAiRequest(requestId, { intervalMs: 1500, timeoutMs: 90000 });

      if (result.status === 'COMPLETED' && result.itineraryId) {
        setStepLabel('Finalizing itinerary structure...');
        navigate(`/trips/${result.itineraryId}`);
      } else {
        throw new Error('AI 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError(err.message || '생성 실패');
      setGenerating(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-start relative selection:bg-primary-container selection:text-on-primary-container"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(248, 249, 255) 0%, rgb(248, 249, 255) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
    >
      <header className="fixed top-0 w-full z-[2] backdrop-blur-[6px] bg-white/80 border-b border-[#f3f4f6] shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-w-xl mx-auto left-0 right-0">
        <div className="flex h-11 items-center justify-between px-4 max-w-xl mx-auto w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-8 rounded-full bg-[#d3e4fe] flex items-center justify-center shrink-0"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[#464555] text-[18px]" aria-hidden>
              arrow_back
            </span>
          </button>
          <h1 className="font-['Inter'] font-semibold text-[18px] leading-7 tracking-[-0.45px] text-[#4f46e5]">
            TripLog AI
          </h1>
          <div className="size-8" aria-hidden />
        </div>
      </header>

      <main className="flex flex-col w-full max-w-xl mx-auto z-[1] pb-[100px] pt-[44px] px-[22px]">
        <div className="flex flex-col gap-11 pt-[22px] w-full">
          <div className="flex flex-col gap-[5.5px]">
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[44px] leading-[52px] tracking-[-0.88px] text-[#0b1c30]">
              <span className="block">Design Your</span>
              <span className="block">Journey</span>
            </h2>
            <p className="font-['Inter'] text-[18px] text-[#464555] leading-7">
              <span className="block">Provide a spark of inspiration, and let</span>
              <span className="block">our AI craft the perfect itinerary.</span>
            </p>
          </div>

          {!generating && (
            <form onSubmit={handleGenerate} className="flex flex-col gap-[22px] w-full">
              <section className="bg-white border border-[rgba(199,196,216,0.3)] rounded-xl shadow-[0_4px_6px_rgba(53,37,205,0.02)] px-[23px] pt-[23px] pb-[39px]">
                <div className="flex flex-col gap-11 w-full">
                  {/* YouTube URL */}
                  <div className="flex flex-col gap-[5.5px]">
                    <label htmlFor="yt-url" className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                      Inspiration Source (Optional)
                    </label>
                    <div className="relative w-full">
                      <div className="relative h-11 rounded-lg border border-[#c7c4d8] overflow-hidden shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]">
                        <div className="absolute inset-0 bg-[#f8f9ff] rounded-lg pointer-events-none" aria-hidden />
                        <div className="absolute left-[13px] top-1/2 -translate-y-1/2 size-5 pointer-events-none">
                          <img
                            alt=""
                            className="w-full h-full object-contain"
                            src={imgYouTubeField}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <input
                          id="yt-url"
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Paste YouTube video URL..."
                          className="relative w-full h-full bg-transparent pl-[45px] pr-3 py-3 font-['Inter'] text-[16px] text-[#0b1c30] placeholder:text-[rgba(119,117,135,0.7)] outline-none rounded-lg"
                        />
                      </div>
                    </div>
                    <p className="font-['Inter'] font-medium text-[13px] text-[#777587] tracking-[0.26px] pt-1 leading-[18px]">
                      <span className="block">유튜브 URL을 넣으면 자막 분석으로</span>
                      <span className="block">실제 코스를 그대로 가져옵니다. (선택)</span>
                    </p>
                  </div>

                  {/* City + Days */}
                  {!youtubeUrl.trim() && (
                    <div className="flex gap-3 w-full">
                      <div className="flex-1 flex flex-col gap-[5.5px]">
                        <label htmlFor="city" className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Tokyo, Paris, ..."
                          className="h-11 px-3 rounded-lg border border-[#c7c4d8] bg-[#f8f9ff] outline-none font-['Inter'] text-[15px] text-[#0b1c30] focus:border-[#4f46e5] focus:bg-white transition-colors"
                          required={!youtubeUrl.trim()}
                        />
                      </div>
                      <div className="w-28 flex flex-col gap-[5.5px]">
                        <label htmlFor="days" className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                          Days
                        </label>
                        <input
                          id="days"
                          type="number"
                          min={1}
                          max={14}
                          value={days}
                          onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
                          className="h-11 px-3 rounded-lg border border-[#c7c4d8] bg-[#f8f9ff] outline-none font-['Inter'] text-[15px] text-[#0b1c30] focus:border-[#4f46e5] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pace (Budget Level slot) */}
                  <div className="flex flex-col gap-[5.5px]">
                    <span className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">Pace</span>
                    <div className="flex gap-[11px] w-full">
                      {PACE_OPTIONS.map((opt) => {
                        const isSel = pace === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setPace(opt.id)}
                            className={`flex-1 min-w-0 h-11 rounded-lg border flex items-center justify-center px-4 transition-colors ${
                              isSel
                                ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden'
                                : 'bg-white border-[#c7c4d8]'
                            }`}
                          >
                            <span
                              className={`relative font-['Inter'] font-medium text-[13px] tracking-[0.26px] ${
                                isSel ? 'text-[#dad7ff]' : 'text-[#464555]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="flex flex-col gap-[5.5px]">
                    <span className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                      Primary Theme
                    </span>
                    <div className="grid grid-cols-2 gap-[11px] w-full">
                      {themeOptions.map((opt) => {
                        const isSel = themeId === opt.id;
                        const baseBtn =
                          'min-h-[44px] rounded-lg flex items-center gap-[11px] px-3 py-1 border transition-colors text-left';
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setThemeId(opt.id)}
                            className={`${baseBtn} ${
                              isSel
                                ? 'bg-[rgba(195,192,255,0.2)] border-[#3525cd]'
                                : 'bg-white border-[#c7c4d8]'
                            }`}
                            style={{ gridColumnStart: opt.col, gridRowStart: opt.row }}
                          >
                            <span
                              className={`size-4 rounded-full border shrink-0 flex items-center justify-center ${
                                isSel ? 'border-[#3525cd] bg-[#3525cd]' : 'border-[#c7c4d8] bg-white'
                              }`}
                            >
                              {isSel ? (
                                <span className="material-symbols-outlined text-white text-[12px]" aria-hidden>
                                  check
                                </span>
                              ) : null}
                            </span>
                            <span className="material-symbols-outlined text-[#0b1c30] text-base shrink-0" aria-hidden>
                              {opt.icon}
                            </span>
                            <span
                              className={`font-['Inter'] text-[13px] text-[#0b1c30] tracking-[0.26px] leading-[18px] ${
                                isSel ? 'font-semibold' : 'font-medium'
                              }`}
                            >
                              {opt.twoLine ? (
                                <>
                                  <span className="block">City</span>
                                  <span className="block">Explorer</span>
                                </>
                              ) : (
                                opt.label
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-['Inter'] text-[13px] text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="pt-[22px] border-t border-[rgba(199,196,216,0.3)]">
                    <button
                      type="submit"
                      className="w-full h-[54px] rounded-lg bg-[#3525cd] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center gap-[11px] hover:opacity-95 transition-opacity"
                    >
                      <span
                        className="material-symbols-outlined text-white text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden
                      >
                        auto_awesome
                      </span>
                      <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7">
                        Generate Itinerary
                      </span>
                    </button>
                  </div>
                </div>
              </section>
            </form>
          )}

          {generating && (
            <section
              className="relative overflow-hidden rounded-xl border border-[rgba(203,219,245,0.5)] min-h-[300px] p-[23px] flex flex-col items-center justify-center"
              style={{
                backgroundImage:
                  'linear-gradient(129.82deg, rgb(239, 244, 255) 0%, rgb(229, 238, 255) 50%, rgb(211, 228, 254) 100%)',
              }}
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(226,223,255,0.9)_0%,transparent_70%)]" />
              <div
                className="absolute -top-20 -right-20 size-64 rounded-full bg-[#c9e6ff] blur-[40px] opacity-40 pointer-events-none"
                aria-hidden
              />

              <div className="relative flex flex-col items-center gap-[22px] w-full max-w-[280px]">
                <div className="relative flex items-center justify-center size-[88px] rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <div
                    className="absolute inset-[-18px] rounded-full border-4 border-[#3525cd]/80 border-t-transparent animate-spin"
                    style={{ animationDuration: '2.5s' }}
                    aria-hidden
                  />
                  <span className="material-symbols-outlined text-[#3525cd] text-[24px] relative z-[1]" aria-hidden>
                    autorenew
                  </span>
                </div>

                <div className="flex flex-col gap-[11px] items-center text-center">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                    AI generating your itinerary...
                  </h3>
                  <p className="font-['Inter'] text-[16px] text-[#464555] leading-6">
                    {stepLabel || 'Analyzing your preferences...'}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-['Inter'] text-[13px] text-red-700 max-w-full">
                    {error}
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setGenerating(false);
                      }}
                      className="ml-2 font-semibold underline"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CreateTrip;
