// "내 일정 담기" 모달 — DRAFT 일정을 시작 날짜와 함께 캘린더에 박제.
import React, { useState } from 'react';
import { saveToCalendar } from '../api/itineraries';

const SaveToCalendarModal = ({ itinerary, onClose, onSaved }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dayCount = Math.max(1, itinerary.days?.length || 1);
  const endDate = (() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (dayCount - 1));
    return d.toISOString().slice(0, 10);
  })();

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await saveToCalendar(itinerary.id, startDate);
      if (onSaved) await onSaved();
    } catch (err) {
      setError(err.message || '담기 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>📥 내 일정 담기</h3>
        <p>
          시작 날짜만 정하면 캘린더에 박제돼요.
          <br />
          <strong>{dayCount}일</strong>짜리 일정이라 종료일은 자동으로 정해집니다.
        </p>

        <label className="field-label" htmlFor="save-start">시작 날짜</label>
        <input
          id="save-start"
          type="date"
          className="input"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          종료 날짜: {endDate}
        </p>

        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn dark-ghost" onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button type="button" className="btn primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '담는 중...' : '캘린더에 담기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveToCalendarModal;
