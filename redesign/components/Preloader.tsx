'use client';
import { useI18n } from '@/lib/i18n';

const R = 345, C = 2 * Math.PI * R;

// Thin gold circle that fills as the first photo loads, with the emblem inside; then fades out.
export default function Preloader({ pct }: { pct: number }) {
  const { t } = useI18n();
  return (
    <div className={`pre ${pct >= 100 ? 'done' : ''}`} aria-hidden={pct >= 100} role="progressbar" aria-label={t('loading')} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 700 700" fill="none" aria-hidden>
        <circle cx="350" cy="350" r={R} className="pre-track" />
        <circle cx="350" cy="350" r={R} className="pre-arc" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
      </svg>
      <div className="pre-txt">
        <img src="/img/logo.svg?v=4" alt="" width={288} height={80} />
        <b dir="ltr">{pct}%</b>
      </div>
    </div>
  );
}
