// 도시별 검증된 Unsplash hotlink ID 매핑.
// ui_mock/*.html 에서 추출한 검증된 사진들 + 시연 도시 추가.
// fallback: 매핑 없는 도시는 null → 컴포넌트가 gradient 만 표시.

const CITY_PHOTO_ID = {
  // 한글
  도쿄: '1503899036084-c55cdd92da26',
  발리: '1537996194471-e657df975ab4',
  제주: '1517722014278-c256a91a6fba',
  서울: '1538485399081-7191377e8241',
  부산: '1538998960922-3f846ca20e25',
  오사카: '1590559899731-a382839e5549',
  교토: '1493997181344-712f2f19d87a',
  파리: '1502602898657-3e91760cbb34',
  런던: '1513635269975-59663e0ac1ad',
  뉴욕: '1496442226666-8d4d0e62e6e9',
  로마: '1552832230-c0197dd311b5',
  방콕: '1508009603885-50cf7c579365',
  싱가포르: '1565967511849-76a60a516170',
  다낭: '1583417319070-4a69db38a482',
  // 영문 alias
  Tokyo: '1503899036084-c55cdd92da26',
  Bali: '1537996194471-e657df975ab4',
  Jeju: '1517722014278-c256a91a6fba',
  Seoul: '1538485399081-7191377e8241',
  Busan: '1538998960922-3f846ca20e25',
  Osaka: '1590559899731-a382839e5549',
  Kyoto: '1493997181344-712f2f19d87a',
  Paris: '1502602898657-3e91760cbb34',
  London: '1513635269975-59663e0ac1ad',
  'New York': '1496442226666-8d4d0e62e6e9',
  Rome: '1552832230-c0197dd311b5',
  Bangkok: '1508009603885-50cf7c579365',
  Singapore: '1565967511849-76a60a516170',
  'Da Nang': '1583417319070-4a69db38a482',
};

// mock 에서 검증된 일반 cover 사진들 (도시 매칭 없을 때 fallback)
const GENERIC_COVERS = [
  '1492571350019-22de08371fd3', // 여행 일반
  '1480796927426-f609979314bd', // 야경
  '1601985705806-5b9a71f6004f', // 자연
];

const TOKYO_HERO = '1540959733332-eab4deabeeaf'; // Hero 영역용 도쿄 스카이라인

function buildUrl(id, w = 600) {
  if (!id) return null;
  return `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;
}

export function cityPhotoUrl(city, w = 600) {
  if (!city) return null;
  const trimmed = String(city).trim();
  return buildUrl(CITY_PHOTO_ID[trimmed], w);
}

export function genericCoverUrl(seed = 0, w = 600) {
  const id = GENERIC_COVERS[Math.abs(Number(seed) || 0) % GENERIC_COVERS.length];
  return buildUrl(id, w);
}

export function heroBackgroundUrl(w = 900) {
  return buildUrl(TOKYO_HERO, w);
}
