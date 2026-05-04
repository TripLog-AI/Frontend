// src/pages/CreateTrip.jsx — Figma node 1:11057 TripLog AI - Create Trip (PRD Aligned)
import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

const imgYouTubeField = 'https://www.figma.com/api/mcp/asset/7ac6a48d-52d1-4312-ace0-e1b8a954c097';
const imgGenerateSparkle = 'https://www.figma.com/api/mcp/asset/f964be6f-fe8e-43d9-8f89-7b8d435a5364';

const budgetOptions = [
  { id: 'budget', label: 'Budget' },
  { id: 'mid', label: 'Mid-Range', twoLine: true },
  { id: 'luxury', label: 'Luxury' },
];

const themeOptions = [
  { id: 'nature', label: 'Nature', icon: 'landscape', col: 1, row: 1 },
  { id: 'city', label: 'City Explorer', icon: 'apartment', col: 2, row: 1, twoLine: true },
  { id: 'culinary', label: 'Culinary', icon: 'restaurant', col: 1, row: 2 },
  { id: 'culture', label: 'Culture', icon: 'museum', col: 2, row: 2 },
];

const CreateTrip = () => {
  const [budget, setBudget] = useState('mid');
  const [theme, setTheme] = useState('city');

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
          <div className="size-8 rounded-full bg-[#d3e4fe] flex items-center justify-center shrink-0" aria-hidden>
            <span className="material-symbols-outlined text-[#464555] text-[18px]">person</span>
          </div>
          <h1 className="font-['Inter'] font-semibold text-[18px] leading-7 tracking-[-0.45px] text-[#4f46e5]">
            TripLog AI
          </h1>
          <button type="button" className="rounded-full p-1 text-[#464555] hover:bg-slate-100/80" aria-label="Settings">
            <span className="material-symbols-outlined text-[22px]" aria-hidden>
              settings
            </span>
          </button>
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

          <div className="flex flex-col gap-[22px] w-full">
            {/* Form */}
            <section className="bg-white border border-[rgba(199,196,216,0.3)] rounded-xl shadow-[0_4px_6px_rgba(53,37,205,0.02)] px-[23px] pt-[23px] pb-[39px]">
              <div className="flex flex-col gap-11 w-full">
                <div className="flex flex-col gap-[5.5px]">
                  <label htmlFor="yt-url" className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                    Inspiration Source
                  </label>
                  <div className="relative w-full">
                    <div className="relative h-11 rounded-lg border border-[#c7c4d8] overflow-hidden shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]">
                      <div className="absolute inset-0 bg-[#f8f9ff] rounded-lg pointer-events-none" aria-hidden />
                      <div className="absolute left-[13px] top-1/2 -translate-y-1/2 size-5 pointer-events-none">
                        <img alt="" className="w-full h-full object-contain" src={imgYouTubeField} />
                      </div>
                      <input
                        id="yt-url"
                        type="url"
                        placeholder="Paste YouTube video URL..."
                        className="relative w-full h-full bg-transparent pl-[45px] pr-3 py-3 font-['Inter'] text-[16px] text-[#0b1c30] placeholder:text-[rgba(119,117,135,0.7)] outline-none rounded-lg"
                      />
                    </div>
                  </div>
                  <p className="font-['Inter'] font-medium text-[13px] text-[#777587] tracking-[0.26px] pt-1 leading-[18px]">
                    <span className="block">{`e.g., "48 Hours in Tokyo" or "Budget`}</span>
                    <span className="block">{`Backpacking Europe"`}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-[5.5px]">
                  <span className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">Budget Level</span>
                  <div className="flex gap-[11px] w-full">
                    {budgetOptions.map((opt) => {
                      const isSel = budget === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBudget(opt.id)}
                          className={`flex-1 min-w-0 h-11 rounded-lg border flex items-center justify-center px-4 transition-colors ${
                            isSel
                              ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden'
                              : 'bg-white border-[#c7c4d8]'
                          }`}
                        >
                          {isSel ? (
                            <span className="absolute inset-0 bg-white/10 pointer-events-none" aria-hidden />
                          ) : null}
                          {opt.twoLine ? (
                            <span
                              className={`relative font-['Inter'] font-semibold text-[13px] text-center tracking-[0.26px] leading-[18px] ${
                                isSel ? 'text-[#dad7ff]' : 'text-[#464555]'
                              }`}
                            >
                              <span className="block">Mid-</span>
                              <span className="block">Range</span>
                            </span>
                          ) : (
                            <span
                              className={`relative font-['Inter'] font-medium text-[13px] tracking-[0.26px] ${
                                isSel ? 'text-[#dad7ff]' : 'text-[#464555]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-[5.5px]">
                  <span className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                    Primary Theme
                  </span>
                  <div className="grid grid-cols-2 gap-[11px] w-full">
                    {themeOptions.map((opt) => {
                      const isSel = theme === opt.id;
                      const baseBtn =
                        'min-h-[44px] rounded-lg flex items-center gap-[11px] px-3 py-1 border transition-colors text-left';
                      if (opt.id === 'city') {
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTheme(opt.id)}
                            className={`${baseBtn} col-start-2 row-start-1 relative pl-10 ${
                              isSel
                                ? 'bg-[rgba(195,192,255,0.2)] border-[#3525cd]'
                                : 'bg-white border-[#c7c4d8]'
                            }`}
                          >
                            <span
                              className={`absolute left-[10px] top-1/2 -translate-y-1/2 size-[18px] rounded-full border flex items-center justify-center ${
                                isSel
                                  ? 'bg-[#3525cd] border-transparent'
                                  : 'bg-white border-[#c7c4d8]'
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
                              <span className="block">City</span>
                              <span className="block">Explorer</span>
                            </span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTheme(opt.id)}
                          className={`${baseBtn} bg-white border-[#c7c4d8]`}
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
                          <span className="font-['Inter'] font-medium text-[13px] text-[#0b1c30] tracking-[0.26px]">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-[22px] border-t border-[rgba(199,196,216,0.3)]">
                  <button
                    type="button"
                    className="w-full h-[54px] rounded-lg bg-[#3525cd] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center gap-[11px] hover:opacity-95 transition-opacity"
                  >
                    <span className="relative size-[18px] shrink-0">
                      <img alt="" className="absolute inset-0 w-full h-full object-contain" src={imgGenerateSparkle} />
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7">Generate Itinerary</span>
                  </button>
                </div>
              </div>
            </section>

            {/* AI status */}
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
                    <span className="block">{`Analyzing YouTube & AI`}</span>
                    <span className="block">generating...</span>
                  </h3>
                  <p className="font-['Inter'] text-[16px] text-[#464555] leading-6">
                    <span className="block">Extracting locations, matching your</span>
                    <span className="block">Mid-Range budget, and curating City</span>
                    <span className="block">Explorer activities.</span>
                  </p>
                </div>

                <div className="flex flex-col gap-[11px] w-full max-w-[280px] pt-[22px]">
                  <div className="flex gap-[11px] items-center w-full">
                    <span className="material-symbols-outlined text-[#3525cd] text-[15px] shrink-0" aria-hidden>
                      check_circle
                    </span>
                    <span className="font-['Inter'] font-medium text-[13px] text-[#0b1c30] tracking-[0.26px]">
                      Parsing video transcript
                    </span>
                  </div>
                  <div className="flex gap-[11px] items-center w-full">
                    <span className="material-symbols-outlined text-[#464555] text-[15px] shrink-0" aria-hidden>
                      hourglass_top
                    </span>
                    <span className="font-['Inter'] font-medium text-[13px] text-[#464555] tracking-[0.26px]">
                      Mapping geographical points
                    </span>
                  </div>
                  <div className="flex gap-[11px] items-center w-full">
                    <span className="material-symbols-outlined text-[#777587] text-[15px] shrink-0" aria-hidden>
                      radio_button_unchecked
                    </span>
                    <span className="font-['Inter'] font-medium text-[13px] text-[#777587] tracking-[0.26px]">
                      Finalizing itinerary structure
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CreateTrip;
