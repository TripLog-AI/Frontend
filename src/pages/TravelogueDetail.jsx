// src/pages/TravelogueDetail.jsx — Triple 톤 mock UI (ui_mock/08_travelogue_detail.html)
// 작가 행 + 큰 cover + 제목/통계 + 본문 + Day별 mini 카드 + 댓글 + Deep Copy CTA
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import {
  fetchTravelogueById,
  scrapTravelogue,
  likeTravelogue,
  unlikeTravelogue,
} from '../api/travelogues';
import { cityPhotoUrl } from '../utils/cityPhotos';

function emojiForPlace(place) {
  if (!place) return '📍';
  const cat = place.category;
  if (cat === 'CAFE') return '☕';
  if (cat === 'RESTAURANT') return '🍱';
  if (cat === 'ACCOMMODATION') return '🏨';
  if (cat === 'SHOPPING') return '🛍️';
  if (cat === 'ATTRACTION') return '🏛️';
  return '📍';
}

const TravelogueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [travelogue, setTravelogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const load = async () => {
    try {
      const data = await fetchTravelogueById(id);
      setTravelogue(data);
    } catch (err) {
      setError(err.message || '여행기를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleScrap = async () => {
    if (scraping) return;
    setScraping(true);
    try {
      const result = await scrapTravelogue(id);
      if (result?.itineraryId) {
        navigate(`/trips/${result.itineraryId}`);
      } else {
        alert('스크랩 완료. My Trips에서 확인하세요.');
      }
    } catch (err) {
      alert('스크랩 실패: ' + err.message);
    } finally {
      setScraping(false);
    }
  };

  const toggleLike = async () => {
    if (likeBusy || !travelogue) return;
    setLikeBusy(true);
    try {
      if (travelogue.likedByMe) await unlikeTravelogue(id);
      else await likeTravelogue(id);
      await load();
    } catch (err) {
      alert(err.message || '좋아요 실패');
    } finally {
      setLikeBusy(false);
    }
  };

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <button type="button" className="header-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <div className="header-title">여행기</div>
          <button type="button" className="header-btn">⋯</button>
        </header>

        <main className="main">
          {loading && <p className="muted">여행기 불러오는 중...</p>}
          {error && !loading && <div className="error-box">{error}</div>}

          {!loading && !error && travelogue && (
            <>
              {/* 작가 행 */}
              <div className="author-row">
                <span className="ava">
                  {(travelogue.author?.nickname || 'U').charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="who">{travelogue.author?.nickname || '여행자'}</div>
                  <div className="when">
                    {travelogue.publishedAt
                      ? new Date(travelogue.publishedAt).toLocaleDateString('ko-KR')
                      : '발행일 미상'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ width: 'auto', padding: '0 14px', marginLeft: 'auto' }}
                >
                  + 팔로우
                </button>
              </div>

              {/* 큰 cover — coverImageUrl 우선, 없으면 도시 기반 Unsplash fallback */}
              {(() => {
                const cover =
                  travelogue.coverImageUrl || cityPhotoUrl(travelogue.city, 900);
                return (
              <div
                className="cover-banner"
                style={
                  cover
                    ? {
                        backgroundImage: `linear-gradient(135deg, rgba(93,168,197,0.35), rgba(15,23,42,0.55)), url('${cover}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.92,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {travelogue.city || ''}
                    {travelogue.travelStartDate && travelogue.travelEndDate && (
                      <>
                        {' · '}
                        {Math.round(
                          (new Date(travelogue.travelEndDate) -
                            new Date(travelogue.travelStartDate)) /
                            86400000,
                        ) + 1}
                        일
                      </>
                    )}
                  </div>
                  <div className="city">{travelogue.city || '여행기'}</div>
                </div>
              </div>
                );
              })()}

              {/* 제목 */}
              <h1 className="title">{travelogue.title}</h1>

              {/* 통계 */}
              <div className="stats-row" style={{ margin: '10px 0 16px' }}>
                <div className="stat">❤️ <strong>{travelogue.likeCount || 0}</strong></div>
                <div className="stat">📥 <strong>{travelogue.scrapCount || 0}</strong></div>
                <div className="stat">👁 <strong>{travelogue.viewCount || 0}</strong></div>
                <div className="stat">💬 <strong>{travelogue.commentCount || 0}</strong></div>
              </div>

              {/* 메타 chip */}
              <div style={{ marginBottom: 16 }}>
                {travelogue.city && <span className="chip">🗾 {travelogue.city}</span>}
                {travelogue.country && <span className="chip gray">{travelogue.country}</span>}
                {travelogue.days?.length > 0 && (
                  <span className="chip coral">
                    {travelogue.days.length}일 일정
                  </span>
                )}
              </div>

              {/* AI 추천 근거 박스 (RAG 셀링) */}
              <div className="info-box" style={{ marginBottom: 18 }}>
                <span className="label">💡 RAG 2-Layer 추천 — 이 일정의 비밀</span>
                {travelogue.summary ||
                  '사용자 history pattern + 현재 여행 조건을 매칭해 RAG가 개인화한 일정입니다.'}
              </div>

              {/* 본문 */}
              {travelogue.summary && (
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: 'var(--text)',
                    marginBottom: 18,
                  }}
                >
                  <p>{travelogue.summary}</p>
                </div>
              )}

              {/* Day 미니 카드 */}
              {travelogue.days?.length > 0 && (
                <>
                  <h2 className="section-title">📔 일정 한눈에 보기</h2>
                  {travelogue.days.map((day) => (
                    <DayMini key={day.dayId} day={day} />
                  ))}
                </>
              )}

              {/* 댓글 */}
              <h2 className="section-title">
                💬 댓글 {travelogue.commentCount || 0}
              </h2>
              {(travelogue.comments?.length > 0 ? travelogue.comments : DEMO_COMMENTS).map(
                (c, i) => (
                  <div className="comment" key={c.id || i}>
                    <span className="ava">
                      {(c.author?.nickname || c.who || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div>
                        <span className="who">
                          {c.author?.nickname || c.who || '익명'}
                        </span>
                        <span className="when">{c.when || '방금'}</span>
                      </div>
                      <div className="text">{c.content || c.text}</div>
                    </div>
                  </div>
                ),
              )}

              <div style={{ height: 100 }} />
            </>
          )}
        </main>

        {!loading && !error && travelogue && (
          <div className="action-bar">
            <button
              type="button"
              className={`icon-btn${travelogue.likedByMe ? ' active' : ''}`}
              onClick={toggleLike}
              disabled={likeBusy}
              aria-label="좋아요"
            >
              ❤️
            </button>
            <button
              type="button"
              className="btn coral"
              style={{ flex: 1 }}
              onClick={handleScrap}
              disabled={scraping}
            >
              {scraping ? '담는 중...' : '📥 내 일정으로 가져오기'}
            </button>
            <button type="button" className="icon-btn" aria-label="댓글">
              💬
            </button>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

const DayMini = ({ day }) => {
  const placeBlocks = (day.blocks || []).filter((b) => b.blockType === 'PLACE');
  return (
    <div className="mini-day">
      <span className="day-tag">Day {day.dayNumber}</span>
      <div className="places">
        {placeBlocks.length === 0 ? (
          <span className="muted">슬롯이 비어 있어요</span>
        ) : (
          placeBlocks.map((b, i) => (
            <React.Fragment key={b.blockId || i}>
              {emojiForPlace(b.place)} {b.place?.name || '장소'}
              {i < placeBlocks.length - 1 && <span className="dot">·</span>}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

const DEMO_COMMENTS = [
  {
    id: 'd1',
    who: 'minho',
    when: '1일 전',
    text: '추천 진짜 공감... 부모님이랑 가니까 정말 좋아하시더라구요 🙏',
  },
  {
    id: 'd2',
    who: 'yuri',
    when: '1일 전',
    text: 'Deep Copy 받아갑니다! 다음달에 그대로 쓸게요 ❤️',
  },
];

export default TravelogueDetail;
