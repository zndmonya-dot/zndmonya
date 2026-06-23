'use client';

export function HubRoute({ active }: { active?: boolean }) {
  return (
    <div className={`hub-route${active ? ' hub-route--active' : ''}`} aria-label="拠点間配送ルート">
      <div className="hub-route__site hub-route__site--from">
        <span className="hub-route__dot" />
        <span className="hub-route__code">HUB-A</span>
        <span className="hub-route__name">自宅拠点</span>
        <span className="hub-route__role">出荷</span>
      </div>

      <div className="hub-route__lane">
        <span className="hub-route__line" />
        <span className="hub-route__vehicle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M18 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 8h-3V4H3v13h1.05a2.5 2.5 0 014.9 0H15a2.5 2.5 0 014.9 0H20V8z" />
          </svg>
        </span>
      </div>

      <div className="hub-route__site hub-route__site--to">
        <span className="hub-route__dot hub-route__dot--dest" />
        <span className="hub-route__code">HUB-B</span>
        <span className="hub-route__name">社内拠点</span>
        <span className="hub-route__role">受取</span>
      </div>
    </div>
  );
}
