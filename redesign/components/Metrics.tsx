'use client';
import { useEffect } from 'react';
import { adSource, trackDemo } from '@/lib/demo';
import { fbTrackCustom } from '@/lib/metaPixel';

/**
 * First-seconds metrics for ad traffic (templates/Metrics, without the film frame). Each fires once per page view,
 * to Vercel + GA4 (trackDemo) and, for the engaged signal, to the Meta Pixel:
 *   first_scroll { seconds }  — the visitor started scrolling
 *   engaged_10s               — 10 s with the tab in front
 *   engaged_visit { via }     — first of the two above; Pixel custom event `EngagedVisit` (build a Custom Conversion on it)
 */
export default function Metrics() {
  useEffect(() => {
    const src = adSource();
    const base = (extra: Record<string, string>) => ({ ...extra, ...(src ? { source: src } : {}) });
    let engaged = false;
    const engage = (via: string) => {
      if (engaged) return;
      engaged = true;
      trackDemo('engaged_visit', base({ via }));
      fbTrackCustom('EngagedVisit', { via });
    };

    const t0 = performance.now();
    const onScroll = () => {
      if (window.scrollY < 24) return;           // ignore restored / jitter positions
      window.removeEventListener('scroll', onScroll);
      trackDemo('first_scroll', base({ seconds: ((performance.now() - t0) / 1000).toFixed(1) }));
      engage('scroll');
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // visible time only: a tab opened in the background must not count as "stayed 10 s"
    let seen = 0, last = performance.now(), done10 = false;
    const tick = window.setInterval(() => {
      const now = performance.now();
      if (!document.hidden) seen += now - last;
      last = now;
      if (!done10 && seen >= 10_000) {
        done10 = true;
        trackDemo('engaged_10s', base({}));
        engage('10s');
        window.clearInterval(tick);
      }
    }, 500);

    return () => { window.removeEventListener('scroll', onScroll); window.clearInterval(tick); };
  }, []);
  return null;
}
