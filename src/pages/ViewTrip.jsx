// src/pages/ViewTrip.jsx — Triple 톤 mock UI 적용 (ui_mock/04_result_day1.html + 05 + 06)
// 일자 탭 + 지도 placeholder + 슬롯 카드 + inline swap (반경 후보 4개)
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import MapPlaceholder from '../components/MapPlaceholder';
import {
  fetchItineraryById,
  fetchNearbyCandidates,
  swapToPlace,
  saveToCalendar,
  addSlot,
  deleteSlot,
  reorderSlots,
} from '../api/itineraries';
import PlaceSearchModal from '../components/PlaceSearchModal';

const SWAPPABLE_CATEGORIES = new Set(['RESTAURANT', 'CAFE']);

const COMPANION_LABEL = {
  SOLO: '혼자',
  COUPLE: '연인과',
  FRIENDS: '친구와',
  FAMILY: '가족과',
  PARENTS: '부모님과',
};

const PACE_LABEL = {
  RELAXED: '널널하게',
  NORMAL: '보통',
  PACKED: '빼곡하게',
};

// 시간대 라벨 — 사용자 요청: "명확한 시간 표시 X, 일정 순서만 제공"
const TIME_CATEGORY = {
  BREAKFAST: { emoji: '🌅', label: '아침' },
  MORNING: { emoji: '☀️', label: '오전' },
  LUNCH: { emoji: '🍱', label: '점심' },
  AFTERNOON: { emoji: '🌤️', label: '오후' },
  DINNER: { emoji: '🍽️', label: '저녁' },
  NIGHT: { emoji: '🌙', label: '밤' },
};

function timeCategoryLabel(tc) {
  return TIME_CATEGORY[tc] || { emoji: '📍', label: '장소' };
}

// 장소 이름 키워드 → 이모지 (BE 카테고리 오인식 보정용 — "동남식물낙원"이 RESTAURANT 로 잡힌 케이스 등)
const NAME_EMOJI_RULES = [
  [/(식물원|botanic|botanical)/i, '🌿'],
  [/(공원|park|garden)/i, '🌳'],
  [/(해변|beach|바다)/i, '🏖️'],
  [/(박물관|museum)/i, '🏛️'],
  [/(미술관|gallery|art\s*museum)/i, '🎨'],
  [/(타워|tower)/i, '🗼'],
  [/(전망대|observation\s*deck|sky\s*deck)/i, '🌆'],
  [/(아쿠아리움|aquarium)/i, '🐠'],
  [/(동물원|zoo)/i, '🦒'],
  [/(놀이공원|amusement|theme\s*park)/i, '🎢'],
  [/(절|사찰|temple)/i, '🛕'],
  [/(신궁|신사|shrine)/i, '⛩️'],
  [/(성당|church|cathedral)/i, '⛪'],
  [/(시장|market\b)/i, '🛒'],
  [/(폭포|falls?)/i, '💦'],
  [/(산|mountain|peak)/i, '⛰️'],
  [/(케이블카|cable\s*car|gondola)/i, '🚠'],
];

function emojiFor(slot) {
  const cat = slot.place?.category;
  const tc = slot.timeCategory;
  const name = slot.place?.name || '';

  // 1) 이름 키워드 우선 — BE 카테고리가 OTHER/잘못 매핑 됐을 때 교정
  for (const [re, emo] of NAME_EMOJI_RULES) {
    if (re.test(name)) return emo;
  }

  // 2) 카테고리 fallback
  if (cat === 'CAFE') return '☕';
  if (cat === 'RESTAURANT') {
    if (tc === 'BREAKFAST') return '🥞';
    if (tc === 'LUNCH') return '🍱';
    if (tc === 'DINNER') return '🍣';
    return '🍴';
  }
  if (cat === 'ACCOMMODATION') return '🏨';
  if (cat === 'SHOPPING') return '🛍️';
  if (cat === 'ATTRACTION') {
    if (tc === 'NIGHT') return '🌃';
    return '🏛️';
  }
  return '📍';
}

