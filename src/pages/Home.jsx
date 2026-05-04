// src/pages/Home.jsx — Figma node 1:10372 TripLog AI - Home (Dynamic)
import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const imgUserProfile =
  'https://www.figma.com/api/mcp/asset/97f9232d-9e3a-4c78-a5dc-ff88c9ca4faf';
const imgHeroSection =
  'https://www.figma.com/api/mcp/asset/8ba68486-425f-4eff-9fdf-e5b02f2b3858';
const imgKyotoTemples =
  'https://www.figma.com/api/mcp/asset/84b559e4-0d54-4a33-9ff8-f8ff3924e3f3';
const imgCreator =
  'https://www.figma.com/api/mcp/asset/c764c83b-3010-49d6-bf32-a33a96ec5cd8';
const imgLondonStreets =
  'https://www.figma.com/api/mcp/asset/2baeab70-23b9-4ba7-9a80-ba63b17ee342';
const imgCreator1 =
  'https://www.figma.com/api/mcp/asset/0b33101f-4857-4db8-acb0-8175ec42fd57';
const imgDubaiSkyline =
  'https://www.figma.com/api/mcp/asset/e270eb9c-3868-4172-94c8-fff30a301f18';
const imgCreator2 =
  'https://www.figma.com/api/mcp/asset/e26e2535-6897-4811-a1b1-c7aa508c4ee0';

const guides = [
  {
    image: imgKyotoTemples,
    duration: '12:45',
    title: ['The Ultimate Kyoto Autumn', 'Itinerary: Hidden Gems &…'],
    description: [
      'Avoid the crowds with this carefully',
      `curated 3-day guide to Kyoto's most…`,
    ],
    creator: imgCreator,
    creatorName: 'WanderLust Japan',
    views: '124k views',
    link: '/trip',
  },
  {
    image: imgLondonStreets,
    duration: '08:20',
    title: ['London on a Budget: 48', 'Hours in the City'],
    description: [
      'Discover free museums, affordable',
      'eats, and the best walking routes to see',
    ],
    creator: imgCreator1,
    creatorName: 'Budget Backpacker',
    views: '89k views',
    link: '/trip',
  },
  {
    image: imgDubaiSkyline,
    duration: '15:10',
    title: ['Dubai Luxury Guide: Top', 'Restaurants & Experiences'],
    description: [
      `A comprehensive tour of Dubai's most`,
      'exclusive dining spots, desert safaris,…',
    ],
    creator: imgCreator2,
    creatorName: 'Luxe Travel Vibes',
    views: '210k views',
    link: '/trip',
  },
];

