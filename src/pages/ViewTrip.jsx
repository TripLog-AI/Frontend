// src/pages/ViewTrip.jsx — Figma node 1:10116 TripLog AI - View Trip (Tokyo)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const imgSkytree =
  'https://www.figma.com/api/mcp/asset/9ed9823c-6b79-4d5a-966e-2dcafccbfb7a';
const imgAiSparkle =
  'https://www.figma.com/api/mcp/asset/1b8dbec1-6081-4998-8f03-eeb814a2ce68';

const days = [
  { id: 1, short: 'DAY 1', date: 'Oct 12' },
  { id: 2, short: 'DAY 2', date: 'Oct 13' },
  { id: 3, short: 'DAY 3', date: 'Oct 14' },
  { id: 4, short: 'DAY 4', date: 'Oct 15' },
];

const timelineForDay1 = [
  {
    time: '09:00 AM',
    category: { label: 'CULTURE', bg: '#89ceff', text: '#004c6e' },
    title: 'Senso-ji Temple',
    description: [
      "Tokyo's oldest temple. Explore",
      'Nakamise shopping street before',
      'reaching the main hall.',
    ],
    image: null,
    primaryAction: { label: 'Directions', icon: 'near_me' },
    dotActive: true,
  },
  {
    time: '12:30 PM',
    category: { label: 'DINING', bg: '#ffb95f', text: '#653e00' },
    title: 'Lunch at Asakusa Imahan',
    description: [
      'Famous for Sukiyaki. Highly',
      'recommended for a traditional',
      'dining experience.',
    ],
    image: null,
    primaryAction: { label: 'Details', icon: 'restaurant' },
    dotActive: false,
  },
  {
    time: '03:00 PM',
    category: { label: 'SIGHTSEEING', bg: '#c9e6ff', text: '#001e2f' },
    title: 'Tokyo Skytree',
    description: [
      'Enjoy panoramic views of the city.',
      'Consider booking tickets in',
      'advance.',
    ],
    image: imgSkytree,
    primaryAction: { label: 'Tickets', icon: 'confirmation_number' },
    dotActive: false,
  },
];

