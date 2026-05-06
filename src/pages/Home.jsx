// src/pages/Home.jsx — Triple 톤 mock UI 적용 (ui_mock/01_home.html 기반)
// Hero + 빠른 진입(2카드) + 인기 추천 코스(가로) + YouTube 큐레이션 + 여행기 미리보기
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchYoutubeCourses } from '../api/youtube';
import { fetchTravelogueFeed } from '../api/travelogues';
import { fetchMyItineraries } from '../api/itineraries';
import { cityPhotoUrl, genericCoverUrl, heroBackgroundUrl } from '../utils/cityPhotos';

// 시연용 인기 코스 (BE에 인기 코스 엔드포인트 없음 — RAG 셀링용 정적 데이터)
// ui_mock/01_home.html 에서 검증된 Unsplash hotlink 그대로 사용.
const FEATURED_COURSES = [
  {
    id: 'tokyo-parents',
    emoji: '🗾',
    city: '도쿄',
    duration: '4박 5일',
    title: '부모님과 여유로운 도쿄',
    creator: 'jiwon',
    likes: 234,
    photo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'bali-honey',
    emoji: '🏝️',
    city: '발리',
    duration: '5박 6일',
    title: '신혼여행 발리 풀빌라 코스',
    creator: 'yuri',
    likes: 189,
    photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'jeju-east',
    emoji: '🍊',
    city: '제주',
    duration: '2박 3일',
    title: '제주 동부 자연 일주',
    creator: 'minho',
    likes: 156,
    photo: 'https://images.unsplash.com/photo-1517722014278-c256a91a6fba?w=600&auto=format&fit=crop&q=80',
  },
];

// YouTube 큐레이션용 fallback 사진 (mock 01 검증된 hotlink)
const YOUTUBE_COVER_FALLBACK = [
  'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?w=600&auto=format&fit=crop&q=80',
];