function pinClassFor(slot, orderIndex) {
  const cat = slot.place?.category;
  if (cat === 'RESTAURANT' || cat === 'CAFE') return 'coral';
  if (cat === 'ACCOMMODATION') return 'teal';
  if (cat === 'SHOPPING') return 'purple';
  // attraction 기본 primary
  return orderIndex % 3 === 2 ? 'purple' : '';
}

// Haversine 직선거리 (km). lat/lng 가 string 이거나 BigDecimal 형태로 올 수도 있어 Number 보정.
function haversineKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every((v) => Number.isFinite(v))) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 도보 시간 추정: 직선거리 × 1.4 (도로/우회 보정) ÷ 4.5 km/h
function distanceLabel(prev, next) {
  if (!prev || !next) return null;
  const km = haversineKm(
    Number(prev.latitude),
    Number(prev.longitude),
    Number(next.latitude),
    Number(next.longitude),
  );
  if (km == null) return null;
  if (km < 0.05) return '같은 위치';
  const walkMin = Math.max(1, Math.round(((km * 1.4) / 4.5) * 60));
  if (km < 1) return `${Math.round(km * 1000)}m · 도보 ${walkMin}분`;
  return `${km.toFixed(1)}km · 도보 ${walkMin}분`;
}

function formatDateRange(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const opt = { month: 'short', day: '2-digit' };
  return `${s.toLocaleDateString('en-US', opt)} - ${e.toLocaleDateString('en-US', opt)}, ${e.getFullYear()}`;
}

function durationLabel(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.round((e - s) / 86400000) + 1;
  if (days <= 1) return '당일치기';
  return `${days - 1}박 ${days}일`;
}

