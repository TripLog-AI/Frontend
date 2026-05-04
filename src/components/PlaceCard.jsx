// src/components/PlaceCard.jsx
import React from 'react';

const PlaceCard = ({ imageUrl, time, location, title, creatorImage, creatorName }) => {
  return (
    <div className="min-w-[240px] max-w-[240px] bg-[#f8f9ff] rounded-lg shadow-[0_4px_11px_rgba(53,37,205,0.03)] border border-[#d3e4fe] flex flex-col overflow-hidden snap-start shrink-0 cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-[140px] w-full overflow-hidden">
        <img
          alt=""
          className="absolute h-[170%] w-full max-w-none left-0 top-[-35%] object-cover pointer-events-none"
          src={imageUrl}
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white font-['Inter'] text-[10px] px-2 py-0.5 rounded leading-[15px]">
          {time}
        </div>
        <div className="absolute top-2 left-2 backdrop-blur-[2px] bg-[rgba(77,68,227,0.9)] text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 leading-[15px] font-['Inter']">
          <span className="material-symbols-outlined text-[10px] shrink-0" aria-hidden>
            location_on
          </span>
          {location}
        </div>
      </div>
      <div className="p-[11px] flex flex-col flex-grow gap-[11px]">
        <h3 className="font-['Inter'] font-medium text-[13px] text-on-surface tracking-wide line-clamp-2 leading-[18px]">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <img alt="" className="w-5 h-5 rounded-full object-cover shrink-0" src={creatorImage} />
          <span className="font-['Inter'] text-[11px] text-on-surface-variant leading-relaxed">{creatorName}</span>
        </div>
        <button
          type="button"
          className="w-full h-9 mt-auto bg-[#dce9ff] text-primary font-['Inter'] text-[13px] font-medium tracking-wide rounded-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]" aria-hidden>
            add_circle
          </span>
          Add to Trip
        </button>
      </div>
    </div>
  );
};

export default PlaceCard;
