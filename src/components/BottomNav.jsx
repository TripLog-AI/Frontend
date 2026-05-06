// src/components/BottomNav.jsx — mock UI 톤 (Triple식 4탭, 하단 fixed 64px)
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', icon: '🏠', label: '홈', exact: true },
  { to: '/create', icon: '🔍', label: '검색' },
  { to: '/trips', icon: '📔', label: '내 일정' },
  { to: '/profile', icon: '👤', label: '프로필', disabled: true },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  // /trips/:id, /travelogues/:id 등 sub-route 도 "내 일정" 활성으로 묶음 (Triple 톤)
  const isInTripsBranch =
    pathname.startsWith('/trips') ||
    pathname.startsWith('/travelogues') ||
    pathname === '/trip';

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        if (tab.disabled) {
          return (
            <button key={tab.to} type="button" className="nav-item" aria-disabled>
              <span className="icon" aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          );
        }
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) => {
              // /trips/:id 같은 sub-route 도 /trips 탭 활성
              const active =
                isActive ||
                (tab.to === '/trips' && isInTripsBranch);
              return active ? 'nav-item active' : 'nav-item';
            }}
          >
            <span className="icon" aria-hidden>{tab.icon}</span>
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
