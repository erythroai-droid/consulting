'use client';
import { createContext, ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Smoothing without ScrollSmoother: the smoother moves the whole page as one transformed layer (~10 000 px tall, ×2 on retina),
// which is over the GPU texture limit of Safari/Firefox/many integrated GPUs — they skipped drawing it and block 01 blinked out.
// Lenis instead eases the real window scroll position frame by frame (nothing is transformed), so pins stay position: fixed
// and the page still glides. It runs on GSAP's ticker, so ScrollTrigger updates in the same frame as the scroll — no pin lag.
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;

/** Pause (in screens, 100 = one screen) at the end of a block before the next one starts to slide over it. Keep in sync with --hold in globals.css. */
export const HOLD = 100;

/** Phones/tablets and people who asked for reduced motion get a static page: no smooth scroll, pins or scrubbing, only still images. Keep in sync with the inline script in layout.tsx. */
// Touch screens of any size too: there the browser scrolls natively on its own thread and a JS-smoothed page lags behind it and shakes.
export const STATIC_QUERY = '(max-width: 900px), (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)';
const subscribeStatic = (cb: () => void) => { const mq = window.matchMedia(STATIC_QUERY); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); };
export const useStaticMode = () => useSyncExternalStore(subscribeStatic, () => window.matchMedia(STATIC_QUERY).matches, () => false);

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Children create their ScrollTriggers only after the smoother exists (GSAP requires that order).
const Ready = createContext(false);
export const useScrollReady = () => useContext(Ready);

/** Wrap the page content (not fixed UI like the header or modals). */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const staticMode = useStaticMode();

  useEffect(() => {
    const isStatic = window.matchMedia(STATIC_QUERY).matches;
    document.documentElement.classList.toggle('static', isStatic);
    if (isStatic) { setReady(false); return; }            // static page: nothing below is created
    // one source of truth for "a screen": the same number the ScrollTriggers use (innerHeight). Updated on width change or a big height change,
    // not on the small changes of the phone's address bar, which would make everything jump.
    // --vh only ever grows while the width stays the same, so a screen-high block can never be shorter than the visible area
    // (that left a strip of the block underneath showing) when the phone's address bar hides and the visible height grows.
    let w = window.innerWidth, vhPx = 0;
    const setVh = () => {
      if (window.innerWidth !== w) { w = window.innerWidth; vhPx = 0; }
      vhPx = Math.max(vhPx, window.innerHeight);
      document.documentElement.style.setProperty('--vh', `${vhPx}px`);
    };
    setVh();
    const onResize = () => setVh();
    window.addEventListener('resize', onResize);
    ScrollTrigger.addEventListener('refreshInit', setVh);   // re-measure on every refresh, resize events are not reliable on phones
    ScrollTrigger.config({ ignoreMobileResize: true });
    const ln = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: false });   // lerp: share of the remaining distance covered per frame
    lenis = ln;
    ln.on('scroll', ScrollTrigger.update);
    const unMagnet = initMagnet(ln);
    const tick = (time: number) => ln.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setReady(true);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    // Fetch and decode every photo of the page while it is idle after load. Lazy photos were fetched and decoded the moment they
    // neared the screen, mid-scroll — a 30–40 ms frame each time a big photo (gallery, backgrounds) came in: a visible jerk.
    let warmed = false;
    const warm = async () => {
      if (warmed) return; warmed = true;
      for (const img of Array.from(document.querySelectorAll<HTMLImageElement>('main img'))) {
        img.loading = 'eager';
        try { await img.decode(); } catch { /* broken or detached: skip */ }
      }
    };
    const idle = (cb: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200));
    const onLoad = () => setTimeout(() => idle(() => { void warm(); }), 2500);   // well after the first screen is done, never competing with it
    if (document.readyState === 'complete') onLoad(); else window.addEventListener('load', onLoad, { once: true });
    return () => {
      window.removeEventListener('load', onLoad);
      window.removeEventListener('load', refresh); window.removeEventListener('resize', onResize); ScrollTrigger.removeEventListener('refreshInit', setVh);
      unMagnet(); gsap.ticker.remove(tick); ln.destroy(); lenis = null;
    };
  }, [staticMode]);

  return (
    <Ready.Provider value={ready}>
      <div id="smooth-wrapper"><div id="smooth-content">{children}</div></div>
    </Ready.Provider>
  );
}

