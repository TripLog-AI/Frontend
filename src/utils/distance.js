// 거리 계산 + 도보 시간 라벨 — React 무관 순수 함수 (engineering-philosophy-frontend.md §8).

// Haversine 직선거리 (km). lat/lng 가 string 이거나 BigDecimal 형태로 올 수도 있어 Number 보정.
export function haversineKm(lat1, lon1, lat2, lon2) {
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
export function distanceLabel(prev, next) {
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
