// src/pages/ViewTrip.jsx — Figma node 1:10116 + BE itinerary fetch + swap
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchItineraryById, swapAlternative } from '../api/itineraries';

const CATEGORY_BADGE = {
  ATTRACTION: { label: 'SIGHTSEEING', bg: '#c9e6ff', text: '#001e2f' },
  RESTAURANT: { label: 'DINING', bg: '#ffb95f', text: '#653e00' },
  CAFE: { label: 'CAFE', bg: '#fde2c4', text: '#653e00' },
  ACCOMMODATION: { label: 'STAY', bg: '#d3e4fe', text: '#001e2f' },
  SHOPPING: { label: 'SHOPPING', bg: '#e9d5ff', text: '#4a1d96' },
  OTHER: { label: 'EXPLORE', bg: '#89ceff', text: '#004c6e' },
};

function badgeFor(category) {
  return CATEGORY_BADGE[category] || CATEGORY_BADGE.OTHER;
}

// Triple 모티브 — 시간 표시 X. timeCategory를 한글 라벨로.
const TIME_CATEGORY_LABEL = {
  BREAKFAST: { emoji: '🌅', label: '아침' },
  MORNING: { emoji: '☀️', label: '오전' },
  LUNCH: { emoji: '🍱', label: '점심' },
  AFTERNOON: { emoji: '🌤️', label: '오후' },
  DINNER: { emoji: '🍽️', label: '저녁' },
  NIGHT: { emoji: '🌙', label: '밤' },
};

function timeCategoryLabel(category) {
  return TIME_CATEGORY_LABEL[category] || { emoji: '📍', label: '장소' };
}

function formatDayLabel(dayNumber, startDate) {
  if (!startDate) return { short: `DAY ${dayNumber}`, date: '' };
  const start = new Date(startDate);
  const d = new Date(start);
  d.setDate(d.getDate() + (dayNumber - 1));
  return {
    short: `DAY ${dayNumber}`,
    date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
  };
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const s = new Date(startDate);
  const e = new Date(endDate);
  const opt = { month: 'short', day: '2-digit' };
  return `${s.toLocaleDateString('en-US', opt)} - ${e.toLocaleDateString('en-US', opt)}, ${e.getFullYear()}`;
}