const GuideCard = ({ item, as: Comp = 'div', to }) => {
  const inner = (
    <>
      <div className="relative h-[220px] w-full overflow-hidden">
        <img
          alt=""
          className="absolute w-full h-[158%] max-w-none left-0 top-[-29%] object-cover"
          src={item.image}
        />
        <div className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 flex items-center gap-1 rounded-md px-2 py-1">
          <span className="material-symbols-outlined text-on-surface text-sm" aria-hidden>
            play_circle
          </span>
          <span className="font-['Inter'] text-[13px] font-medium text-on-surface tracking-wide">
            {item.duration}
          </span>
        </div>
      </div>
      <div className="p-[22px] flex flex-col gap-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-on-surface">
          {item.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>
        <div className="font-['Inter'] text-body-md text-on-surface-variant leading-6">
          {item.description.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-surface-variant overflow-hidden shrink-0">
              <img alt="" className="w-full h-full object-cover" src={item.creator} />
            </div>
            <span className="font-['Inter'] text-[13px] font-medium text-on-surface-variant tracking-wide truncate">
              {item.creatorName}
            </span>
          </div>
          <span className="font-['Inter'] text-[13px] font-medium text-[#777587] tracking-wide shrink-0">
            {item.views}
          </span>
        </div>
      </div>
    </>
  );

  const wrapClass =
    'bg-white border border-outline-variant rounded-lg shadow-[0_4px_11px_rgba(53,37,205,0.02)] overflow-hidden block w-full text-left';

  if (Comp === Link && to) {
    return (
      <Link to={to} className={wrapClass}>
        {inner}
      </Link>
    );
  }
  return <article className={wrapClass}>{inner}</article>;
};

const Home = () => {
  const heroBg = `linear-gradient(180deg, rgba(248, 249, 255, 0.8) 0%, rgba(248, 249, 255, 0.9) 100%), url(${imgHeroSection}), linear-gradient(90deg, rgb(220, 233, 255) 0%, rgb(220, 233, 255) 100%)`;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pt-[44px] pb-[88px] selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 w-full z-[2] backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm flex items-center justify-between px-5 py-3 max-w-xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 p-2 rounded-lg">
          <span
            className="material-symbols-outlined text-primary-container text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            travel_explore
          </span>
          <span className="font-['Inter'] font-bold text-[20px] leading-7 tracking-tight text-primary-container">
            TripLog AI
          </span>
        </div>
        <div className="size-10 rounded-full border border-outline-variant overflow-hidden bg-surface-variant shrink-0">
          <img alt="" className="w-full h-full object-cover" src={imgUserProfile} />
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full px-5 pt-8 pb-12 flex flex-col gap-12 z-[1]">
        <section
          className="relative flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-outline-variant shadow-sm p-8 overflow-hidden"
          style={{ backgroundImage: heroBg, backgroundSize: 'auto, cover, auto', backgroundPosition: 'center, center, center' }}
        >
          <div className="relative z-[1] flex flex-col items-center w-full">
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[44px] leading-[52px] tracking-[-0.88px] text-on-surface text-center pb-4">
              <span className="block">Discover Your</span>
              <span className="block">Next Journey</span>
            </h1>
            <p className="font-['Inter'] text-[18px] text-on-surface-variant text-center leading-7 max-w-[280px] pb-8">
              Let AI craft your perfect itinerary
              <br />
              or explore trending travel
              <br />
              courses curated just for you.
            </p>

            <div className="relative w-full max-w-xl bg-white border border-outline-variant rounded-lg shadow-sm">
              <div className="flex items-stretch min-h-[66px] pr-[120px]">
                <span
                  className="material-symbols-outlined text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 text-lg"
                  aria-hidden
                >
                  search
                </span>
                <input
                  type="search"
                  placeholder="Where do you want to go?"
                  className="w-full rounded-lg bg-transparent border-none pl-12 pr-4 py-5 font-['Inter'] text-body-md text-on-surface placeholder:text-[#777587] outline-none focus:ring-0"
                />
              </div>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-11 px-6 rounded-md bg-primary text-white font-['Inter'] text-[13px] font-medium tracking-wide hover:opacity-95"
              >
                Search
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#e2dfff] bg-gradient-to-r from-[rgba(226,223,255,0.3)] to-surface-container-high p-6 flex gap-4 items-start">
          <div className="size-11 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-white text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              auto_awesome
            </span>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-on-surface">
              AI Travel Insights
            </h2>
            <p className="font-['Inter'] text-body-md text-on-surface-variant leading-6">
              Based on your recent searches, autumn is the perfect time to visit Kyoto. Prices are currently dropping by 15% for
              November flights.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container text-on-secondary-container px-3 py-1.5 font-['Inter'] text-[13px] font-medium tracking-wide">
                <span className="material-symbols-outlined text-sm" aria-hidden>
                  flight
                </span>
                Flight Deals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#885500] text-[#ffd4a4] px-3 py-1.5 font-['Inter'] text-[13px] font-medium tracking-wide">
                <span className="material-symbols-outlined text-sm" aria-hidden>
                  calendar_month
                </span>
                Nov 12–18
              </span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] leading-10 tracking-[-0.32px] text-on-surface">
              <span className="block">Trending Travel</span>
              <span className="block">Guides</span>
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 font-['Inter'] text-[13px] font-medium text-primary tracking-wide shrink-0 pt-1"
            >
              <span className="flex flex-col items-end leading-[18px]">
                <span>View</span>
                <span>All</span>
              </span>
              <span className="material-symbols-outlined text-primary text-sm" aria-hidden>
                chevron_right
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {guides.map((g, i) => (
              <GuideCard key={i} item={g} as={i === 0 ? Link : 'article'} to={i === 0 ? g.link : undefined} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