const SlotCard = ({
  slot, dayId, itineraryId, onSwapped,
  isFirst = false, isLast = false, onMoveUp, onMoveDown, onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const place = slot.place || {};
  const swappable = SWAPPABLE_CATEGORIES.has(place.category);
  const tc = timeCategoryLabel(slot.timeCategory);
  const showImage = Boolean(place.thumbnailUrl) && !imgError;

  const handleToggle = async () => {
    if (busy) return;
    if (expanded) {
      setExpanded(false);
      setError(null);
      return;
    }
    setExpanded(true);
    setError(null);
    setLoadingCandidates(true);
    try {
      const data = await fetchNearbyCandidates(itineraryId, dayId, slot.id, { limit: 4 });
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '후보를 불러오지 못했습니다.');
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSelect = async (placeId) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await swapToPlace(itineraryId, dayId, slot.id, placeId);
      setExpanded(false);
      setCandidates([]);
      if (onSwapped) await onSwapped();
    } catch (err) {
      setError(err.message || 'Swap 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="slot">
        <div className={`slot-pin ${pinClassFor(slot, slot.orderIndex || 1)}`}>
          {slot.orderIndex || ''}
        </div>
        <div className="slot-thumb">
          {showImage ? (
            <img
              src={place.thumbnailUrl}
              alt={place.name || ''}
              onError={() => setImgError(true)}
            />
          ) : (
            emojiFor(slot)
          )}
        </div>

        {/* 우상단 ⋯ 메뉴 — 슬롯 이동/삭제 */}
        {(onMoveUp || onMoveDown || onDelete) && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 26, height: 26, borderRadius: 13, border: 0,
                background: menuOpen ? 'var(--bg-soft)' : 'transparent',
                cursor: 'pointer', fontSize: 14, color: 'var(--text-mute)',
                fontFamily: 'inherit',
              }}
              aria-label="슬롯 메뉴"
            >
              ⋯
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: 28, zIndex: 4,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  boxShadow: 'var(--shadow)',
                  overflow: 'hidden', minWidth: 110,
                }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => { setMenuOpen(false); onMoveUp?.(); }}
                  style={menuItemStyle(isFirst)}
                >
                  ↑ 위로
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => { setMenuOpen(false); onMoveDown?.(); }}
                  style={menuItemStyle(isLast)}
                >
                  ↓ 아래로
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete?.(); }}
                  style={{ ...menuItemStyle(false), color: '#dc2626' }}
                >
                  ⓧ 삭제
                </button>
              </div>
            )}
          </div>
        )}

        <div className="slot-body">
          <div className="slot-time">
            {tc.emoji} {tc.label}
          </div>
          <h3 className="slot-title">{place.name || '장소 미정'}</h3>
          <p className="slot-meta">
            {categoryLabel(place.category)}
            {place.address && (
              <>
                {' · '}
                <span>{place.address.split(' ').slice(0, 2).join(' ')}</span>
              </>
            )}
          </p>
          {slot.recommendation && (
            <>
              <div className="slot-divider" />
              <p className="slot-recommend">
                <span className="label">추천</span>
                {slot.recommendation}
              </p>
            </>
          )}
          <div className="slot-actions">
            <button
              type="button"
              className={`slot-chip${swappable ? ' primary' : ''}`}
              onClick={handleToggle}
              disabled={!swappable || busy}
              title={!swappable ? '카페/식당만 교체할 수 있어요' : undefined}
            >
              🔄 {expanded ? '닫기' : '다른 곳 보기'}
            </button>
            {place.latitude && place.longitude && (
              <a
                className="slot-chip"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.googlePlaceQuery || place.name || `${place.latitude},${place.longitude}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 길찾기
              </a>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="card" style={{ marginTop: 8, marginBottom: 12 }}>
          <div className="info-box" style={{ marginBottom: 12 }}>
            <span className="label">💡 AI 추천 근거</span>
            {slot.recommendation ||
              '근처 동일 카테고리 장소 중 평점·동선 기준으로 RAG가 추천한 후보입니다.'}
          </div>

          {loadingCandidates && <p className="muted">주변 후보를 찾는 중...</p>}

          {!loadingCandidates && candidates.length === 0 && !error && (
            <p className="muted">주변에서 적절한 후보를 찾지 못했어요.</p>
          )}

          {!loadingCandidates &&
            candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                className="alt-row"
                onClick={() => handleSelect(c.id)}
                disabled={busy}
              >
                <div className="thumb">
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt={c.name || ''}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : c.category === 'CAFE' ? '☕' : '🍴'}
                </div>
                <div className="body">
                  <div className="title">{c.name || '후보'}</div>
                  <div className="meta">
                    {categoryLabel(c.category)}
                    {c.googleRating != null && ` · ★ ${Number(c.googleRating).toFixed(1)}`}
                    {c.address && ` · ${c.address.split(' ').slice(0, 2).join(' ')}`}
                  </div>
                </div>
                <span className="chip" style={{ marginLeft: 'auto', marginRight: 0 }}>
                  선택
                </span>
              </button>
            ))}

          {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}
        </div>
      )}
    </>
  );
};

function menuItemStyle(disabled) {
  return {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: 0,
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12.5,
    fontWeight: 600,
    color: disabled ? 'var(--text-mute)' : 'var(--text)',
    textAlign: 'left',
    fontFamily: 'inherit',
    opacity: disabled ? 0.5 : 1,
  };
}

function categoryLabel(c) {
  switch (c) {
    case 'ATTRACTION':
      return '관광명소';
    case 'RESTAURANT':
      return '음식점';
    case 'CAFE':
      return '카페';
    case 'ACCOMMODATION':
      return '숙소';
    case 'SHOPPING':
      return '쇼핑';
    default:
      return '장소';
  }
}

const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

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

  const days = itinerary?.days || [];
  const activeDayObj = useMemo(
    () => days.find((d) => d.dayNumber === activeDay) || days[0],
    [days, activeDay],
  );
  // BE 가 orderIndex 순으로 정렬해 내려옴 — 그대로 표시 (식사도 같은 흐름 안에 자연스럽게)
  const activeSlots = activeDayObj?.slots || [];

  // 라이프사이클 단계 판정
  const isDraft = itinerary?.status === 'DRAFT';
  const isCompleted = (() => {
    if (!itinerary?.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(itinerary.endDate) < today;
  })();

  const handlePublish = () => {
    if (!itinerary) return;
    navigate(`/travelogues/new?itineraryId=${itinerary.id}`);
  };

  // 슬롯 추가 — PlaceSearchModal 에서 선택된 place 받아 BE addSlot 호출
  const handleAddPlace = async (place) => {
    if (!itinerary || !activeDayObj) return;
    const nextOrderIndex = (activeSlots[activeSlots.length - 1]?.orderIndex || 0) + 1;
    await addSlot(itinerary.id, activeDayObj.dayId, {
      placeId: place.id,
      orderIndex: nextOrderIndex,
    });
    await load();
  };

  // 슬롯 ↑↓ — 인접 두 슬롯의 orderIndex 만 swap → reorderSlots
  const handleMove = async (idx, direction) => {
    if (!itinerary || !activeDayObj) return;
    const target = idx + direction;
    if (target < 0 || target >= activeSlots.length) return;
    const a = activeSlots[idx];
    const b = activeSlots[target];
    await reorderSlots(itinerary.id, activeDayObj.dayId, [
      { slotId: a.id, orderIndex: b.orderIndex },
      { slotId: b.id, orderIndex: a.orderIndex },
    ]);
    await load();
  };

  // 슬롯 삭제
  const handleDeleteSlot = async (slotId) => {
    if (!itinerary || !activeDayObj) return;
    if (!window.confirm('이 슬롯을 삭제하시겠어요?')) return;
    await deleteSlot(itinerary.id, activeDayObj.dayId, slotId);
    await load();
  };

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button
            type="button"
            className="header-btn"
            onClick={() => navigate(-1)}
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="header-title">{itinerary?.title || '여행 일정'}</div>
          <button type="button" className="header-btn" onClick={handlePublish} aria-label="여행기 발행">
            ⤴
          </button>
        </header>

        <main className="main">
          {loading && <p className="muted">일정을 불러오는 중...</p>}
          {error && !loading && <div className="error-box">{error}</div>}

          {!loading && !error && itinerary && (
            <>
              <MapPlaceholder slots={activeSlots.map((s) => s.place || {})} />

              <div className="day-tabs">
                {days.map((d) => (
                  <button
                    key={d.dayId || d.dayNumber}
                    type="button"
                    className={`day-tab${d.dayNumber === activeDay ? ' active' : ''}`}
                    onClick={() => setActiveDay(d.dayNumber)}
                  >
                    Day {d.dayNumber}
                  </button>
                ))}
              </div>

              {/* 요약 chip 줄 */}
              <div style={{ marginBottom: 16 }}>
                {itinerary.city && <span className="chip">🗾 {itinerary.city}</span>}
                <span className="chip coral">{durationLabel(itinerary.startDate, itinerary.endDate)}</span>
                {itinerary.companionType && (
                  <span className="chip gray">
                    {COMPANION_LABEL[itinerary.companionType] || itinerary.companionType}
                    {itinerary.pace && ` · ${PACE_LABEL[itinerary.pace] || itinerary.pace}`}
                  </span>
                )}
              </div>

              {/* Day 2+ 권역 묶음 셀링 박스 */}
              {activeDay > 1 && activeSlots.length > 0 && (
                <div className="info-box coral" style={{ marginBottom: 16 }}>
                  <span className="label">📍 오늘의 동선 — 같은 권역 묶음</span>
                  RAG가 이동 시간을 최소화하는 지리 클러스터로 묶었습니다.
                </div>
              )}

              {activeSlots.length === 0 && (
                <div className="empty">
                  <div className="ico">📍</div>
                  <p>Day {activeDay} 가 비어있어요.<br/>장소를 추가해 일정을 채워 보세요.</p>
                  <button
                    type="button"
                    className="btn primary sm"
                    style={{ marginTop: 12, width: 220, marginInline: 'auto' }}
                    onClick={() => setShowPlaceModal(true)}
                  >
                    + 장소 추가
                  </button>
                </div>
              )}

              {/* 모든 슬롯을 orderIndex 순서대로 한 흐름에 표시 + 사이마다 직선거리 라벨 */}
              {activeSlots.map((slot, idx) => {
                const dist =
                  idx > 0 ? distanceLabel(activeSlots[idx - 1].place, slot.place) : null;
                return (
                  <React.Fragment key={slot.id}>
                    {dist && (
                      <div className="slot-distance">
                        <span className="dot-line" aria-hidden />
                        <span>🚶 {dist}</span>
                      </div>
                    )}
                    <SlotCard
                      slot={slot}
                      dayId={activeDayObj?.dayId}
                      itineraryId={itinerary.id}
                      onSwapped={load}
                      isFirst={idx === 0}
                      isLast={idx === activeSlots.length - 1}
                      onMoveUp={() => handleMove(idx, -1)}
                      onMoveDown={() => handleMove(idx, +1)}
                      onDelete={() => handleDeleteSlot(slot.id)}
                    />
                  </React.Fragment>
                );
              })}

              {/* 슬롯이 1개 이상 있을 때 "다른 장소 추가" 버튼 */}
              {activeSlots.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(true)}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '14px',
                    border: '1.5px dashed var(--primary-soft)',
                    background: 'var(--bg-soft)',
                    color: 'var(--primary-deep)',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  + 장소 추가
                </button>
              )}

              <div style={{ height: 80 }} />
            </>
          )}
        </main>

        {!loading && !error && itinerary && (
          <div className="cta-fixed">
            {isDraft ? (
              <button type="button" className="btn primary" onClick={() => setShowSaveModal(true)}>
                📥 내 일정 담기
              </button>
            ) : isCompleted ? (
              <button type="button" className="btn coral" onClick={handlePublish}>
                ✨ 여행기로 발행하기
              </button>
            ) : (
              <button
                type="button"
                className="btn dark-ghost"
                disabled
                title="다녀온 후 발행할 수 있어요"
              >
                ✨ 다녀온 후 발행 가능
              </button>
            )}
          </div>
        )}

        {showSaveModal && itinerary && (
          <SaveToCalendarModal
            itinerary={itinerary}
            onClose={() => setShowSaveModal(false)}
            onSaved={() => {
              setShowSaveModal(false);
              load();
            }}
          />
        )}

        {showPlaceModal && itinerary && (
          <PlaceSearchModal
            defaultCity={itinerary.city}
            onClose={() => setShowPlaceModal(false)}
            onPick={async (place) => {
              await handleAddPlace(place);
              setShowPlaceModal(false);
            }}
          />
        )}

        <BottomNav />
      </div>
    </div>
  );
};

const SaveToCalendarModal = ({ itinerary, onClose, onSaved }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dayCount = Math.max(1, itinerary.days?.length || 1);
  const endDate = (() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (dayCount - 1));
    return d.toISOString().slice(0, 10);
  })();

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await saveToCalendar(itinerary.id, startDate);
      if (onSaved) await onSaved();
    } catch (err) {
      setError(err.message || '담기 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>📥 내 일정 담기</h3>
        <p>
          시작 날짜만 정하면 캘린더에 박제돼요.
          <br />
          <strong>{dayCount}일</strong>짜리 일정이라 종료일은 자동으로 정해집니다.
        </p>

        <label className="field-label" htmlFor="save-start">시작 날짜</label>
        <input
          id="save-start"
          type="date"
          className="input"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          종료 날짜: {endDate}
        </p>

        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn dark-ghost" onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button type="button" className="btn primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '담는 중...' : '캘린더에 담기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTrip;
