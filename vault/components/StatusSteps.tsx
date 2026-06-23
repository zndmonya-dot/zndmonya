'use client';

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  return <span className={`status-steps__dot${active ? ' status-steps__dot--active' : ''}`} />;
}

export function StatusSteps({ phase }: { phase: 'collecting' | 'packing' | 'uploading' | 'idle' }) {
  const order = ['collecting', 'packing', 'uploading'] as const;
  const idx = phase === 'idle' ? -1 : order.indexOf(phase);

  const steps = [
    { key: 'collecting', label: '読込' },
    { key: 'packing', label: 'ZIP梱包' },
    { key: 'uploading', label: '転送' },
  ] as const;

  return (
    <ol className="status-steps" aria-label="処理状況">
      {steps.map((step, i) => {
        const done = idx > i;
        const active = idx === i;
        return (
          <li key={step.key} className={`status-steps__item${done ? ' status-steps__item--done' : ''}${active ? ' status-steps__item--active' : ''}`}>
            <span className="status-steps__icon">
              <StepIcon done={done} active={active} />
            </span>
            <span className="status-steps__label">{step.label}</span>
            {i < steps.length - 1 && <span className="status-steps__line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
