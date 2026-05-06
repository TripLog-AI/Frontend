// src/pages/MyTrips.jsx — Triple 톤 mock UI (mock 직접 도안 없음 — 일관 톤 적용)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchMyItineraries, deleteItinerary } from '../api/itineraries';
import { cityPhotoUrl } from '../utils/cityPhotos';

// 라이프사이클: status=DRAFT → 임시저장. status=ACTIVE 는 today vs 날짜로 sub-status 계산.
function tripStatus(trip) {
  if (trip.status === 'DRAFT' || !trip.startDate || !trip.endDate) return 'draft';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (today > end) return 'completed';
  if (today >= start && today <= end) return 'active';
  return 'upcoming';
}

const STATUS = {
  draft: { label: '임시저장', emoji: '📝' },
  active: { label: '여행 중', emoji: '📍' },
  upcoming: { label: '다가오는 여행', emoji: '✈️' },
  completed: { label: '다녀온 여행', emoji: '✓' },
};

const SECTIONS = [
  { key: 'upcoming', title: '다가오는 여행', empty: '다가오는 여행이 없어요.' },
  { key: 'active', title: '여행 중', empty: null },
  { key: 'completed', title: '다녀온 여행', empty: null },
  { key: 'draft', title: '임시저장 (담기 전)', empty: null },
];

function formatRange(start, end) {
  if (!start || !end) return '';
  const opt = { month: 'short', day: '2-digit' };
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString('en-US', opt)} – ${e.toLocaleDateString('en-US', opt)}, ${e.getFullYear()}`;
}

function parseThemes(themes) {
  if (Array.isArray(themes)) return themes;
  if (typeof themes === 'string' && themes.length > 0) {
    return themes.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyItineraries({ size: 30 });
        if (cancelled) return;
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

  const handleDelete = async (e, tripId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    setDeletingId(tripId);
    try {
      await deleteItinerary(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      alert(err.message || '삭제 실패');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
            <span className="dot" />
            TripLog<span style={{ color: 'var(--accent)', marginLeft: 2 }}>AI</span>
          </Link>
          <div style={{ flex: 1 }} />
          <button className="header-btn" type="button" aria-label="검색">🔍</button>
        </header>

        <main className="main">
          <h1 className="title" style={{ fontSize: 26 }}>My Trips</h1>
          <p className="subtitle">내 여행 일정과 다가오는 모험</p>

          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {error && !loading && <div className="error-box">{error}</div>}

          {!loading && !error && trips.length === 0 && (
            <div className="empty">
              <div className="ico">📔</div>
              <p>아직 일정이 없어요.</p>
              <Link
                to="/create"
                className="btn primary sm"
                style={{
                  marginTop: 12,
                  width: 200,
                  marginInline: 'auto',
                  textDecoration: 'none',
                }}
              >
                ✨ AI 일정 만들기
              </Link>
            </div>
          )}

          {/* 라이프사이클 sub-status 별 section 분리 */}
          {!loading && !error && trips.length > 0 && (() => {
            const grouped = trips.reduce((acc, trip) => {
              const s = tripStatus(trip);
              (acc[s] = acc[s] || []).push(trip);
              return acc;
            }, {});
            return SECTIONS.map((section) => {
              const list = grouped[section.key] || [];
              if (list.length === 0) return null;
              return (
                <div key={section.key} style={{ marginBottom: 22 }}>
                  <h2 className="section-title" style={{ marginTop: 0 }}>{section.title}</h2>
                  {list.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      status={section.key}
                      deletingId={deletingId}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              );
            });
          })()}

          <div style={{ height: 80 }} />
        </main>

        {/* FAB */}
        <Link
          to="/create"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 100,
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            textDecoration: 'none',
            boxShadow: '0 8px 18px rgba(93,168,197,0.4)',
            zIndex: 25,
          }}
          aria-label="새 일정"
        >
          +
        </Link>

        <BottomNav />
      </div>
    </div>
  );
};

const TripCard = ({ trip, status, deletingId, onDelete }) => {
  const meta = STATUS[status];
  const themes = parseThemes(trip.themes);
  const cover = cityPhotoUrl(trip.city);
  return (
    <Link
      to={`/trips/${trip.id}`}
      className={`trip-card${status === 'active' ? ' active' : ''}${
        status === 'completed' ? ' completed' : ''
      }`}
    >
      <div
        className="trip-cover"
        style={
          cover
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%), url('${cover}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
              }
            : undefined
        }
      >
        <span className={`trip-status ${status}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>
        {trip.title || trip.city || '여행 일정'}
      </h3>
      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
        {trip.startDate && trip.endDate
          ? `📅 ${formatRange(trip.startDate, trip.endDate)}`
          : '📅 날짜 미정 — 담기 전'}
      </div>
      {themes.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {themes.slice(0, 4).map((t) => (
            <span key={t} className="chip gray">{t}</span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => onDelete(e, trip.id)}
        disabled={deletingId === trip.id}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: 0,
          background: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
          fontSize: 14,
          color: 'var(--text-mute)',
        }}
        aria-label="삭제"
      >
        ⋯
      </button>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="trip-card" style={{ pointerEvents: 'none' }}>
    <div className="trip-cover" />
    <div
      style={{
        height: 18,
        width: '60%',
        background: 'var(--bg-soft)',
        borderRadius: 6,
        marginBottom: 8,
      }}
    />
    <div
      style={{
        height: 14,
        width: '40%',
        background: 'var(--bg-soft)',
        borderRadius: 6,
      }}
    />
  </div>
);

export default MyTrips;
