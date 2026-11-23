import { track } from '@vercel/analytics';
import { gaEvent } from './ga';
import { BRAND_FULL } from './site';

// Studio frame of a demo build (from erythroai-droid/templates): "Demo · Erythro.ai" strip, "I want a site like this" CTA,
// demo AI consultant. Turn it off for a client's production build with NEXT_PUBLIC_DEMO_NOTICE=0 (Vercel → Environment Variables).
export const DEMO = {
  enabled: process.env.NEXT_PUBLIC_DEMO_NOTICE !== '0',
  /** studio WhatsApp number (used only in the wa.me link, not shown on the page) */
  phone: '+972505308305',
};

/** Studio portfolio; utm marks the visits that came from this demo. */
export const PORTFOLIO = 'https://erythro.ai/portfolio?utm_source=demo-psb&utm_medium=studio_strip&utm_campaign=demo';

/**
 * Funnel events in Vercel Web Analytics (Analytics → Events), the same names in GA4:
 *   demo_notice_shown { trigger: studio_bar }  — the studio frame is on screen
 *   demo_portfolio_click { lang, source? }     — "View more work" in the strip
 *   ai_chat_open / ai_chat_ask { q }           — the demo AI consultant
 *   first_scroll / engaged_10s / engaged_visit — first seconds (components/Metrics.tsx)
 *   demo_whatsapp_click { opened_by, lang, source? } — the conversion; GA4 gets it as whatsapp_click + generate_lead { method: whatsapp }
 * In development Vercel only logs them to the console and GA4 is not loaded.
 */
export const trackDemo = (name: string, data?: Record<string, string>) => {
  // the same queue @vercel/analytics sets up: <Analytics /> mounts after the page effects, an event sent before it would be lost
  try {
    const w = window as unknown as { va?: (...a: unknown[]) => void; vaq?: unknown[][] };
    w.va ??= (...a: unknown[]) => { (w.vaq = w.vaq || []).push(a); };
  } catch { /* not in a browser */ }
  try { track(name, data); } catch { /* analytics blocked or unavailable */ }
  if (name === 'demo_whatsapp_click') {
    gaEvent('whatsapp_click', data);
    gaEvent('generate_lead', { method: 'whatsapp', ...data });
  } else {
    gaEvent(name, data);
  }
};

const SRC_KEY = 'demo-src';

/**
 * Where the visitor came from, read from the landing URL: "utm_source / utm_campaign / utm_term",
 * or "facebook" / "google" from a bare fbclid / gclid. Kept for the visit in sessionStorage. '' for direct visits.
 */
export const adSource = (): string => {
  try {
    const q = new URLSearchParams(window.location.search);
    const utm = ['utm_source', 'utm_campaign', 'utm_term'].map((k) => q.get(k)?.trim()).filter(Boolean).join(' / ');
    const src = (utm || (q.has('fbclid') ? 'facebook' : q.has('gclid') ? 'google' : '')).slice(0, 120);
    if (src) { sessionStorage.setItem(SRC_KEY, src); return src; }
    return sessionStorage.getItem(SRC_KEY) ?? '';
  } catch { return ''; }
};

/** wa.me link with the pre-filled message ({name} = the demo's name); the ad source, when known, goes on its own line at the end. */
export const waLink = (text: string, src = '') => {
  const msg = text.replace('{name}', BRAND_FULL);
  return `https://wa.me/${DEMO.phone.replace(/\D/g, '')}?text=${encodeURIComponent(src ? `${msg}\n\n[${src}]` : msg)}`;
};
