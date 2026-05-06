// src/pages/TraveloguePublish.jsx — Triple 톤 mock UI (ui_mock/07_travelogue_publish.html)
// 일정 선택 → 제목 + 후기 textarea + 사진 grid mock + 태그 chip + 공개 토글 → 발행
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchMyItineraries } from '../api/itineraries';
import { publishTravelogue } from '../api/travelogues';
import { cityPhotoUrl } from '../utils/cityPhotos';

const DEFAULT_TAGS = ['#여행기', '#일정공유', '#TripLog'];

const TraveloguePublish = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const presetItineraryId = search.get('itineraryId');

  const [itineraries, setItineraries] = useState([]);
  const [selectedId, setSelectedId] = useState(presetItineraryId ? Number(presetItineraryId) : null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [tagDraft, setTagDraft] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyItineraries({ size: 30 });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.items || [];
        // "다녀온 여행" (status=ACTIVE & today > endDate) 만 발행 가능
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedOnly = list.filter((it) => {
          if (it.status !== 'ACTIVE') return false;
          if (!it.endDate) return false;
          return new Date(it.endDate) < today;
        });
        setItineraries(completedOnly);
        if (!selectedId && completedOnly.length > 0) {
          setSelectedId(completedOnly[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || '내 일정을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => itineraries.find((it) => it.id === selectedId) || null,
    [itineraries, selectedId],
  );

  // 제목 자동 채우기 (사용자 안 만지면)
  useEffect(() => {
    if (selected && !title) {
      setTitle(`${selected.city || '여행'} 다녀왔어요`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const slotCount = useMemo(() => {
    if (!selected?.days) return 0;
    return selected.days.reduce((acc, d) => acc + (d.slots?.length || 0), 0);
  }, [selected]);

  const handleAddTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const normalized = t.startsWith('#') ? t : `#${t}`;
    if (tags.includes(normalized)) {
      setTagDraft('');
      return;
    }
    setTags((prev) => [...prev, normalized]);
    setTagDraft('');
  };

  const handleRemoveTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedId) {
      setError('발행할 일정을 선택해 주세요.');
      return;
    }
    if (!title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await publishTravelogue({
        itineraryId: selectedId,
        title: title.trim(),
        summary: summary.trim() || null,
      });
      const newId = result?.travelogueId || result?.id;
      if (newId) {
        navigate(`/travelogues/${newId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || '발행 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button type="button" className="header-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <div className="header-title">여행기 발행</div>
          <button type="button" className="header-btn">⋯</button>
        </header>

        <main className="main">
          {loading && <p className="muted">내 일정을 불러오는 중...</p>}

          {!loading && itineraries.length === 0 && (
            <div className="empty">
              <div className="ico">📔</div>
              <p>
                다녀온 여행이 아직 없어요.
                <br />
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  여행기는 다녀온 일정만 발행할 수 있어요.
                </span>
              </p>
              <button
                type="button"
                className="btn primary sm"
                style={{ marginTop: 12, width: 200, marginInline: 'auto' }}
                onClick={() => navigate('/create')}
              >
                AI 일정 만들기
              </button>
            </div>
          )}

          {!loading && itineraries.length > 0 && (
            <>
              {/* 일정 요약 */}
              <div className="info-box" style={{ marginBottom: 20 }}>
                <span className="label">📔 발행할 일정</span>
                {selected ? (
                  <>
                    {selected.title || selected.city || '여행 일정'}
                    {slotCount > 0 && ` · 총 ${slotCount}개 슬롯`}
                    {selected.companionType && ` · ${companionLabel(selected.companionType)}`}
                  </>
                ) : (
                  '일정을 선택해 주세요'
                )}
              </div>

              {/* 일정 선택 (1개 이상일 때만) */}
              {itineraries.length > 1 && (
                <div className="field">
                  <label className="field-label">일정 선택</label>
                  <select
                    className="input"
                    value={selectedId || ''}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                  >
                    {itineraries.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title || it.city || `Trip #${it.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 제목 */}
              <div className="field">
                <label className="field-label">제목</label>
                <input
                  className="input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="엄마 아빠 데리고 도쿄, 진짜 잘 다녀왔어요"
                />
              </div>

              {/* 본문 */}
              <div className="field">
                <label className="field-label">후기</label>
                <textarea
                  className="textarea"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="다녀온 후기를 자유롭게 적어주세요..."
                />
              </div>

              {/* 사진 (시연 mock — 업로드 미구현) */}
              <div className="field">
                <label className="field-label">사진 (최대 6장)</label>
                <div className="photo-grid">
                  <div className="photo-cell">📷</div>
                  <div className="photo-cell">📷</div>
                  <div className="photo-cell">📷</div>
                  <div className="photo-cell">📷</div>
                  <div className="photo-cell">📷</div>
                  <div className="photo-cell add">+</div>
                </div>
              </div>

              {/* 태그 */}
              <div className="field">
                <label className="field-label">태그</label>
                <div className="card" style={{ padding: 12 }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="chip"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveTag(t)}
                      title="클릭하면 제거"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="chip outline" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="+ 태그 추가"
                      style={{
                        border: 0,
                        background: 'transparent',
                        outline: 'none',
                        fontSize: 11,
                        fontFamily: 'inherit',
                        color: 'var(--text-soft)',
                        padding: '5px 10px',
                        width: 90,
                      }}
                    />
                  </span>
                </div>
              </div>

              {/* 공개 토글 */}
              <div className="field">
                <div className="toggle-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>전체 공개</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-soft)',
                        marginTop: 2,
                      }}
                    >
                      다른 여행자가 Deep Copy로 가져갈 수 있어요
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle${isPublic ? ' on' : ''}`}
                    onClick={() => setIsPublic((v) => !v)}
                    aria-label="공개 여부"
                  />
                </div>
              </div>

              {/* 미리보기 — 선택된 도시 사진 fallback */}
              <h2 className="section-title">📋 미리보기</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {(() => {
                  const cover = cityPhotoUrl(selected?.city);
                  const bg = cover
                    ? `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55)), url('${cover}')`
                    : 'linear-gradient(135deg, #5DA8C5, #EA8775)';
                  return (
                <div
                  style={{
                    height: 100,
                    backgroundImage: bg,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {title || '제목 없음'}
                  </div>
                </div>
                  );
                })()}
                <div style={{ padding: 12 }}>
                  <div className="author-row" style={{ marginBottom: 0 }}>
                    <span className="ava">U</span>
                    <div>
                      <div className="who">{selected?.title || '내 여행'}</div>
                      <div className="when">
                        발행 직전 · {slotCount > 0 ? `${slotCount} 슬롯` : '미리보기'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}

              <div style={{ height: 110 }} />
            </>
          )}
        </main>

        {!loading && itineraries.length > 0 && (
          <div className="cta-fixed">
            <button
              type="button"
              className="btn coral"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? '발행 중...' : '✨ 여행기 발행하기'}
            </button>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

function companionLabel(c) {
  switch (c) {
    case 'SOLO': return '혼자';
    case 'COUPLE': return '연인과';
    case 'FRIENDS': return '친구와';
    case 'FAMILY': return '가족과';
    case 'PARENTS': return '부모님과';
    default: return c;
  }
}

export default TraveloguePublish;
