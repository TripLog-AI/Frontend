// src/pages/MyTrips.jsx — Figma node 1:10253 + BE itineraries 연동
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchMyItineraries, deleteItinerary } from '../api/itineraries';

const TripCardMenu = ({ open, onToggle, onDelete }) => {
  const menuRef = useRef(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onToggle(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onToggle]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="flex items-center justify-center p-[5.5px] rounded-lg text-[#464555] hover:bg-slate-100/80"
        aria-label="More options"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(!open);
        }}
      >
        <span className="material-symbols-outlined text-[18px] text-[#94a3b8]" aria-hidden>
          more_horiz
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 w-32 bg-white border border-[#e2e8f0] rounded-lg shadow-lg overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-2.5 text-left font-['Inter'] text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              onToggle(false);
            }}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              delete
            </span>
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

function tripStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'upcoming';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today > end) return 'completed';
  if (today >= start && today <= end) return 'active';
  return 'upcoming';
}

function formatRange(start, end) {
  if (!start || !end) return '';
  const opt = { month: 'short', day: '2-digit' };
  const s = new Date(start);
  const e = new Date(end);
  const year = e.getFullYear();
  return `${s.toLocaleDateString('en-US', opt)} - ${e.toLocaleDateString('en-US', opt)}, ${year}`;
}

function parseThemes(themes) {
  if (Array.isArray(themes)) return themes;
  if (typeof themes === 'string' && themes.length > 0) {
    return themes.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

const STATUS_BADGE = {
  upcoming: {
    bg: 'bg-[#c9e6ff]',
    text: 'text-[#001e2f]',
    icon: 'flight',
    label: 'Upcoming',
  },
  active: {
    bg: 'bg-[#4f46e5]',
    text: 'text-white',
    icon: 'location_on',
    label: 'Active Now',
  },
  completed: {
    bg: 'bg-[#d3e4fe]',
    text: 'text-[#464555]',
    icon: 'check_circle',
    label: 'Completed',
  },
};

const TripCard = ({ trip, menuOpen, onMenuToggle, onDelete }) => {
  const status = tripStatus(trip.startDate, trip.endDate);
  const badge = STATUS_BADGE[status];
  const themes = parseThemes(trip.themes);
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const wrapClass = isActive
    ? 'bg-white border border-[#c3c0ff] rounded-xl p-[23px] shadow-[0_0_0_1px_#4f46e5,0_4px_11px_rgba(53,37,205,0.02)] relative overflow-hidden block w-full text-left'
    : isCompleted
    ? 'bg-[#f8f9ff] border border-[#d3e4fe] rounded-xl p-[23px] opacity-80 block w-full text-left'
    : 'relative overflow-hidden bg-white border border-[#d3e4fe] rounded-xl p-[23px] shadow-[0_4px_11px_rgba(53,37,205,0.02)] block w-full text-left';

  return (
    <Link to={`/trips/${trip.id}`} className={wrapClass}>
      {!isActive && !isCompleted && (
        <div
          className="absolute h-[120px] left-0 right-0 top-0 pointer-events-none rounded-t-xl"
          style={{
            backgroundImage:
              'linear-gradient(160.77deg, rgba(195, 192, 255, 0.3) 0%, rgb(255, 255, 255) 100%)',
          }}
          aria-hidden
        />
      )}
      <div className="relative flex flex-col">
        <div className="flex items-start justify-between pb-[22px]">
          <div className={`inline-flex items-center gap-[5.5px] rounded-full ${badge.bg} px-[11px] py-[5.5px]`}>
            <span
              className={`material-symbols-outlined ${badge.text} text-[14px]`}
              aria-hidden
            >
              {badge.icon}
            </span>
            <span className={`font-['Inter'] text-[13px] font-medium ${badge.text} tracking-[0.26px]`}>
              {badge.label}
            </span>
          </div>
          <TripCardMenu open={menuOpen} onToggle={onMenuToggle} onDelete={onDelete} />
        </div>
        <div className="relative flex flex-col gap-[5.5px]">
          <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-[#0b1c30]">
            {trip.title || `${trip.city || 'Trip'}`}
          </h2>
          <div className="flex items-center gap-[5.5px] text-[#464555]">
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              calendar_month
            </span>
            <span className="font-['Inter'] text-[16px] leading-6">
              {formatRange(trip.startDate, trip.endDate)}
            </span>
          </div>
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-[5.5px] pt-4">
              {themes.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#d3e4fe] px-[11px] py-0.5 font-['Inter'] text-[11px] text-[#464555] leading-[16.5px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const Skeleton = () => (
  <div className="bg-white border border-[#d3e4fe] rounded-xl p-[23px] shadow-[0_4px_5.5px_rgba(53,37,205,0.02)] animate-pulse">
    <div className="flex items-start justify-between pb-[22px]">
      <div className="h-[26px] w-[100px] rounded-full bg-[#d3e4fe]" />
      <div className="size-6 rounded-full bg-[#d3e4fe]" />
    </div>
    <div className="pt-[11px] flex flex-col gap-[5.5px]">
      <div className="h-7 w-[225px] max-w-full rounded-md bg-[#d3e4fe]" />
      <div className="h-5 w-[150px] rounded-md bg-[#d3e4fe]" />
    </div>
  </div>
);

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (tripId) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    setDeletingId(tripId);
    try {
      await deleteItinerary(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyItineraries({ size: 30 });
        if (cancelled) return;
        // BE는 list endpoint가 array 또는 { items, nextCursor } 형태 둘 다 가능 — defensive
        const list = Array.isArray(data) ? data : data?.items || [];
        setTrips(list);
      } catch (err) {
        if (!cancelled) setError(err.message || '일정을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          <Link to="/" className="flex items-center gap-[11px] -ml-2 p-2 rounded-lg hover:bg-slate-50/80" aria-label="홈으로">
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
          </Link>
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
          {loading && (
            <>
              <Skeleton />
              <Skeleton />
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center font-['Inter'] text-[14px] text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div className="bg-white border border-[#d3e4fe] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-[#94a3b8] text-[48px]" aria-hidden>
                travel_explore
              </span>
              <h3 className="mt-3 font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-[#0b1c30]">
                아직 일정이 없습니다
              </h3>
              <p className="mt-1 font-['Inter'] text-[14px] text-[#464555]">
                AI로 첫 여행 일정을 만들어보세요.
              </p>
              <Link
                to="/create"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4f46e5] text-white font-['Inter'] text-[14px] font-semibold hover:bg-[#3525cd] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  auto_awesome
                </span>
                Create with AI
              </Link>
            </div>
          )}

          {!loading && !error && trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              menuOpen={openMenuId === trip.id}
              onMenuToggle={(open) => setOpenMenuId(open ? trip.id : null)}
              onDelete={() => handleDelete(trip.id)}
            />
          ))}
          {deletingId && (
            <div className="text-center font-['Inter'] text-[13px] text-[#94a3b8]">삭제 중...</div>
          )}
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
