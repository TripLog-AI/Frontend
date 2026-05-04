// src/pages/MyTrips.jsx — Figma node 1:10253 TripLog AI - My Trips (Dynamic)
import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const TripCardMenu = () => (
  <button
    type="button"
    className="flex items-center justify-center p-[5.5px] rounded-lg text-[#464555] hover:bg-slate-100/80"
    aria-label="More options"
  >
    <span className="material-symbols-outlined text-[18px] text-[#94a3b8]" aria-hidden>
      more_horiz
    </span>
  </button>
);

const MyTrips = () => {
  return (
    <div
      className="min-h-screen isolate flex flex-col items-start pb-[140px] pt-[44px] selection:bg-primary-container selection:text-on-primary-container"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(248, 249, 255) 0%, rgb(248, 249, 255) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
    >
      <header className="fixed top-0 w-full z-[2] backdrop-blur-[6px] bg-white/80 border-b border-[#e2e8f0] shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-w-xl mx-auto left-0 right-0">
        <div className="flex items-center justify-between px-5 py-3 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-[11px]">
            <span
              className="material-symbols-outlined text-[#4f46e5] text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              travel_explore
            </span>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] leading-7 tracking-tight text-[#4f46e5]">
              TripLog AI
            </span>
          </div>
          <div
            className="size-8 rounded-full bg-[#d3e4fe] border border-[#c7c4d8] flex items-center justify-center shrink-0"
            aria-hidden
          >
            <span className="font-['Inter'] text-[13px] font-medium text-[#464555] tracking-[0.26px]">UP</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full z-[1] flex flex-col gap-11 px-[22px] pt-11">
        <div className="flex flex-col gap-[5.5px]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] leading-10 tracking-[-0.32px] text-[#0b1c30]">
            My Trips
          </h1>
          <p className="font-['Inter'] text-[16px] text-[#464555] leading-6">
            Your travel history and upcoming adventures.
          </p>
        </div>

        <div className="flex flex-col gap-[22px] w-full">
          {/* Card 1 — Upcoming (Kyoto) */}
          <article className="relative overflow-hidden bg-white border border-[#d3e4fe] rounded-xl p-[23px] shadow-[0_4px_11px_rgba(53,37,205,0.02)]">
            <div
              className="absolute h-[120px] left-0 right-0 top-0 pointer-events-none rounded-t-xl"
              style={{
                backgroundImage:
                  'linear-gradient(160.77deg, rgba(195, 192, 255, 0.3) 0%, rgb(255, 255, 255) 100%)',
              }}
              aria-hidden
            />
            <div className="relative flex flex-col">
              <div className="flex items-start justify-between pb-[22px]">
                <div className="inline-flex items-center gap-[5.5px] rounded-full bg-[#c9e6ff] px-[11px] py-[5.5px]">
                  <span className="material-symbols-outlined text-[#001e2f] text-[14px]" aria-hidden>
                    flight
                  </span>
                  <span className="font-['Inter'] text-[13px] font-medium text-[#001e2f] tracking-[0.26px]">Upcoming</span>
                </div>
                <TripCardMenu />
              </div>
              <div className="relative flex flex-col gap-[5.5px]">
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                  Kyoto Autumn Retreat
                </h2>
                <div className="flex items-center gap-[5.5px] text-[#464555]">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden>
                    calendar_month
                  </span>
                  <span className="font-['Inter'] text-[16px] leading-6">Nov 12 - Nov 20, 2024</span>
                </div>
                <div className="flex flex-wrap gap-[5.5px] pt-4">
                  {['Culture', 'Food', 'AI Planned'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#d3e4fe] px-[11px] py-0.5 font-['Inter'] text-[11px] text-[#464555] leading-[16.5px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Card 2 — Active (Paris) */}
          <article className="bg-white border border-[#c3c0ff] rounded-xl p-[23px] shadow-[0_0_0_1px_#4f46e5,0_4px_11px_rgba(53,37,205,0.02)] relative overflow-hidden">
            <div className="flex flex-col">
              <div className="flex items-start justify-between pb-[22px]">
                <div className="inline-flex items-center gap-[5.5px] rounded-full bg-[#4f46e5] px-[11px] py-[5.5px]">
                  <span className="material-symbols-outlined text-white text-[14px]" aria-hidden>
                    location_on
                  </span>
                  <span className="font-['Inter'] text-[13px] font-medium text-white tracking-[0.26px]">Active Now</span>
                </div>
                <TripCardMenu />
              </div>
              <div className="flex flex-col gap-[5.5px]">
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                  Paris Weekend Escape
                </h2>
                <div className="flex items-center gap-[5.5px] text-[#464555]">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden>
                    calendar_month
                  </span>
                  <span className="font-['Inter'] text-[16px] leading-6">Oct 24 - Oct 28, 2024</span>
                </div>
                <div className="mt-1 rounded-lg bg-[#cbdbf5] px-[11px] pt-[16.5px] pb-[11px] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-[11px] min-w-0">
                    <span className="material-symbols-outlined text-[#464555] text-[15px] shrink-0" aria-hidden>
                      local_cafe
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-['Inter'] text-[11px] text-[#464555] leading-[16.5px]">Next Activity</span>
                      <span className="font-['Inter'] text-[13px] font-medium text-[#0b1c30] tracking-[0.26px] truncate">
                        Cafe de Flore
                      </span>
                    </div>
                  </div>
                  <span className="font-['Inter'] text-[13px] font-medium text-[#3525cd] tracking-[0.26px] shrink-0">
                    10:00 AM
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 — Past (Banff) */}
          <article className="bg-[#f8f9ff] border border-[#d3e4fe] rounded-xl p-[23px] opacity-80">
            <div className="flex flex-col">
              <div className="flex items-start justify-between pb-[22px]">
                <div className="inline-flex items-center gap-[5.5px] rounded-full bg-[#d3e4fe] px-[11px] py-[5.5px]">
                  <span className="material-symbols-outlined text-[#464555] text-[14px]" aria-hidden>
                    check_circle
                  </span>
                  <span className="font-['Inter'] text-[13px] font-medium text-[#464555] tracking-[0.26px]">Completed</span>
                </div>
                <TripCardMenu />
              </div>
              <div className="flex flex-col gap-[5.5px] pb-[11px]">
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                  Banff National Park
                </h2>
                <div className="flex items-center gap-[5.5px] text-[#464555]">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden>
                    calendar_month
                  </span>
                  <span className="font-['Inter'] text-[16px] leading-6">Aug 05 - Aug 12, 2024</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 4 — Skeleton */}
          <div className="bg-white border border-[#d3e4fe] rounded-xl p-[23px] shadow-[0_4px_5.5px_rgba(53,37,205,0.02)] animate-pulse">
            <div className="flex items-start justify-between pb-[22px]">
              <div className="h-[26px] w-[100px] rounded-full bg-[#d3e4fe]" />
              <div className="size-6 rounded-full bg-[#d3e4fe]" />
            </div>
            <div className="pt-[11px] flex flex-col gap-[5.5px]">
              <div className="h-7 w-[225px] max-w-full rounded-md bg-[#d3e4fe]" />
              <div className="h-5 w-[150px] rounded-md bg-[#d3e4fe]" />
              <div className="flex gap-[5.5px] pt-4">
                <div className="h-[22px] w-[60px] rounded-md bg-[#d3e4fe]" />
                <div className="h-[22px] w-[50px] rounded-md bg-[#d3e4fe]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Link
        to="/create"
        className="md:hidden fixed z-[3] right-[22px] bottom-[110px] size-14 rounded-2xl bg-[#4f46e5] shadow-[0_8px_11px_rgba(53,37,205,0.2)] flex items-center justify-center text-white hover:opacity-95 active:scale-95 transition-transform"
        aria-label="Create new trip"
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden>
          add
        </span>
      </Link>

      <BottomNav />
    </div>
  );
};

export default MyTrips;