const SlotCard = ({ slot, dayId, itineraryId, onSwapped }) => {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const place = slot.place || {};
  const alternatives = slot.alternatives || [];
  const badge = badgeFor(place.category);

  const handleSwap = async (alternativeId) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await swapAlternative(itineraryId, dayId, slot.id, alternativeId);
      setExpanded(false);
      if (onSwapped) await onSwapped();
    } catch (err) {
      setError(err.message || 'Swap 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="relative">
      <span
        className="absolute -left-[31px] top-1 size-[22px] rounded-full border-4 border-[#f8f9ff] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-[#3525cd]"
        aria-hidden
      />
      <div className="flex flex-col gap-[5.5px]">
        <div className="flex items-start justify-between gap-2 min-h-[33.5px]">
          <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] leading-7 text-[#464555] flex items-center gap-1.5">
            <span className="text-[20px]" aria-hidden>{timeCategoryLabel(slot.timeCategory).emoji}</span>
            <span>{timeCategoryLabel(slot.timeCategory).label}</span>
          </span>
          <span
            className="shrink-0 rounded px-2 py-1 font-['Inter'] text-[11px] font-medium uppercase tracking-[0.275px] leading-[16.5px]"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        </div>

        <div className="bg-white border border-[#c7c4d8] rounded-lg p-[23px] flex flex-col gap-[22px] shadow-[0_4px_5.5px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-1">
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
              {place.name || 'Unknown Place'}
            </h3>
            {place.nameLocal && place.nameLocal !== place.name && (
              <p className="font-['Inter'] text-[13px] text-[#777587]">{place.nameLocal}</p>
            )}
            {slot.recommendation && (
              <div className="mt-2 bg-[rgba(195,192,255,0.15)] border-l-2 border-[#4f46e5] rounded-r px-3 py-2">
                <span className="material-symbols-outlined text-[#4f46e5] text-[14px] mr-1 align-middle" aria-hidden>
                  auto_awesome
                </span>
                <span className="font-['Inter'] text-[13px] text-[#3525cd] leading-5 align-middle">
                  {slot.recommendation}
                </span>
              </div>
            )}
            {place.address && (
              <p className="font-['Inter'] text-[14px] text-[#464555] leading-6 pt-1">
                {place.address}
              </p>
            )}
            {slot.stayDurationMinutes ? (
              <div className="flex items-center gap-1 pt-1 text-[#464555]">
                <span className="material-symbols-outlined text-[15px]" aria-hidden>
                  schedule
                </span>
                <span className="font-['Inter'] text-[13px]">
                  {Math.floor(slot.stayDurationMinutes / 60) > 0
                    ? `${Math.floor(slot.stayDurationMinutes / 60)}h `
                    : ''}
                  {slot.stayDurationMinutes % 60}m stay
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 justify-center">
            {place.latitude && place.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.googlePlaceQuery || place.name || `${place.latitude},${place.longitude}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md bg-[#dce9ff] border border-[#c7c4d8] py-[9px] font-['Inter'] text-[13px] font-medium text-[#0b1c30] tracking-[0.26px] hover:bg-[#cbdbf5] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]" aria-hidden>
                  near_me
                </span>
                Directions
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              disabled={alternatives.length === 0}
              className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md bg-[#3525cd] text-white py-[9px] shadow-[0_1px_1px_rgba(0,0,0,0.05)] font-['Inter'] text-[13px] font-medium tracking-[0.26px] hover:bg-[#2818b3] disabled:bg-[#c7c4d8] disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden>
                swap_horiz
              </span>
              {expanded ? 'Cancel' : 'Swap'}
            </button>
          </div>

          {expanded && (
            <div className="border-t border-[#e2e8f0] pt-[22px] flex flex-col gap-3">
              <p className="font-['Inter'] text-[13px] text-[#464555]">
                마음에 드는 대안을 선택하세요
              </p>
              {alternatives.map((alt) => {
                const altPlace = alt.place || {};
                const altBadge = badgeFor(altPlace.category);
                return (
                  <button
                    key={alt.id}
                    type="button"
                    disabled={busy}
                    onClick={() => handleSwap(alt.id)}
                    className="text-left bg-[#f8f9ff] border border-[#c7c4d8] rounded-lg p-3 hover:border-[#4f46e5] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-[15px] text-[#0b1c30] leading-tight">
                        {altPlace.name || 'Alternative'}
                      </h4>
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 font-['Inter'] text-[10px] font-medium uppercase tracking-[0.25px]"
                        style={{ backgroundColor: altBadge.bg, color: altBadge.text }}
                      >
                        {altBadge.label}
                      </span>
                    </div>
                    {altPlace.address && (
                      <p className="font-['Inter'] text-[12px] text-[#464555] leading-5 mt-1">
                        {altPlace.address}
                      </p>
                    )}
                  </button>
                );
              })}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 font-['Inter'] text-[12px] text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const ViewTrip = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await fetchItineraryById(id);
      setItinerary(data);
    } catch (err) {
      setError(err.message || '일정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const dayTabs = useMemo(() => {
    if (!itinerary?.days) return [];
    return itinerary.days.map((d) => ({
      id: d.dayNumber,
      ...formatDayLabel(d.dayNumber, itinerary.startDate),
    }));
  }, [itinerary]);

  const activeSlots = useMemo(() => {
    if (!itinerary?.days) return [];
    const day = itinerary.days.find((d) => d.dayNumber === activeDay);
    return day ? { slots: day.slots || [], dayId: day.id } : { slots: [], dayId: null };
  }, [itinerary, activeDay]);

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
        {loading && (
          <div className="text-center py-12 font-['Inter'] text-[14px] text-[#464555]">
            일정을 불러오는 중...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center font-['Inter'] text-[14px] text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && itinerary && (
          <>
            <section className="flex flex-col gap-[5.5px] w-full">
              <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] leading-10 tracking-[-0.32px] text-[#0b1c30]">
                {itinerary.title || `${itinerary.city || 'Trip'}`}
              </h1>
              <div className="flex gap-1 items-center text-[#464555]">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  calendar_month
                </span>
                <span className="font-['Inter'] text-[16px] leading-6">
                  {formatDateRange(itinerary.startDate, itinerary.endDate)}
                </span>
              </div>
            </section>

            <div className="flex gap-[11px] overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 snap-x snap-mandatory min-h-[67px]">
              {dayTabs.map((d) => {
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

            {activeSlots.slots.length > 0 ? (
              <div className="relative border-l-2 border-[#c7c4d8] pl-6 ml-3 flex flex-col gap-11 w-[calc(100%-12px)] max-w-full">
                {activeSlots.slots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    dayId={activeSlots.dayId}
                    itineraryId={itinerary.id}
                    onSwapped={load}
                  />
                ))}
              </div>
            ) : (
              <p className="font-['Inter'] text-[16px] text-[#464555] leading-6 pl-1">
                Day {activeDay}의 일정이 비어 있습니다.
              </p>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ViewTrip;
