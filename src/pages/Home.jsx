// src/pages/Home.jsx — Figma node 1:10372 + BE youtube-courses 연동
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { fetchYoutubeCourses, saveYoutubeCourse } from '../api/youtube';

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
  const titleLines = (course.title || 'Curated Course').split(/\n|—|–/).slice(0, 2);
  const desc = [];
  if (course.city) desc.push(course.city);
  if (course.country) desc.push(course.country);
  if (desc.length === 0) desc.push('AI-curated route');
  return {
    id: course.id,
    image: course.thumbnailUrl || fallbackThumbnail(idx),
    duration: formatDuration(course.durationSeconds) || course.duration || '—',
    title: titleLines.length > 0 ? titleLines : [course.title || 'Curated Course'],
    description: desc.slice(0, 2),
    creator: course.creatorAvatarUrl || fallbackCreator(idx),
    creatorName: course.youtubeAuthor || course.creatorName || 'TripLog AI Curated',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchYoutubeCourses({ size: 10 });
        if (cancelled) return;
        const items = (data?.items || []).map(mapCourseToGuide);
        setGuides(items);
      } catch (err) {
        if (!cancelled) setError(err.message || '코스를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
