// 일정 상세 조회 + 상태 관리 hook (engineering-philosophy-frontend.md §2 로직↔표현 분리).
// 컴포넌트는 이 hook 이 준 { itinerary, loading, error, reload } 만 쓴다.
import { useEffect, useState } from 'react';
import { fetchItineraryById } from '../api/itineraries';

export function useItinerary(id) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    try {
      const data = await fetchItineraryById(id);
      setItinerary(data);
    } catch (err) {
      setError(err.message || '일정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { itinerary, loading, error, reload };
}
