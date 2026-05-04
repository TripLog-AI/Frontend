// src/pages/Home.jsx — Figma node 1:10372 + BE youtube-courses + travelogue feed (RAG)
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchYoutubeCourses, saveYoutubeCourse } from '../api/youtube';
import { fetchTravelogueFeed } from '../api/travelogues';
import { fetchMyItineraries } from '../api/itineraries';

const imgUserProfile =
  'https://www.figma.com/api/mcp/asset/97f9232d-9e3a-4c78-a5dc-ff88c9ca4faf';
const imgHeroSection =
  'https://www.figma.com/api/mcp/asset/8ba68486-425f-4eff-9fdf-e5b02f2b3858';

const fallbackThumbnail = (idx) =>
  `https://picsum.photos/seed/triplog-course-${idx}/600/400`;
const fallbackCreator = (idx) =>
  `https://i.pravatar.cc/80?img=${(idx % 70) + 1}`;

function formatDuration(seconds) {
  if (!seconds || typeof seconds !== 'number') return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mapCourseToGuide(course, idx) {
  const rawTitle = course.title || 'Curated Course';
  // Title을 두 줄로 — 한글이면 단어 단위가 아니라 길이 기준으로 split
  let titleLines;
  if (rawTitle.includes('|')) {
    titleLines = rawTitle.split('|').map((s) => s.trim()).slice(0, 2);
  } else if (rawTitle.length > 18) {
    const mid = Math.floor(rawTitle.length / 2);
    const breakAt = rawTitle.indexOf(' ', mid) > 0 ? rawTitle.indexOf(' ', mid) : mid;
    titleLines = [rawTitle.slice(0, breakAt).trim(), rawTitle.slice(breakAt).trim()];
  } else {
    titleLines = [rawTitle];
  }
  const desc = [];
  if (course.city) desc.push(course.city);
  if (course.country) desc.push(course.country);
  if (desc.length === 0) desc.push('AI-curated route');
  return {
    id: course.id,
    image: course.thumbnailUrl || fallbackThumbnail(idx),
    duration: formatDuration(course.durationSeconds) || course.duration || 'Featured',
    title: titleLines,
    description: desc.slice(0, 2),
    creator: course.creatorAvatarUrl || fallbackCreator(idx),
    creatorName: course.channelName || course.youtubeAuthor || course.creatorName || 'TripLog AI',
    views: course.viewCount ? `${course.viewCount} views` : 'Featured',
  };
}

const GuideCard = ({ item, onClick }) => {
  const inner = (
    <>
      <div className="relative h-[220px] w-full overflow-hidden">
        <img
          alt=""
          className="absolute w-full h-[158%] max-w-none left-0 top-[-29%] object-cover"
          src={item.image}
          onError={(e) => {
            e.currentTarget.src = fallbackThumbnail(item.id || 0);
          }}
        />
        <div className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 flex items-center gap-1 rounded-md px-2 py-1">
          <span className="material-symbols-outlined text-on-surface text-sm" aria-hidden>
            play_circle
          </span>
          <span className="font-['Inter'] text-[13px] font-medium text-on-surface tracking-wide">
            {item.duration}
          </span>
        </div>
      </div>
      <div className="p-[22px] flex flex-col gap-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[22px] leading-7 text-on-surface">
          {item.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>
        <div className="font-['Inter'] text-body-md text-on-surface-variant leading-6">
          {item.description.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-surface-variant overflow-hidden shrink-0">
              <img
                alt=""
                className="w-full h-full object-cover"
                src={item.creator}
                onError={(e) => {
                  e.currentTarget.src = fallbackCreator(item.id || 0);
                }}
              />
            </div>
            <span className="font-['Inter'] text-[13px] font-medium text-on-surface-variant tracking-wide truncate">
              {item.creatorName}
            </span>
          </div>
          <span className="font-['Inter'] text-[13px] font-medium text-[#777587] tracking-wide shrink-0">
            {item.views}
          </span>
        </div>
      </div>
    </>
  );

  const wrapClass =
    'bg-white border border-outline-variant rounded-lg shadow-[0_4px_11px_rgba(53,37,205,0.02)] overflow-hidden block w-full text-left';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(item)}
        className={`${wrapClass} cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`}
      >
        {inner}
      </button>
    );
  }
  return <article className={wrapClass}>{inner}</article>;
};

