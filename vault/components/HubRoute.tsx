'use client';

function WarehouseIcon({ type }: { type: 'outbound' | 'inbound' }) {
  return (
    <span className={`hub-loop__wh-icon hub-loop__wh-icon--${type}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 14 L16 6 L28 14 V26 H4 Z" strokeLinejoin="round" />
        <path d="M11 26 V17 H21 V26" strokeLinejoin="round" />
        {type === 'outbound' ? (
          <>
            <path d="M13 20 H19" strokeLinecap="round" />
            <path d="M13 23 H19" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="13" y="18" width="6" height="4" rx="0.5" />
            <path d="M14 12 L16 10 L18 12" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}

export function HubRoute({ active }: { active?: boolean }) {
  const dur = active ? '5s' : '10s';

  return (
    <div
      className={`hub-loop${active ? ' hub-loop--active' : ''}`}
      aria-label="自宅PCと社内PCを結ぶ配送ルート"
    >
      <svg className="hub-loop__track" viewBox="0 0 340 96" aria-hidden="true">
        <defs>
          <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5b301" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#f5b301" />
          </linearGradient>
        </defs>
        <ellipse
          cx="170"
          cy="48"
          rx="148"
          ry="36"
          fill="none"
          stroke="url(#loopGrad)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="hub-loop__ellipse"
        />
        <path
          id="hub-orbit-path"
          d="M 22,48 A 148,36 0 1,1 318,48 A 148,36 0 1,1 22,48"
          fill="none"
        />
        <g className="hub-loop__vehicle">
          <animateMotion dur={dur} repeatCount="indefinite" rotate="auto">
            <mpath href="#hub-orbit-path" />
          </animateMotion>
          <g transform="translate(-10, -10)">
            <rect x="2" y="6" width="16" height="10" rx="1" fill="#0f2744" className="hub-loop__truck-body" />
            <rect x="14" y="8" width="6" height="8" rx="1" fill="#ff9900" className="hub-loop__truck-cab" />
            <circle cx="6" cy="18" r="2.5" fill="var(--ink)" />
            <circle cx="16" cy="18" r="2.5" fill="var(--ink)" />
          </g>
        </g>
      </svg>

      <div className="hub-loop__wh hub-loop__wh--from">
        <span className="hub-loop__wh-banner">WH-A · 出荷</span>
        <WarehouseIcon type="outbound" />
        <span className="hub-loop__wh-name">自宅PC</span>
        <span className="hub-loop__wh-role">出荷倉庫</span>
      </div>

      <div className="hub-loop__wh hub-loop__wh--to">
        <span className="hub-loop__wh-banner hub-loop__wh-banner--dest">WH-B · 受取</span>
        <WarehouseIcon type="inbound" />
        <span className="hub-loop__wh-name">社内PC</span>
        <span className="hub-loop__wh-role">受取倉庫</span>
      </div>
    </div>
  );
}
