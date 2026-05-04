/**
 * API 호출 예시 — Week 1 연동 시 참고용.
 * 실제 경로/바디는 Swagger 및 Docs/API_CONTRACT.md 기준으로 수정하세요.
 */
import api from './index.js';

/** My Trips — 일정 목록 */
export async function fetchItineraries() {
  const { data } = await api.get('/itineraries');
  return data;
}

/** 일정 상세 */
export async function fetchItineraryById(id) {
  const { data } = await api.get(`/itineraries/${id}`);
  return data;
}

/** Place Swap */
export async function swapItineraryPlace(itineraryId, payload) {
  const { data } = await api.patch(`/itineraries/${itineraryId}/swap`, payload);
  return data;
}

/** AI 일정 생성 */
export async function generateItineraryAi(payload) {
  const { data } = await api.post('/itineraries/ai/generate', payload);
  return data;
}