const Home = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [travelogues, setTravelogues] = useState([]);
  const [historyPattern, setHistoryPattern] = useState(null); // {countries: [...], main: 'Malaysia'}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 병렬로 youtube-courses + travelogues + my history 모두 fetch
        const [coursesRaw, traveloguesRaw, historyRaw] = await Promise.all([
          fetchYoutubeCourses({ size: 10 }).catch(() => null),
          fetchTravelogueFeed({ size: 20 }).catch(() => null),
          fetchMyItineraries({ size: 10 }).catch(() => null),
        ]);
        if (cancelled) return;

        // youtube-courses
        const coursesList = Array.isArray(coursesRaw) ? coursesRaw : coursesRaw?.items || [];
        setGuides(coursesList.map(mapCourseToGuide));

        // 사용자 history pattern 추출 (RAG Layer 2 시각화)
        const myItineraries = Array.isArray(historyRaw) ? historyRaw : historyRaw?.items || [];
        const countryCounts = {};
        myItineraries.forEach((it) => {
          if (it.country) countryCounts[it.country] = (countryCounts[it.country] || 0) + 1;
        });
        const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
        if (sortedCountries.length > 0) {
          setHistoryPattern({
            countries: sortedCountries.map(([c]) => c),
            main: sortedCountries[0][0],
          });
        }

        // 여행기 피드 — history pattern 매칭 우선 정렬
        const tlList = Array.isArray(traveloguesRaw) ? traveloguesRaw : traveloguesRaw?.items || [];
        const matchCountries = sortedCountries.map(([c]) => c);
        const sea = ['Malaysia', 'Vietnam', 'Indonesia', 'Thailand', 'Singapore', 'Philippines'];
        const isSEA = matchCountries.some((c) => sea.includes(c));
        const sorted = [...tlList].sort((a, b) => {
          const aMatch = matchCountries.includes(a.country) || (isSEA && sea.includes(a.country));
          const bMatch = matchCountries.includes(b.country) || (isSEA && sea.includes(b.country));
          return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });
        setTravelogues(sorted);
      } catch (err) {
        if (!cancelled) setError(err.message || '데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // RAG personalize 그리팅 — 사용자 history 기반
  const personalizedGreeting = (() => {
    if (!historyPattern) return null;
    const sea = ['Malaysia', 'Vietnam', 'Indonesia', 'Thailand', 'Singapore', 'Philippines'];
    if (sea.includes(historyPattern.main)) {
      return '동남아 여행지를 좋아하시는 분께 추천하는 여행기';
    }
    if (['Japan', 'South Korea', 'China', 'Taiwan'].includes(historyPattern.main)) {
      return '동아시아 여행지를 좋아하시는 분께 추천하는 여행기';
    }
    return `${historyPattern.main} 스타일 여행을 좋아하시는 분께`;
  })();

  const handlePickCourse = async (item) => {
    if (savingId) return;
    setSavingId(item.id);
    try {
      const result = await saveYoutubeCourse(item.id);
      if (result?.itineraryId) {
        navigate(`/trips/${result.itineraryId}`);
      } else {
        navigate('/trips');
      }
    } catch (err) {
      alert(`저장에 실패했습니다: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const heroBg = `linear-gradient(180deg, rgba(248, 249, 255, 0.8) 0%, rgba(248, 249, 255, 0.9) 100%), url(${imgHeroSection}), linear-gradient(90deg, rgb(220, 233, 255) 0%, rgb(220, 233, 255) 100%)`;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pt-[44px] pb-[88px] selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 w-full z-[2] backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm flex items-center justify-between px-5 py-3 max-w-xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 p-2 rounded-lg">
          <span
            className="material-symbols-outlined text-primary-container text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            travel_explore
          </span>
          <span className="font-['Inter'] font-bold text-[20px] leading-7 tracking-tight text-primary-container">
            TripLog AI
          </span>
        </div>
        <Link
          to="/trips"
          className="size-10 rounded-full border border-outline-variant overflow-hidden bg-surface-variant shrink-0 flex items-center justify-center"
          aria-label="My trips"
        >
          <span className="material-symbols-outlined text-[#464555] text-[18px]" aria-hidden>
            person
          </span>
        </Link>
      </header>

      <main className="max-w-xl mx-auto w-full px-5 pt-8 pb-12 flex flex-col gap-12 z-[1]">
        <section
          className="relative flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-outline-variant shadow-sm p-8 overflow-hidden"
          style={{
            backgroundImage: heroBg,
            backgroundSize: 'auto, cover, auto',
            backgroundPosition: 'center, center, center',
          }}
        >
          <div className="relative z-[1] flex flex-col items-center w-full">
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[44px] leading-[52px] tracking-[-0.88px] text-on-surface text-center pb-4">
              <span className="block">Discover Your</span>
              <span className="block">Next Journey</span>
            </h1>
            <p className="font-['Inter'] text-[18px] text-on-surface-variant text-center leading-7 max-w-[280px] pb-8">
              Let AI craft your perfect itinerary
              <br />
              or explore trending travel
              <br />
              courses curated just for you.
            </p>

            <Link
              to="/create"
              className="w-full max-w-xl bg-primary text-white rounded-lg shadow-sm flex items-center justify-center gap-2 h-14 font-['Inter'] text-[15px] font-semibold tracking-wide hover:bg-[#2818b3] active:scale-[0.99] transition-all"
            >
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden
              >
                auto_awesome
              </span>
              <span>Create with AI</span>
            </Link>
          </div>
        </section>

        {/* ★ RAG Layer 2 — 사용자 history 기반 personalize 여행기 피드 */}
        {travelogues.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              {personalizedGreeting && (
                <span className="font-['Inter'] text-[13px] font-semibold text-[#4f46e5] tracking-tight">
                  ✨ {personalizedGreeting}
                </span>
              )}
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[26px] leading-tight text-on-surface">
                다른 여행자들의 여행기
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
              {travelogues.slice(0, 8).map((tl) => (
                <Link
                  key={tl.id}
                  to={`/travelogues/${tl.id}`}
                  className="snap-start shrink-0 w-[260px] bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-[160px] w-full overflow-hidden bg-[#d3e4fe]">
                    {tl.coverImageUrl && (
                      <img
                        alt=""
                        src={tl.coverImageUrl}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute top-2 left-2 backdrop-blur-sm bg-white/90 rounded-md px-2 py-0.5 font-['Inter'] text-[11px] font-medium text-[#0b1c30]">
                      {tl.city}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[15px] leading-tight text-[#0b1c30] line-clamp-2">
                      {tl.title}
                    </h3>
                    <div className="flex items-center justify-between text-[#777587]">
                      <span className="font-['Inter'] text-[11px] truncate">
                        {tl.author?.nickname || '여행자'}
                      </span>
                      <span className="font-['Inter'] text-[11px] flex items-center gap-2">
                        <span>❤️ {tl.likeCount}</span>
                        <span>📥 {tl.scrapCount}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[32px] leading-10 tracking-[-0.32px] text-on-surface">
              <span className="block">Trending Travel</span>
              <span className="block">Guides</span>
            </h2>
            <Link
              to="/trips"
              className="flex items-center gap-1 font-['Inter'] text-[13px] font-medium text-primary tracking-wide shrink-0 pt-1"
            >
              <span className="flex flex-col items-end leading-[18px]">
                <span>My</span>
                <span>Trips</span>
              </span>
              <span className="material-symbols-outlined text-primary text-sm" aria-hidden>
                chevron_right
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {loading && (
              <div className="bg-white border border-outline-variant rounded-lg p-6 text-center font-['Inter'] text-[14px] text-on-surface-variant">
                추천 코스를 불러오는 중...
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center font-['Inter'] text-[14px] text-red-700">
                {error}
              </div>
            )}
            {!loading && !error && guides.length === 0 && (
              <div className="bg-white border border-outline-variant rounded-lg p-6 text-center font-['Inter'] text-[14px] text-on-surface-variant">
                추천 코스가 아직 없습니다. AI로 새 일정을 만들어보세요.
              </div>
            )}
            {guides.map((g) => (
              <GuideCard
                key={g.id}
                item={g}
                onClick={savingId ? undefined : handlePickCourse}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