function formatDuration(seconds) {
  if (!seconds || typeof seconds !== 'number') return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const Home = () => {
  const [guides, setGuides] = useState([]);
  const [travelogues, setTravelogues] = useState([]);
  const [historyPattern, setHistoryPattern] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [coursesRaw, traveloguesRaw, historyRaw] = await Promise.all([
          fetchYoutubeCourses({ size: 6 }).catch(() => null),
          fetchTravelogueFeed({ size: 12 }).catch(() => null),
          fetchMyItineraries({ size: 10 }).catch(() => null),
        ]);
        if (cancelled) return;

        const coursesList = Array.isArray(coursesRaw) ? coursesRaw : coursesRaw?.items || [];
        setGuides(coursesList.slice(0, 2));

        // RAG Layer 2 — history pattern
        const myItineraries = Array.isArray(historyRaw) ? historyRaw : historyRaw?.items || [];
        const countryCounts = {};
        myItineraries.forEach((it) => {
          if (it.country) countryCounts[it.country] = (countryCounts[it.country] || 0) + 1;
        });
        const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
        if (sortedCountries.length > 0) {
          setHistoryPattern({ main: sortedCountries[0][0] });
        }

        // 여행기 — history 매칭 우선
        const tlList = Array.isArray(traveloguesRaw) ? traveloguesRaw : traveloguesRaw?.items || [];
        const sea = ['Malaysia', 'Vietnam', 'Indonesia', 'Thailand', 'Singapore', 'Philippines'];
        const matchCountries = sortedCountries.map(([c]) => c);
        const isSEA = matchCountries.some((c) => sea.includes(c));
        const sorted = [...tlList].sort((a, b) => {
          const aMatch = matchCountries.includes(a.country) || (isSEA && sea.includes(a.country));
          const bMatch = matchCountries.includes(b.country) || (isSEA && sea.includes(b.country));
          return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });
        setTravelogues(sorted.slice(0, 3));
      } catch {
        // silent — 시연용
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const personalizedGreeting = (() => {
    if (!historyPattern) return null;
    const sea = ['Malaysia', 'Vietnam', 'Indonesia', 'Thailand', 'Singapore', 'Philippines'];
    if (sea.includes(historyPattern.main)) return '동남아 휴양형 여행자';
    if (['Japan', 'South Korea', 'China', 'Taiwan'].includes(historyPattern.main))
      return '동아시아 여행자';
    return `${historyPattern.main} 여행 스타일`;
  })();

  return (
    <div className="mock-page">
      <div className="device">
        <header className="mock-header">
          <div className="header-logo">
            <span className="dot" />
            TripLog
            <span style={{ color: 'var(--accent)', marginLeft: 2 }}>AI</span>
          </div>
          <div style={{ flex: 1 }} />
          <button className="header-btn" type="button" aria-label="알림">🔔</button>
          <Link to="/trips" className="header-btn" aria-label="내 일정">👤</Link>
        </header>

        <main className="main">
          {/* Hero — 도쿄 스카이라인 사진 + 컬러 그라데이션 오버레이 (mock 01 패턴) */}
          <section
            className="hero"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(93,168,197,0.25), rgba(15,40,60,0.55)), url('${heroBackgroundUrl()}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="hero-eyebrow">✨ 흩어진 정보를 한 줄로</div>
            <h1 className="hero-title">
              어디로<br />떠나시나요?
            </h1>
            <p className="hero-sub">5분 입력 → 30초 안에 맞춤 일정 받기</p>
            <Link to="/create" className="btn">AI 맞춤 일정 만들기 →</Link>
          </section>

          {/* 빠른 진입 3-갈래 — 직접 짜기 / AI / YouTube (Slide 4 라이프사이클) */}
          <section
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
            }}
          >
            <Link
              to="/create/manual"
              className="card"
              style={{
                textAlign: 'center',
                padding: '14px 6px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                textDecoration: 'none',
                color: 'inherit',
                marginTop: 12,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>📝</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>직접 짜기</div>
              <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 2 }}>
                슬롯 자유 편집
              </div>
            </Link>
            <Link
              to="/create"
              className="card"
              style={{
                textAlign: 'center',
                padding: '14px 6px',
                border: '1.5px solid var(--primary-soft)',
                background: 'var(--primary-soft)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>✨</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-darker)' }}>
                AI 맞춤
              </div>
              <div style={{ fontSize: 10, color: 'var(--primary-deep)', marginTop: 2 }}>
                30초 완성
              </div>
            </Link>
            <Link
              to="/youtube/import"
              className="card"
              style={{
                textAlign: 'center',
                padding: '14px 6px',
                border: '1.5px solid var(--accent-soft)',
                background: 'var(--accent-soft)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>▶️</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-deep)' }}>
                YouTube URL
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent-deep)', marginTop: 2, opacity: 0.8 }}>
                vlog 그대로
              </div>
            </Link>
          </section>

          {/* 인기 추천 코스 */}
          <h2 className="section-title">🔥 인기 추천 코스</h2>
          <div className="scroll-row">
            {FEATURED_COURSES.map((c) => (
              <Link key={c.id} to="/create" className="course-card">
                <div
                  className="course-cover"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55)), url('${c.photo}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {c.emoji} {c.city}
                    </div>
                    <div style={{ opacity: 0.95, fontWeight: 600 }}>{c.duration}</div>
                  </div>
                </div>
                <div className="course-body">
                  <h4 className="course-title">{c.title}</h4>
                  <div className="course-meta">
                    <span className="avatar">{c.creator.charAt(0).toUpperCase()}</span>
                    {c.creator}
                    <span style={{ marginLeft: 'auto' }}>❤️ {c.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* YouTube 큐레이션 */}
          {guides.length > 0 && (
            <>
              <h2 className="section-title">▶️ YouTube 큐레이션 코스</h2>
              {guides.map((g, idx) => (
                <YoutubeCourseCard key={g.id || idx} course={g} idx={idx} />
              ))}
            </>
          )}

          {/* 여행자의 여행기 */}
          {travelogues.length > 0 && (
            <>
              <h2 className="section-title">
                ✍️ {personalizedGreeting ? `${personalizedGreeting}을 위한 여행기` : '여행자의 여행기'}
              </h2>
              {travelogues.map((tl, idx) => {
                const cover =
                  tl.coverImageUrl ||
                  cityPhotoUrl(tl.city) ||
                  genericCoverUrl(idx);
                return (
                <Link
                  key={tl.id}
                  to={`/travelogues/${tl.id}`}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    marginBottom: 12,
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      height: 110,
                      backgroundImage: cover
                        ? `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65)), url('${cover}')`
                        : 'linear-gradient(135deg, #5DA8C5, #EA8775)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      padding: 12,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {tl.title || `${tl.city} 여행기`}
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div className="author-row" style={{ marginBottom: 0 }}>
                      <span className="ava">
                        {(tl.author?.nickname || 'U').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="who">{tl.author?.nickname || '여행자'}</div>
                        <div className="when">
                          {tl.city || '여행기'} · ❤️ {tl.likeCount || 0}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-soft)' }}>
                        📥 {tl.scrapCount || 0}
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}
            </>
          )}

          {loading && travelogues.length === 0 && guides.length === 0 && (
            <p className="muted" style={{ marginTop: 24, textAlign: 'center' }}>
              불러오는 중...
            </p>
          )}

          <div style={{ height: 24 }} />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

const YoutubeCourseCard = ({ course, idx }) => {
  const duration = formatDuration(course.durationSeconds) || course.duration || '';
  const cover =
    course.thumbnailUrl ||
    YOUTUBE_COVER_FALLBACK[idx % YOUTUBE_COVER_FALLBACK.length];
  const places = (course.places || course.chapters || []).slice(0, 2);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      <div
        style={{
          height: 150,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.45)), url('${cover}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: 'var(--accent)',
          }}
        >
          ▶
        </div>
        {duration && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: 10,
              padding: '3px 6px',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {duration}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>
          {course.title || 'Curated Course'}
        </h4>
        {places.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {places.map((p, i) => (
              <span key={i} className="chip gray">
                📍 {typeof p === 'string' ? p : p.name || p.title}
              </span>
            ))}
            {(course.places?.length || course.chapters?.length || 0) > 2 && (
              <span className="chip gray">
                +{(course.places?.length || course.chapters?.length) - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