const ViewTrip = () => {
  const [activeDay, setActiveDay] = useState(1);

  return (
    <div className="bg-white text-on-background font-body-md min-h-screen pb-[100px] pt-[44px] selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 w-full z-[2] backdrop-blur-[6px] bg-white/90 border-b border-[#e2e8f0] shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-w-xl mx-auto left-0 right-0">
        <div className="flex items-center h-11 px-6 max-w-xl mx-auto w-full">
          <Link
            to="/trips"
            className="flex items-center gap-2 text-primary-container -ml-2 p-2 rounded-lg hover:bg-slate-50/80"
            aria-label="Back to My Trips"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              arrow_back
            </span>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] leading-7 tracking-tight text-[#3525cd]">
              TripLog AI
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full px-4 pt-[22px] flex flex-col gap-11 z-[1]">
        <section className="flex flex-col gap-[5.5px] w-full">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] leading-10 tracking-[-0.32px] text-[#0b1c30]">
            Tokyo Exploration
          </h1>
          <div className="flex gap-1 items-center text-[#464555]">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              calendar_month
            </span>
            <span className="font-['Inter'] text-[16px] leading-6">Oct 12 - Oct 18, 2024</span>
          </div>
        </section>

        <div className="flex gap-[11px] overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 snap-x snap-mandatory min-h-[67px]">
          {days.map((d) => {
            const isActive = activeDay === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDay(d.id)}
                className={`snap-start shrink-0 min-w-[88px] rounded-lg px-[22px] py-[6.5px] flex flex-col items-center justify-center transition-shadow ${
                  isActive
                    ? 'bg-[#3525cd] text-white shadow-[0_4px_5.5px_rgba(53,37,205,0.2)]'
                    : 'bg-[#e5eeff] border border-[#c7c4d8] text-[#0b1c30]'
                }`}
              >
                <span
                  className={`font-['Inter'] text-[13px] font-medium uppercase tracking-[0.65px] ${
                    isActive ? 'text-white/80' : 'text-[#0b1c30] opacity-60'
                  }`}
                >
                  {d.short}
                </span>
                <span
                  className={`font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 ${
                    isActive ? 'text-white' : 'text-[#0b1c30] opacity-80'
                  }`}
                >
                  {d.date}
                </span>
              </button>
            );
          })}
        </div>

        <section
          className="rounded-xl border border-[#c3c0ff] p-[23px] flex gap-[22px] items-start shadow-[0_4px_5.5px_rgba(53,37,205,0.05)] w-full"
          style={{
            backgroundImage:
              'linear-gradient(157.27deg, rgb(248, 249, 255) 0%, rgba(226, 223, 255, 0.2) 100%)',
          }}
        >
          <div className="h-[26px] w-[22px] shrink-0 relative">
            <img alt="" className="absolute inset-0 w-full h-full object-contain" src={imgAiSparkle} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
              AI Insight
            </h2>
            <p className="font-['Inter'] text-[16px] text-[#464555] leading-6">
              It might rain lightly in the afternoon. Consider moving your Meiji Shrine visit to the morning.
            </p>
          </div>
        </section>

        {activeDay === 1 ? (
          <div className="relative border-l-2 border-[#c7c4d8] pl-6 ml-3 flex flex-col gap-11 w-[calc(100%-12px)] max-w-full">
            {timelineForDay1.map((slot, index) => (
              <article key={index} className="relative">
              <span
                className={`absolute -left-[31px] top-1 size-[22px] rounded-full border-4 border-[#f8f9ff] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                  slot.dotActive ? 'bg-[#3525cd]' : 'bg-[#c7c4d8]'
                }`}
                aria-hidden
              />

              <div className="flex flex-col gap-[5.5px]">
                <div className="flex items-start justify-between gap-2 min-h-[33.5px]">
                  <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                    {slot.time}
                  </span>
                  <span
                    className="shrink-0 rounded px-2 py-1 font-['Inter'] text-[11px] font-medium uppercase tracking-[0.275px] leading-[16.5px]"
                    style={{ backgroundColor: slot.category.bg, color: slot.category.text }}
                  >
                    {slot.category.label}
                  </span>
                </div>

                <div className="bg-white border border-[#c7c4d8] rounded-lg p-[23px] flex flex-col gap-[22px] shadow-[0_4px_5.5px_rgba(0,0,0,0.02)]">
                  {slot.image ? (
                    <div className="rounded-md overflow-hidden h-[120px] w-full">
                      <img
                        alt=""
                        className="w-full h-[230%] max-w-none object-cover -translate-y-[28%]"
                        src={slot.image}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-1">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
                      {slot.title}
                    </h3>
                    <div className="font-['Inter'] text-[16px] text-[#464555] leading-6">
                      {slot.description.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md bg-[#dce9ff] border border-[#c7c4d8] py-[9px] font-['Inter'] text-[13px] font-medium text-[#0b1c30] tracking-[0.26px]"
                    >
                      <span className="material-symbols-outlined text-[15px]" aria-hidden>
                        {slot.primaryAction.icon}
                      </span>
                      {slot.primaryAction.label}
                    </button>
                    <button
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md bg-[#3525cd] text-white py-[9px] shadow-[0_1px_1px_rgba(0,0,0,0.05)] font-['Inter'] text-[13px] font-medium tracking-[0.26px]"
                    >
                      <span className="material-symbols-outlined text-[15px]" aria-hidden>
                        swap_horiz
                      </span>
                      Swap
                    </button>
                  </div>
                </div>
              </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="font-['Inter'] text-[16px] text-[#464555] leading-6 pl-1">
            Detailed hourly plans for Day {activeDay} will appear here once you expand your itinerary.
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ViewTrip;
