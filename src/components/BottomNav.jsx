// src/components/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tripFlowInactive =
  'flex flex-col items-center justify-center gap-1 text-slate-400 min-w-[64px] text-[11px] font-medium py-2 px-2 active:scale-95 transition-transform';
const tripFlowActive =
  'flex flex-col items-center justify-center gap-1 text-primary-container min-w-[64px] text-[11px] font-semibold py-2 px-2 active:scale-95 transition-transform';

const tab4Inactive =
  "flex flex-col items-center justify-center gap-0.5 text-[#9ca3af] min-w-[64px] max-w-[64px] text-[11px] font-medium py-1 font-['Inter'] active:scale-95 transition-transform";
const tab4Active =
  "flex flex-col items-center justify-center gap-0.5 text-[#4f46e5] min-w-[64px] max-w-[64px] text-[11px] font-medium py-1 font-['Inter'] active:scale-95 transition-transform";

const BottomNav = () => {
  const { pathname } = useLocation();
  const isTripFlow = pathname === '/' || pathname === '/trips';

  if (isTripFlow) {
    return (
      <nav className="md:hidden fixed bottom-0 w-full z-[3] max-w-xl mx-auto left-0 right-0">
        <div className="mx-4 mb-4 rounded-t-xl bg-white border-t border-slate-100 shadow-[0_-4px_5.5px_rgba(79,70,229,0.05)] h-[88px] flex items-center justify-around px-6 pt-px">
          <NavLink to="/" end className={({ isActive }) => (isActive ? tripFlowActive : tripFlowInactive)}>
            <span className="material-symbols-outlined text-[24px] mb-1" aria-hidden>
              explore
            </span>
            <span>Explore</span>
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => (isActive ? tripFlowActive : tripFlowInactive)}>
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[26px] mb-1"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden
                >
                  auto_awesome
                </span>
                <span>Create</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              isActive || pathname === '/trip' ? tripFlowActive : tripFlowInactive
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[22px] mb-1"
                  style={
                    isActive || pathname === '/trip'
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                  aria-hidden
                >
                  map
                </span>
                <span>My Trips</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-[#f3f4f6] shadow-[0_-2px_5px_rgba(79,70,229,0.05)]">
      <div className="fixed bottom-0 left-0 right-0 h-[66px] flex justify-between items-center px-4 pt-px pb-safe max-w-xl mx-auto">
        <NavLink
          to="/trips"
          className={({ isActive }) => (isActive || pathname === '/trip' ? tab4Active : tab4Inactive)}
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined h-[22px] text-[20px] flex items-center justify-center"
                style={
                  isActive || pathname === '/trip' ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
                aria-hidden
              >
                map
              </span>
              <span className="leading-6">My Trips</span>
            </>
          )}
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => (isActive ? tab4Active : tab4Inactive)}>
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined h-6 text-[22px] flex items-center justify-center"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                aria-hidden
              >
                add_circle
              </span>
              <span className="leading-6">Create</span>
            </>
          )}
        </NavLink>
        <NavLink to="/" end className={({ isActive }) => (isActive ? tab4Active : tab4Inactive)}>
          <span className="material-symbols-outlined h-6 text-[22px] flex items-center justify-center" aria-hidden>
            explore
          </span>
          <span className="leading-6">Explore</span>
        </NavLink>
        <a className={tab4Inactive} href="#" aria-label="Profile (coming soon)">
          <span className="material-symbols-outlined h-5 text-[18px] flex items-center justify-center" aria-hidden>
            person
          </span>
          <span className="leading-6">Profile</span>
        </a>
      </div>
    </nav>
  );
};

export default BottomNav;
