import api from './index.js';

export async function fetchMyItineraries({ cursor, size = 20, status } = {}) {
  const params = {};
  if (cursor != null) params.cursor = cursor;
  if (size != null) params.size = size;
  if (status) params.status = status;
  const { data } = await api.get('/itineraries', { params });
  return data;
}

export async function fetchItineraryById(id) {
  const { data } = await api.get(`/itineraries/${id}`);
  return data;
}

export async function createManualItinerary({ title, city, country, startDate, endDate }) {
  const { data } = await api.post('/itineraries/manual', {
    title, city, country, startDate, endDate,
  });
  return data;
}

export async function generateAiItinerary({
  city, country, startDate, endDate, companionType, themes = [], pace = 'NORMAL',
}) {
  const { data } = await api.post('/itineraries/ai/generate', {
    city, country, startDate, endDate, companionType, themes, pace,
  });
  return data;
}

export async function parseYoutubeItinerary({ youtubeUrl }) {
  const { data } = await api.post('/itineraries/youtube/parse', { youtubeUrl });
  return data;
}

export async function fetchAiRequestStatus(requestId) {
  const { data } = await api.get(`/itineraries/ai/requests/${requestId}`);
  return data;
}

/**
 * AI 요청을 폴링. status === 'COMPLETED' 또는 'FAILED' 까지 대기.
 * @returns 최종 응답 (itineraryId 포함)
 */
export async function pollAiRequest(requestId, { intervalMs = 1500, timeoutMs = 60000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await fetchAiRequestStatus(requestId);
    if (result.status === 'COMPLETED' || result.status === 'FAILED') {
      return result;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('AI 응답이 시간 내에 도착하지 않았습니다.');
}

export async function deleteItinerary(id) {
  const { data } = await api.delete(`/itineraries/${id}`);
  return data;
}

export async function swapAlternative(itineraryId, dayId, slotId, alternativeId) {
  const { data } = await api.patch(
    `/itineraries/${itineraryId}/days/${dayId}/slots/${slotId}/swap`,
    { alternativeId }
  );
  return data;
}

// 좌표 반경 내 동일 카테고리(카페/식당) 후보 조회. 카페/식당 외 카테고리는 빈 배열 반환.
export async function fetchNearbyCandidates(
  itineraryId,
  dayId,
  slotId,
  { limit = 4, radiusM } = {}
) {
  const params = { limit };
  if (radiusM != null) params.radiusM = radiusM;
  const { data } = await api.get(
    `/itineraries/${itineraryId}/days/${dayId}/slots/${slotId}/nearby-candidates`,
    { params }
  );
  return data;
}

// 반경 후보 placeId 로 슬롯 장소 교체.
export async function swapToPlace(itineraryId, dayId, slotId, placeId) {
  const { data } = await api.patch(
    `/itineraries/${itineraryId}/days/${dayId}/slots/${slotId}/swap-to`,
    { placeId }
  );
  return data;
}

// "내 일정 담기" — DRAFT 일정을 캘린더에 박제. startDate 만 보내면 endDate 는 BE 가 days 수로 자동 계산.
// startDate: "YYYY-MM-DD" 형식
export async function saveToCalendar(itineraryId, startDate) {
  const { data } = await api.patch(
    `/itineraries/${itineraryId}/save-to-calendar`,
    { startDate }
  );
  return data;
}

// ── 직접 짜기: 슬롯 CRUD ─────────────────────────────

// 빈 일정 (직접 짜기 wizard 결과). startDate/endDate 박혀오면 BE 가 ItineraryDay N개 자동 생성 + status=ACTIVE 박제.
export async function createManualWithMeta({
  title, city, country, startDate, endDate, companionType, themes, pace,
}) {
  const { data } = await api.post('/itineraries/manual', {
    title, city, country, startDate, endDate, companionType, themes, pace,
  });
  return data;
}

export async function addSlot(itineraryId, dayId, { placeId, orderIndex, slotTime, timeCategory, stayDurationMinutes }) {
  const body = { placeId, orderIndex };
  if (slotTime) body.slotTime = slotTime;
  if (timeCategory) body.timeCategory = timeCategory;
  if (stayDurationMinutes) body.stayDurationMinutes = stayDurationMinutes;
  const { data } = await api.post(
    `/itineraries/${itineraryId}/days/${dayId}/slots`,
    body
  );
  return data;
}

export async function deleteSlot(itineraryId, dayId, slotId) {
  await api.delete(`/itineraries/${itineraryId}/days/${dayId}/slots/${slotId}`);
}

// orders: [{ slotId, orderIndex }, ...]
export async function reorderSlots(itineraryId, dayId, orders) {
  const { data } = await api.put(
    `/itineraries/${itineraryId}/days/${dayId}/slots/reorder`,
    { orders }
  );
  return data;
}
