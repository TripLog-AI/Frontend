// src/components/MapPlaceholder.jsx — generic 도시 지도 mock (실제 지도 라이브러리 X)
// 슬롯 lat/lng 받아서 0~100% 영역에 정규화 → 핀 자동 배치 + 동선 dashed line.
import React, { useMemo } from 'react';

const CATEGORY_PIN_CLASS = {
  ATTRACTION: 'p',
  RESTAURANT: 'c',
  CAFE: 'c',
  ACCOMMODATION: 't',
  SHOPPING: 'v',
  OTHER: 'p',
};

function pinClassFor(category) {
  return CATEGORY_PIN_CLASS[category] || 'p';
}

/**
 * @param {Array<{latitude?: number|string, longitude?: number|string, category?: string}>} slots
 * @param {boolean} flat  헤더 바로 아래에 끝까지 붙는 형태 (default)
 */
const MapPlaceholder = ({ slots = [], flat = true }) => {
  const pins = useMemo(() => {
    const points = slots
      .map((s) => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
        cat: s.category || 'OTHER',
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    if (points.length === 0) return [];

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = maxLat - minLat || 0.005;
    const lngSpan = maxLng - minLng || 0.005;

    // 여백 padding 12% — 핀이 가장자리에 안 붙게
    const pad = 0.12;
    return points.map((p, i) => {
      const xRatio = (p.lng - minLng) / lngSpan;
      const yRatio = 1 - (p.lat - minLat) / latSpan; // SVG y는 위가 0
      const left = pad * 100 + xRatio * (1 - 2 * pad) * 100;
      const top = pad * 100 + yRatio * (1 - 2 * pad) * 100;
      return {
        idx: i + 1,
        left,
        top,
        cls: pinClassFor(p.cat),
      };
    });
  }, [slots]);

  const polylinePath = useMemo(() => {
    if (pins.length < 2) return '';
    return pins.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.left.toFixed(1)},${p.top.toFixed(1)}`).join(' ');
  }, [pins]);

  return (
    <div className={`map-box${flat ? ' flat' : ''}`}>
      <svg
        className="map-svg-bg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 배경 */}
        <rect width="100" height="100" fill="#E8F1F7" />
        {/* 우하단 바다/만 */}
        <path d="M62,100 L100,100 L100,68 Q86,72 76,82 Q70,92 62,100 Z" fill="#C9DDEB" opacity="0.85" />
        {/* 도시 영역 (베이지) */}
        <path d="M0,0 L100,0 L100,68 Q86,72 76,82 Q70,92 62,100 L0,100 Z" fill="#F2EAE7" opacity="0.5" />
        {/* 강 (사선) */}
        <path
          d="M58,0 Q60,20 60,40 Q60,60 64,80 Q68,92 70,100"
          stroke="#B5D4E5"
          strokeWidth="1.2"
          fill="none"
          opacity="0.7"
        />
        {/* 도로 격자 */}
        <g stroke="#D9DEE3" strokeWidth="0.25" opacity="0.5">
          <line x1="0" y1="25" x2="100" y2="25" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="0" y1="75" x2="65" y2="75" />
          <line x1="20" y1="0" x2="20" y2="100" />
          <line x1="40" y1="0" x2="40" y2="100" />
          <line x1="80" y1="0" x2="80" y2="68" />
        </g>
        {/* 공원 (요요기) */}
        <ellipse cx="28" cy="52" rx="10" ry="7" fill="#CFE3CC" opacity="0.55" />
        {/* 공원 (우에노) */}
        <ellipse cx="68" cy="30" rx="7" ry="5" fill="#CFE3CC" opacity="0.55" />

        {/* 동선 dashed line (핀 2개 이상일 때) */}
        {polylinePath && (
          <path
            d={polylinePath}
            stroke="#5DA8C5"
            strokeWidth="0.6"
            strokeDasharray="1.2 1.2"
            fill="none"
            opacity="0.7"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="map-pins">
        {pins.map((p) => (
          <div
            key={p.idx}
            className={`map-pin ${p.cls}`}
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
          >
            {p.idx}
          </div>
        ))}
      </div>

      <div className="map-attribution">© TripLog · 지도 mock</div>
    </div>
  );
};

export default MapPlaceholder;
