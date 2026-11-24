import type { ReactNode } from 'react';

/**
 * Service icons in the site's style: fine ink line art over the brand's gold square
 * (the same square that sits behind the section headings). Colors come from the card:
 * --srv-ac paints the square, --srv-bg fills the parts that must hide what is behind them.
 */
export type ServiceIconName = 'company' | 'register' | 'docs' | 'changes' | 'esign';

const SQ = <rect className="srv-sq" x="4" y="30" width="26" height="26" />;
const BG = { className: 'srv-bg' };
const FINE = { strokeWidth: 1, opacity: 0.55 };

const ICONS: Record<ServiceIconName, ReactNode> = {
  /* classical building with a flag: an established, ready-made company */
  company: (
    <>
      {SQ}
      <path d="M32 9V3.5l5 1.6-5 1.6" />
      <path d="M7 22 32 9l25 13z" />
      <circle cx="32" cy="16.5" r="2.4" />
      <rect x="7" y="22" width="50" height="4" />
      <path d="M10 26v1.5M15 26v1.5M20 26v1.5M25 26v1.5M30 26v1.5M35 26v1.5M40 26v1.5M45 26v1.5M50 26v1.5M55 26v1.5" {...FINE} />
      {[14, 25.5, 38.5, 50].map((x) => (
        <g key={x}>
          <path d={`M${x - 3.2} 28h6.4M${x - 2.2} 28v18M${x + 2.2} 28v18M${x - 3.2} 46h6.4`} />
          <path d={`M${x} 30v14`} {...FINE} />
        </g>
      ))}
      <rect x="5" y="47.5" width="54" height="3.5" />
      <rect x="3" y="51" width="58" height="3.5" />
    </>
  ),
  /* charter with a key across it: registration "turnkey" */
  register: (
    <>
      {SQ}
      <path d="M38 6H14a2 2 0 0 0-2 2v42a2 2 0 0 0 2 2h18" />
      <path d="M38 6l10 10v20" />
      <path d="M38 6v8a2 2 0 0 0 2 2h8" />
      <path d="M18 14h11" strokeWidth={2.4} />
      <path d="M18 21h24M18 26h24M18 31h16M18 36h20" {...FINE} />
      <path d="M18 44c1.6-2.4 3.2-2.4 3.2 0s2.4 2.4 4 0 2.4-1.6 3.6 0" />
      <path d="M41 46.5H24v3.5h17z" {...BG} />
      <path d="M27 50v4.5h3V52h2.5v2.5h3V50z" {...BG} />
      <path d="M38.5 44v8.5" />
      <circle cx="49" cy="48.2" r="8" {...BG} />
      <circle cx="49" cy="48.2" r="5.2" strokeDasharray="1.6 1.6" {...FINE} />
      <circle cx="49" cy="48.2" r="2.4" />
    </>
  ),
  /* two sheets, signature and a wax seal with ribbons */
  docs: (
    <>
      {SQ}
      <path d="M20 12V8a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v38a2 2 0 0 1-2 2h-4" />
      <rect x="10" y="12" width="34" height="46" rx="2" />
      <path d="M15 19h13" strokeWidth={2.4} />
      <path d="M15 26h24M15 31h24M15 36h17M15 41h21" {...FINE} />
      <path d="M15 51c1.6-2.4 3.2-2.4 3.2 0s2.4 2.4 4 0 2.4-1.6 3.6 0" />
      <path d="M38 52.5 35.5 62l3.3-1.8 2 3 1.6-9.4M46 52.5l2.5 9.5-3.3-1.8-2 3-1.6-9.4" {...BG} />
      <circle cx="42" cy="48" r="7.5" {...BG} />
      <circle cx="42" cy="48" r="4.8" strokeDasharray="1.6 1.6" {...FINE} />
      <path d="m42 45.2.9 1.9 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.2z" strokeWidth={1} />
    </>
  ),
  /* the state register as an open ledger, with an update badge */
  changes: (
    <>
      {SQ}
      <path d="M32 17c-6-4-14-5-24-4v33c10-1 18 0 24 4z" />
      <path d="M32 17c6-4 14-5 24-4v33c-10-1-18 0-24 4z" />
      <path d="M8 46v3.5c10-1 18 0 24 4 6-4 14-5 24-4V46" />
      <path d="M13 21c5-.6 10 0 14 2M13 27c5-.6 10 0 14 2M13 33c5-.6 10 0 14 2M13 39c5-.6 10 0 14 2" {...FINE} />
      <path d="M37 29c4-2 9-2.6 14-2.2M37 35c4-2 9-2.6 14-2.2" {...FINE} />
      <path d="M37 41c4-2 9-2.6 14-2.2" strokeWidth={2.2} />
      <circle cx="50" cy="13" r="9" {...BG} />
      <path d="M45.2 13a4.8 4.8 0 0 1 8.4-3.2" />
      <path d="M54.2 6.6v3.6h-3.6" />
      <path d="M54.8 13a4.8 4.8 0 0 1-8.4 3.2" />
      <path d="M45.8 19.4v-3.6h3.6" />
    </>
  ),
  /* fountain-pen nib signing on a line: the e-signature */
  esign: (
    <>
      {SQ}
      <path d="M5 58h34" />
      <path d="M6 47.5l3.5 3.5M9.5 47.5 6 51" />
      <path d="M13 54c2.5-6 5.5-6.5 5.5-2s3.5 4 6-1 4.5-4 5.5-1 2 2.5 3 1.5" />
      <g transform="rotate(38 34 52)">
        <path d="M34 52 25 34c0-6 1.6-11 3.6-15h10.8c2 4 3.6 9 3.6 15z" {...BG} />
        <path d="M34 52V37" />
        <circle cx="34" cy="34.5" r="2.4" />
        <path d="M29 26c2.6 2 7.4 2 10 0" {...FINE} />
        <rect x="27.5" y="9" width="13" height="10" rx="1.2" {...BG} />
        <path d="M27.5 12.5h13M27.5 15.5h13" {...FINE} />
      </g>
    </>
  ),
};

export function ServiceIcon({ name, className = '' }: { name: ServiceIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}
