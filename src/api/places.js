import api from './index.js';

/**
 * DB 캐시에서 장소 검색 (이름/주소/카테고리).
 * @param {{keyword?: string, city?: string, category?: string}} params
 */
export async function searchPlaces({ keyword, city, category } = {}) {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (city) params.city = city;
  if (category) params.category = category;
  const { data } = await api.get('/places/search', { params });
  return data;
}

/**
 * Google Maps Places API 호출 → DB 캐싱 + 결과 반환.
 * API key 미설정 시 BE 가 DB 검색으로 폴백.
 */
export async function importPlacesByQuery(query) {
  const { data } = await api.post('/places/import', { query });
  return data;
}

export async function getPlaceById(placeId) {
  const { data } = await api.get(`/places/${placeId}`);
  return data;
}
