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

export async function swapAlternative(itineraryId, dayId, slotId, alternativeId) {
  const { data } = await api.patch(
    `/itineraries/${itineraryId}/days/${dayId}/slots/${slotId}/swap`,
    { alternativeId }
  );
  return data;
}