/** Pause/resume the smoothed scroll while a native modal <dialog> is open.
 *  No overflow:hidden on html/body (it removes the scrollbar and shifts the layout); the dialog's own
 *  overscroll-behavior keeps native scrolling contained, Lenis only has to stop listening to the wheel. */
export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop(); else lenis?.start();
}

/** Re-measure all triggers (after the language, and with it the text height, changes). */
export function refreshScroll() { ScrollTrigger.refresh(); }

/** Glide to the section that contains `hash` (menu and search links). */
export function goToSection(hash: string) {
  if (document.documentElement.classList.contains('static')) {   // static page: native smooth scroll
    if (hash === '#top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (hash === '#top') { glideTo(0); return; }
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const pageY = (n: Element, edge: 'top' | 'bottom') => n.getBoundingClientRect()[edge] + window.scrollY;
  // a pinned block is measured through its pin spacer (its own box is fixed to the screen while pinned)
  const ref = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  // the footer waits under the events block: go to where it is fully uncovered (or the end of the page)
  const cover = el.hasAttribute('data-under') ? ref.previousElementSibling : null;
  if (cover) { glideTo(Math.min(ScrollTrigger.maxScroll(window), pageY(cover, 'bottom'))); return; }
  glideTo(pageY(ref, 'top'));
}

// Glide the native scroll (window.scrollTo with behavior: smooth is too quick over many screens). Any user input hands control back.
let glide: gsap.core.Tween | null = null;
function glideTo(y: number) {
  glide?.kill();
  const from = window.scrollY, dist = Math.abs(y - from);
  if (dist < 2) return;
  const duration = prefersReducedMotion() ? 0.01 : Math.min(2.6, 0.9 + (dist / window.innerHeight) * 0.08);   // longer for longer trips, capped
  if (lenis) { lenis.scrollTo(y, { duration, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) }); return; }   // user input interrupts it
  const pos = { y: from };
  const stop = () => glide?.kill();
  const input = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
  const done = () => input.forEach((e) => window.removeEventListener(e, stop));
  input.forEach((e) => window.addEventListener(e, stop, { passive: true }));
  glide = gsap.to(pos, {
    y,
    duration,
    ease: 'power3.inOut',
    onUpdate: () => window.scrollTo(0, pos.y),
    onComplete: done,
    onInterrupt: done,
  });
}

export { gsap, ScrollTrigger };


// ---------- "magnet": when the scroll stops between two blocks, glide on to the block in the direction of travel ----------
// Every screen-high block of <main> is a stop: the page settles with that block exactly filling the screen. A block taller than the
// screen is a free zone [its top, its bottom - one screen] (read it at any pace); a thin band (the running line) is no stop of its own.
const EPS = 3;
const SETTLE_MS = 140;   // stillness before the pull starts

function stops(): [number, number][] {
  const ih = window.innerHeight, max = ScrollTrigger.maxScroll(window);
  const out: [number, number][] = [];
  document.querySelectorAll<HTMLElement>("main > *").forEach((n) => {
    const el = n.classList.contains("pin-spacer") ? (n.firstElementChild as HTMLElement | null) : n;
    if (!el || el.hasAttribute("data-spacer")) return;
    const h = el.offsetHeight;
    if (h < ih * 0.4) return;
    // a pinned block is measured through its spacer: its own box is fixed to the screen while pinned
    const top = Math.min(max, Math.round(n.getBoundingClientRect().top + window.scrollY));
    out.push([top, Math.min(max, Math.max(top, Math.round(top + h - ih)))]);
  });
  out.push([max, max]);
  return out.sort((p, q) => p[0] - q[0]);
}

function snapTarget(y: number, dir: number) {
  const zs = stops();
  if (zs.some(([a, b]) => y >= a - EPS && y <= b + EPS)) return y;   // on a stop or inside a tall block: stay
  const pts = [...new Set(zs.flatMap(([a, b]) => [a, b]))].sort((p, q) => p - q);
  if (dir > 0) return pts.find((p) => p > y) ?? pts[pts.length - 1];
  if (dir < 0) return [...pts].reverse().find((p) => p < y) ?? pts[0];
  return pts.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), pts[0]);
}

