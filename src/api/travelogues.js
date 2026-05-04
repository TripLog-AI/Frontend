import api from './index.js';

/**
 * 공개 여행기 피드 (인증 X도 가능, 단 우리는 항상 인증 후 호출).
 * @param {{city?: string, cursor?: number, size?: number}} params
 */
export async function fetchTravelogueFeed({ city, cursor, size = 20 } = {}) {
  const params = {};
  if (city) params.city = city;
  if (cursor != null) params.cursor = cursor;
  if (size != null) params.size = size;
  const { data } = await api.get('/travelogues', { params });
  return data;
}

export async function fetchTravelogueById(id) {
  const { data } = await api.get(`/travelogues/${id}`);
  return data;
}

export async function fetchMyTravelogues() {
  const { data } = await api.get('/travelogues/me');
  return data;
}

/**
 * Triple 클론 본질 — 다른 사용자 여행기의 동선을 내 일정으로 deep copy.
 * @returns {{itineraryId: number}}
 */
export async function scrapTravelogue(travelogueId) {
  const { data } = await api.post(`/travelogues/${travelogueId}/scraps`);
  return data;
}

export async function likeTravelogue(travelogueId) {
  const { data } = await api.post(`/travelogues/${travelogueId}/likes`);
  return data;
}

export async function unlikeTravelogue(travelogueId) {
  const { data } = await api.delete(`/travelogues/${travelogueId}/likes`);
  return data;
}

export async function publishTravelogue({ itineraryId, title, summary, coverImageUrl }) {
  const { data } = await api.post('/travelogues', {
    itineraryId, title, summary, coverImageUrl,
  });
  return data;
}
