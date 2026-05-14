// 슬롯 카드 — 한 슬롯의 표현 + 반경 후보 swap + 슬롯 이동/삭제 메뉴.
// 슬롯 표시 전용 헬퍼(이모지/카테고리 라벨/핀 색)도 이 컴포넌트의 관심사라 함께 둔다.
import React, { useState } from 'react';
import { fetchNearbyCandidates, swapToPlace } from '../api/itineraries';

const SWAPPABLE_CATEGORIES = new Set(['RESTAURANT', 'CAFE']);

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
// TODO(F5): BE/AI 카테고리가 정확해지면 이 정규식 테이블 통째로 제거 (engineering-philosophy-frontend.md 안티패턴)
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

export default SlotCard;
