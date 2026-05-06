// src/components/PlaceSearchModal.jsx — 키워드로 장소 검색 → 선택 → 슬롯 추가
// 기본은 Google Places searchText (importPlacesByQuery). DB 캐시도 함께 노출.
import React, { useState } from 'react';
import { importPlacesByQuery } from '../api/places';

const CATEGORY_LABEL = {
  RESTAURANT: '음식점',
  CAFE: '카페',
  ATTRACTION: '관광명소',
  ACCOMMODATION: '숙소',
  SHOPPING: '쇼핑',
  OTHER: '장소',
};

const CATEGORY_EMOJI = {
  RESTAURANT: '🍴',
  CAFE: '☕',
  ATTRACTION: '🏛️',
  ACCOMMODATION: '🏨',
  SHOPPING: '🛍️',
  OTHER: '📍',
};

const PlaceSearchModal = ({ defaultCity, onClose, onPick }) => {
  const [query, setQuery] = useState(defaultCity || '');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [picked, setPicked] = useState(false);
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(null); // placeId

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;
    if (!query.trim()) return;
    setSubmitting(true);
    setError(null);
    setResults([]);
    try {
      const list = await importPlacesByQuery(query.trim());
      setResults(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || '검색 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePick = async (place) => {
    if (picking || picked) return;
    setPicking(place.id);
    try {
      await onPick(place);
      setPicked(true);
    } catch (err) {
      setError(err.message || '슬롯 추가 실패');
      setPicking(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 380, maxHeight: '85vh', overflowY: 'auto' }}
      >
        <h3>📍 장소 추가</h3>
        <p>Google Places 에서 장소를 검색해 슬롯에 담아요.</p>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder={`${defaultCity || '도쿄'} 카페, 메이지 신궁 ...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn primary sm"
              style={{ width: 'auto', padding: '0 16px', flexShrink: 0 }}
              disabled={submitting}
            >
              {submitting ? '...' : '검색'}
            </button>
          </div>
        </form>

        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.length === 0 && !submitting && !error && (
            <p className="muted" style={{ textAlign: 'center', padding: '12px 0' }}>
              검색어를 입력해 주세요
            </p>
          )}

          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="alt-row"
              onClick={() => handlePick(p)}
              disabled={picking !== null || picked}
            >
              <div className="thumb">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                {CATEGORY_EMOJI[p.category] || '📍'}
              </div>
              <div className="body">
                <div className="title">{p.name || '장소'}</div>
                <div className="meta">
                  {CATEGORY_LABEL[p.category] || '장소'}
                  {p.googleRating && ` · ★ ${Number(p.googleRating).toFixed(1)}`}
                  {p.address && ` · ${p.address.split(' ').slice(0, 2).join(' ')}`}
                </div>
              </div>
              <span className="chip" style={{ marginLeft: 'auto', marginRight: 0 }}>
                {picking === p.id ? '담는 중' : '담기'}
              </span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn dark-ghost" onClick={onClose}>
            {picked ? '닫기' : '취소'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceSearchModal;