/** A scrollable box under the pointer (the price table) that can still move in this direction keeps the wheel for itself. */
function innerScroller(target: EventTarget | null, dir: number) {
  for (let n = target instanceof Element ? target : null; n && n !== document.body; n = n.parentElement) {
    if (n.scrollHeight <= n.clientHeight + 1) continue;
    const oy = getComputedStyle(n).overflowY;
    if (oy !== "auto" && oy !== "scroll") continue;
    if (dir > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
  }
  return false;
}

/** Inside a block taller than the screen (none today, but text can grow): the wheel reads it freely until its edge. */
function insideTall(y: number, dir: number) {
  return stops().some(([a, b]) => b > a + EPS && (dir > 0 ? y >= a - EPS && y < b - EPS : y > a + EPS && y <= b + EPS));
}

function initMagnet(ln: Lenis) {
  if (prefersReducedMotion()) return () => {};
  let timer = 0, dir = 0, held = false, busyUntil = 0, lastWheel = 0, lastAbs = 0;
  // "gliding" ends on completion or, as a safety net (an interrupted glide never completes), shortly after its planned end
  const busy = () => performance.now() < busyUntil;
  const STEP = 0.9;

  // one gesture = one block: glide to the next stop in that direction, ignore the rest of the gesture
  const step = (d: number) => {
    const y = window.scrollY;
    const pts = [...new Set(stops().flatMap(([a, b]) => [a, b]))].sort((p, q) => p - q);
    const t = d > 0 ? pts.find((p) => p > y + EPS) : [...pts].reverse().find((p) => p < y - EPS);
    if (t === undefined) return;
    busyUntil = performance.now() + STEP * 1000 + 150; dir = d;
    ln.scrollTo(t, {
      duration: STEP, lock: true, force: true,
      easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
      onComplete: () => { busyUntil = 0; },
    });
  };

  const onWheel = (e: WheelEvent) => {
    if (ln.isStopped || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;   // open dialog, pinch-zoom, sideways swipe
    const d = Math.sign(e.deltaY);
    if (!d || innerScroller(e.target, d)) return;
    if (!busy() && insideTall(window.scrollY, d)) return;                                  // let Lenis scroll a tall block
    e.preventDefault(); e.stopPropagation();                                              // Lenis and the browser stay out of it
    const now = performance.now(), abs = Math.abs(e.deltaY);
    // a new gesture: after a pause, or a fresh push during the fading tail of a trackpad swipe
    const fresh = now - lastWheel > 220 || abs > lastAbs * 1.8 + 4;
    lastWheel = now; lastAbs = abs;
    if (!busy() && fresh) step(d);
  };

  const onKey = (e: KeyboardEvent) => {
    if (ln.isStopped || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target as HTMLElement;
    if (el.closest("input, textarea, select, [contenteditable], dialog")) return;
    const down = ["PageDown", "ArrowDown"].includes(e.key) || (e.key === " " && !e.shiftKey && !el.closest("button, a"));
    const up = ["PageUp", "ArrowUp"].includes(e.key) || (e.key === " " && e.shiftKey && !el.closest("button, a"));
    if (!down && !up) return;
    e.preventDefault();
    if (!busy()) step(down ? 1 : -1);
  };

  // anything else that leaves the page between two blocks (scrollbar drag, Home/End, a resize) settles on the nearest block
  const settle = () => {
    timer = 0;
    if (held || busy() || ln.isStopped) return;
    const y = window.scrollY, t = snapTarget(y, dir);
    if (Math.abs(t - y) < 2) return;
    ln.scrollTo(t, { duration: 0.6, easing: (x) => 1 - Math.pow(1 - x, 3) });
  };
  const onScroll = () => {
    if (ln.direction) dir = ln.direction;
    clearTimeout(timer); timer = window.setTimeout(settle, SETTLE_MS);
  };
  const down = () => { held = true; };
  const up = () => { held = false; clearTimeout(timer); timer = window.setTimeout(settle, SETTLE_MS); };
  ln.on("scroll", onScroll);
  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("keydown", onKey);
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  window.addEventListener("resize", onScroll);
  return () => {
    ln.off("scroll", onScroll); clearTimeout(timer);
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up);
    window.removeEventListener("resize", onScroll);
  };
}
