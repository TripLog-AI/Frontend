// src/pages/TravelogueDetail.jsx — Triple 클론 본질: 다른 사람 여행기 → 내 일정으로 담기
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  fetchTravelogueById,
  scrapTravelogue,
  likeTravelogue,
  unlikeTravelogue,
} from '../api/travelogues';

const CATEGORY_BADGE = {
  ATTRACTION: { label: 'SIGHTSEEING', bg: '#c9e6ff', text: '#001e2f' },
  RESTAURANT: { label: 'DINING', bg: '#ffb95f', text: '#653e00' },
  CAFE: { label: 'CAFE', bg: '#fde2c4', text: '#653e00' },
  ACCOMMODATION: { label: 'STAY', bg: '#d3e4fe', text: '#001e2f' },
  SHOPPING: { label: 'SHOPPING', bg: '#e9d5ff', text: '#4a1d96' },
  OTHER: { label: 'EXPLORE', bg: '#89ceff', text: '#004c6e' },
};

function badgeFor(c) {
  return CATEGORY_BADGE[c] || CATEGORY_BADGE.OTHER;
}

function formatRange(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const opt = { month: 'short', day: '2-digit' };
  return `${s.toLocaleDateString('en-US', opt)} - ${e.toLocaleDateString('en-US', opt)}, ${e.getFullYear()}`;
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
      if (travelogue.likedByMe) {
        await unlikeTravelogue(id);
      } else {
        await likeTravelogue(id);
      }
      await load();
    } catch (err) {
      alert(err.message || '좋아요 실패');
    } finally {
      setLikeBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#464555] font-['Inter']">
        여행기 불러오는 중...
      </div>
    );
  }

  if (error || !travelogue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-['Inter'] text-red-700 mb-3">{error || '여행기를 찾을 수 없습니다.'}</p>
          <Link to="/" className="text-[#4f46e5] underline font-semibold">홈으로</Link>
        </div>
      </div>
    );
  }

  // 해시태그 자동 (city + travel duration)
  const days = travelogue.days?.length || 0;
  const hashtags = [
    travelogue.city && `#${travelogue.city}`,
    travelogue.country && `#${travelogue.country}`,
    days > 0 && `#${days}일여행`,
    travelogue.author?.nickname && `#${travelogue.author.nickname}`,
  ].filter(Boolean);

  return (
    <div className="bg-white text-on-background font-body-md min-h-screen pb-[120px]">
      {/* 표지 이미지 */}
      <div className="relative w-full h-[260px] bg-[#d3e4fe] overflow-hidden">
        {travelogue.coverImageUrl && (
          <img
            alt=""
            src={travelogue.coverImageUrl}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 size-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
          aria-label="뒤로"
        >
          <span className="material-symbols-outlined text-[#0b1c30] text-[22px]" aria-hidden>
            arrow_back
          </span>
        </button>
      </div>

      <main className="max-w-xl mx-auto w-full px-6 pt-6">
        {/* 타이틀 + 메타 */}
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[26px] leading-tight text-[#0b1c30]">
          {travelogue.title}
        </h1>
        <div className="mt-1 flex items-center gap-1 text-[#464555]">
          <span className="material-symbols-outlined text-[16px]" aria-hidden>calendar_month</span>
          <span className="font-['Inter'] text-[14px]">{formatRange(travelogue.travelStartDate, travelogue.travelEndDate)}</span>
        </div>

        {/* 작성자 */}
        <div className="mt-4 flex items-center gap-2">
          <div className="size-9 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#4f46e5] flex items-center justify-center text-white font-semibold text-[14px]">
            {travelogue.author?.nickname?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-['Inter'] font-semibold text-[14px] text-[#0b1c30]">
              {travelogue.author?.nickname || '여행자'}
            </span>
            <span className="font-['Inter'] text-[11px] text-[#777587]">
              ❤️ {travelogue.likeCount} · 📥 {travelogue.scrapCount} · 👁 {travelogue.viewCount}
            </span>
          </div>
        </div>

        {/* 요약 */}
        {travelogue.summary && (
          <p className="mt-4 font-['Inter'] text-[15px] text-[#464555] leading-6">
            {travelogue.summary}
          </p>
        )}

        {/* 해시태그 */}
        {hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#f8f9ff] border border-[#e2e8f0] px-3 py-1 font-['Inter'] text-[12px] text-[#464555]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Day별 블록 */}
        <section className="mt-8 flex flex-col gap-8">
          {travelogue.days?.map((day) => (
            <DayBlocks key={day.dayId} day={day} />
          ))}
        </section>
      </main>

      {/* 하단 floating CTA */}
      <footer className="fixed bottom-0 w-full max-w-xl mx-auto left-0 right-0 px-4 pb-6 pt-3 bg-white/95 backdrop-blur-sm flex gap-2">
        <button
          type="button"
          onClick={toggleLike}
          disabled={likeBusy}
          className={`size-14 rounded-xl border flex items-center justify-center transition-colors ${
            travelogue.likedByMe
              ? 'border-[#ef4444] bg-[#fef2f2] text-[#ef4444]'
              : 'border-[#e2e8f0] bg-white text-[#777587]'
          }`}
          aria-label="좋아요"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={travelogue.likedByMe ? { fontVariationSettings: "'FILL' 1" } : undefined}
            aria-hidden
          >
            favorite
          </span>
        </button>
        <button
          type="button"
          onClick={handleScrap}
          disabled={scraping}
          className="flex-1 h-14 rounded-xl bg-[#4f46e5] text-white font-['Inter'] text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#3525cd] active:scale-[0.99] disabled:bg-[#c7c4d8] transition-all"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            download
          </span>
          {scraping ? '담는 중...' : '내 일정으로 담기'}
        </button>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────
// Day의 블록들 렌더링 — TEXT / IMAGE / PLACE
// ─────────────────────────────────────────────
const DayBlocks = ({ day }) => {
  const placeBlocks = day.blocks?.filter((b) => b.blockType === 'PLACE') || [];
  return (
    <article>
      <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-[#0b1c30] mb-3">
        Day {day.dayNumber}
      </h2>
      <div className="flex flex-col gap-4">
        {day.blocks?.map((block, idx) => {
          if (block.blockType === 'TEXT') {
            return (
              <p key={block.blockId} className="font-['Inter'] text-[15px] text-[#464555] leading-7 whitespace-pre-line">
                {block.content}
              </p>
            );
          }
          if (block.blockType === 'IMAGE') {
            return (
              <img
                key={block.blockId}
                src={block.imageUrl}
                alt=""
                className="w-full rounded-xl object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            );
          }
          if (block.blockType === 'PLACE' && block.place) {
            const placeIdx = placeBlocks.findIndex((b) => b.blockId === block.blockId) + 1;
            const badge = badgeFor(block.place.category);
            return (
              <div key={block.blockId} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 size-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center ${
                    placeIdx <= 3 ? 'bg-[#4f46e5]' : 'bg-[#a78bfa]'
                  }`}>
                    {placeIdx}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#0b1c30] leading-tight">
                        {block.place.name}
                      </h3>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 font-['Inter'] text-[10px] font-medium uppercase tracking-wide"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    {block.place.address && (
                      <p className="mt-1 font-['Inter'] text-[12px] text-[#777587]">
                        {block.place.address}
                      </p>
                    )}
                    {block.placeMemo && (
                      <p className="mt-2 font-['Inter'] text-[14px] text-[#464555] leading-6">
                        {block.placeMemo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </article>
  );
};

export default TravelogueDetail;
