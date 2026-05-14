// src/pages/ViewTrip.jsx — 일정 상세 화면. day 탭 + 지도 + 슬롯 리스트 조합.
// 로직(fetch/상태)은 useItinerary hook, 슬롯 표현은 SlotCard, 모달은 SaveToCalendarModal 로 분리.
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import MapPlaceholder from '../components/MapPlaceholder';
import PlaceSearchModal from '../components/PlaceSearchModal';
import SlotCard from '../components/SlotCard';
import SaveToCalendarModal from '../components/SaveToCalendarModal';
import { useItinerary } from '../hooks/useItinerary';
import { distanceLabel } from '../utils/distance';
import { addSlot, deleteSlot, reorderSlots } from '../api/itineraries';

const COMPANION_LABEL = {
  SOLO: '혼자',
  COUPLE: '연인과',
  FRIENDS: '친구와',
  FAMILY: '가족과',
  PARENTS: '부모님과',
};

const PACE_LABEL = {
  RELAXED: '널널하게',
  NORMAL: '보통',
  PACKED: '빼곡하게',
};

function durationLabel(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.round((e - s) / 86400000) + 1;
  if (days <= 1) return '당일치기';
  return `${days - 1}박 ${days}일`;
}

const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itinerary, loading, error, reload } = useItinerary(id);
  const [activeDay, setActiveDay] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  const days = itinerary?.days || [];
  const activeDayObj = useMemo(
    () => days.find((d) => d.dayNumber === activeDay) || days[0],
    [days, activeDay],
  );
  // BE 가 orderIndex 순으로 정렬해 내려옴 — 그대로 표시 (식사도 같은 흐름 안에 자연스럽게)
  const activeSlots = activeDayObj?.slots || [];

  // 라이프사이클 단계 판정
  const isDraft = itinerary?.status === 'DRAFT';
  const isCompleted = (() => {
    if (!itinerary?.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(itinerary.endDate) < today;
  })();

  const handlePublish = () => {
    if (!itinerary) return;
    navigate(`/travelogues/new?itineraryId=${itinerary.id}`);
  };

  // 슬롯 추가 — PlaceSearchModal 에서 선택된 place 받아 BE addSlot 호출
  const handleAddPlace = async (place) => {
    if (!itinerary || !activeDayObj) return;
    const nextOrderIndex = (activeSlots[activeSlots.length - 1]?.orderIndex || 0) + 1;
    await addSlot(itinerary.id, activeDayObj.dayId, {
      placeId: place.id,
      orderIndex: nextOrderIndex,
    });
    await reload();
  };

  // 슬롯 ↑↓ — 인접 두 슬롯의 orderIndex 만 swap → reorderSlots
  const handleMove = async (idx, direction) => {
    if (!itinerary || !activeDayObj) return;
    const target = idx + direction;
    if (target < 0 || target >= activeSlots.length) return;
    const a = activeSlots[idx];
    const b = activeSlots[target];
    await reorderSlots(itinerary.id, activeDayObj.dayId, [
      { slotId: a.id, orderIndex: b.orderIndex },
      { slotId: b.id, orderIndex: a.orderIndex },
    ]);
    await reload();
  };

  // 슬롯 삭제
  const handleDeleteSlot = async (slotId) => {
    if (!itinerary || !activeDayObj) return;
    if (!window.confirm('이 슬롯을 삭제하시겠어요?')) return;
    await deleteSlot(itinerary.id, activeDayObj.dayId, slotId);
    await reload();
  };

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button
            type="button"
            className="header-btn"
            onClick={() => navigate(-1)}
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="header-title">{itinerary?.title || '여행 일정'}</div>
          <button type="button" className="header-btn" onClick={handlePublish} aria-label="여행기 발행">
            ⤴
          </button>
        </header>

        <main className="main">
          {loading && <p className="muted">일정을 불러오는 중...</p>}
          {error && !loading && <div className="error-box">{error}</div>}

          {!loading && !error && itinerary && (
            <>
              <MapPlaceholder slots={activeSlots.map((s) => s.place || {})} />

              <div className="day-tabs">
                {days.map((d) => (
                  <button
                    key={d.dayId || d.dayNumber}
                    type="button"
                    className={`day-tab${d.dayNumber === activeDay ? ' active' : ''}`}
                    onClick={() => setActiveDay(d.dayNumber)}
                  >
                    Day {d.dayNumber}
                  </button>
                ))}
              </div>

              {/* 요약 chip 줄 */}
              <div style={{ marginBottom: 16 }}>
                {itinerary.city && <span className="chip">🗾 {itinerary.city}</span>}
                <span className="chip coral">{durationLabel(itinerary.startDate, itinerary.endDate)}</span>
                {itinerary.companionType && (
                  <span className="chip gray">
                    {COMPANION_LABEL[itinerary.companionType] || itinerary.companionType}
                    {itinerary.pace && ` · ${PACE_LABEL[itinerary.pace] || itinerary.pace}`}
                  </span>
                )}
              </div>

              {/* Day 2+ 권역 묶음 셀링 박스 */}
              {activeDay > 1 && activeSlots.length > 0 && (
                <div className="info-box coral" style={{ marginBottom: 16 }}>
                  <span className="label">📍 오늘의 동선 — 같은 권역 묶음</span>
                  RAG가 이동 시간을 최소화하는 지리 클러스터로 묶었습니다.
                </div>
              )}

              {activeSlots.length === 0 && (
                <div className="empty">
                  <div className="ico">📍</div>
                  <p>Day {activeDay} 가 비어있어요.<br/>장소를 추가해 일정을 채워 보세요.</p>
                  <button
                    type="button"
                    className="btn primary sm"
                    style={{ marginTop: 12, width: 220, marginInline: 'auto' }}
                    onClick={() => setShowPlaceModal(true)}
                  >
                    + 장소 추가
                  </button>
                </div>
              )}

              {/* 모든 슬롯을 orderIndex 순서대로 한 흐름에 표시 + 사이마다 직선거리 라벨 */}
              {activeSlots.map((slot, idx) => {
                const dist =
                  idx > 0 ? distanceLabel(activeSlots[idx - 1].place, slot.place) : null;
                return (
                  <React.Fragment key={slot.id}>
                    {dist && (
                      <div className="slot-distance">
                        <span className="dot-line" aria-hidden />
                        <span>🚶 {dist}</span>
                      </div>
                    )}
                    <SlotCard
                      slot={slot}
                      dayId={activeDayObj?.dayId}
                      itineraryId={itinerary.id}
                      onSwapped={reload}
                      isFirst={idx === 0}
                      isLast={idx === activeSlots.length - 1}
                      onMoveUp={() => handleMove(idx, -1)}
                      onMoveDown={() => handleMove(idx, +1)}
                      onDelete={() => handleDeleteSlot(slot.id)}
                    />
                  </React.Fragment>
                );
              })}

              {/* 슬롯이 1개 이상 있을 때 "다른 장소 추가" 버튼 */}
              {activeSlots.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(true)}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '14px',
                    border: '1.5px dashed var(--primary-soft)',
                    background: 'var(--bg-soft)',
                    color: 'var(--primary-deep)',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  + 장소 추가
                </button>
              )}

              <div style={{ height: 80 }} />
            </>
          )}
        </main>

        {!loading && !error && itinerary && (
          <div className="cta-fixed">
            {isDraft ? (
              <button type="button" className="btn primary" onClick={() => setShowSaveModal(true)}>
                📥 내 일정 담기
              </button>
            ) : isCompleted ? (
              <button type="button" className="btn coral" onClick={handlePublish}>
                ✨ 여행기로 발행하기
              </button>
            ) : (
              <button
                type="button"
                className="btn dark-ghost"
                disabled
                title="다녀온 후 발행할 수 있어요"
              >
                ✨ 다녀온 후 발행 가능
              </button>
            )}
          </div>
        )}

        {showSaveModal && itinerary && (
          <SaveToCalendarModal
            itinerary={itinerary}
            onClose={() => setShowSaveModal(false)}
            onSaved={() => {
              setShowSaveModal(false);
              reload();
            }}
          />
        )}

        {showPlaceModal && itinerary && (
          <PlaceSearchModal
            defaultCity={itinerary.city}
            onClose={() => setShowPlaceModal(false)}
            onPick={async (place) => {
              await handleAddPlace(place);
              setShowPlaceModal(false);
            }}
          />
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default ViewTrip;
