'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function TodayIcon({ active }: { active: boolean }) {
  const c = active ? '#1A1A1A' : '#B5B5B0';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke={c} strokeWidth="1.5" />
      <path d="M6 9L8 11L12 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BacklogIcon({ active }: { active: boolean }) {
  const c = active ? '#1A1A1A' : '#B5B5B0';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2.5" stroke={c} strokeWidth="1.5" />
      <line x1="5.5" y1="6.5" x2="12.5" y2="6.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="9" x2="12.5" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlansIcon({ active }: { active: boolean }) {
  const c = active ? '#1A1A1A' : '#B5B5B0';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.75" y="3.75" width="12.5" height="11.5" rx="2" stroke={c} strokeWidth="1.5" />
      <line x1="6" y1="2" x2="6" y2="5.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="2" x2="12" y2="5.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.75" y1="7.5" x2="15.25" y2="7.5" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

interface SidebarProps {
  todayCount?: number;
  backlogCount?: number;
  plansCount?: number;
}

export function Sidebar({ todayCount, backlogCount, plansCount }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/today',
      label: 'Today',
      icon: (active: boolean) => <TodayIcon active={active} />,
      count: todayCount,
    },
    {
      href: '/backlog',
      label: 'Backlog',
      icon: (active: boolean) => <BacklogIcon active={active} />,
      count: backlogCount,
    },
    {
      href: '/plans',
      label: 'Plans',
      icon: (active: boolean) => <PlansIcon active={active} />,
      count: plansCount,
    },
  ];

  return (
    <nav
      className="flex-shrink-0 h-screen"
      style={{ width: '200px', paddingTop: '32px', paddingLeft: '12px', paddingRight: '12px', backgroundColor: '#F9F6F7' }}
    >
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2.5 transition-colors"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: active ? '#1A1A1A' : '#B5B5B0',
                  fontWeight: active ? 500 : 400,
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  transitionDuration: '0.15s',
                  transitionTimingFunction: 'ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon(active)}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span style={{ fontSize: '13px', color: '#B5B5B0' }}>{item.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
