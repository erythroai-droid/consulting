'use client';
import { CSSProperties, MouseEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import LeadForm from './LeadForm';
import { openRequest } from './RequestDialog';
import { useI18n } from '@/lib/i18n';
import { gsap, goToSection, prefersReducedMotion, ScrollTrigger, useScrollReady, useStaticMode } from '@/lib/scroll';
import { ADDRESS, BRAND_FULL, CURRENCY, FIRMS, FOOTER_NAV, HERO, MAP_URL, pad, PARTNERS, PHONE, REVIEWS, SERVICES } from '@/lib/site';

/**
 * A dark screen-high block stays where it is while the next block rides up over it
 * (pinned, no extra spacing, from "fills the screen" until the next block's top reaches the top).
 */
function useStack(ref: RefObject<HTMLElement | null>) {
  const ready = useScrollReady();
  useEffect(() => {
    if (!ready) return;
    const node = ref.current!;
    let next = node.nextElementSibling as HTMLElement | null;
    while (next && next.hasAttribute('data-spacer')) next = next.nextElementSibling as HTMLElement | null;
    if (!next) return;
    const st = ScrollTrigger.create({
      trigger: node,
      start: () => (node.offsetHeight > window.innerHeight + 2 ? 'bottom bottom' : 'top top'),
      endTrigger: next, end: 'top top',
      pin: true, pinSpacing: false, invalidateOnRefresh: true,
    });
    return () => st.kill();
  }, [ready, ref]);
}

/**
 * Horizontal swipe (finger or pen) on a slider: left = next, right = previous.
 * The element gets touch-action: pan-y in CSS, so the page still scrolls vertically and the browser never takes a
 * sideways move for itself. A move counts when it is mostly horizontal and longer than 45px.
 */
function useSwipe(ref: RefObject<HTMLElement | null>, onSwipe: (d: 1 | -1) => void) {
  const cb = useRef(onSwipe);
  useEffect(() => { cb.current = onSwipe; });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let x = 0, y = 0, id = -1;
    const down = (e: PointerEvent) => { if (e.pointerType === "mouse") return; id = e.pointerId; x = e.clientX; y = e.clientY; };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      const dx = e.clientX - x, dy = e.clientY - y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) cb.current(dx < 0 ? 1 : -1);
    };
    const cancel = () => { id = -1; };
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", cancel);
    return () => { node.removeEventListener("pointerdown", down); node.removeEventListener("pointerup", up); node.removeEventListener("pointercancel", cancel); };
  }, [ref]);
}

/** Mask icon: the mockup's black SVG icons drawn in currentColor (gold on hover). */
function Ico({ src, className = '' }: { src: string; className?: string }) {
  return <span className={`ico ${className}`} style={{ '--src': `url(${src})` } as CSSProperties} aria-hidden />;
}

function Arrow({ dir = 1 }: { dir?: 1 | -1 }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M0 7h16M10 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Section heading as in the mockup: uppercase serif with a gold square behind its first letters (grows in on reveal). */
function Head({ n, k, h1, h2, id }: { n?: string; k: string; h1: string; h2: string; id?: string }) {
  const ready = useScrollReady();
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const node = mark.current!;
    const tw = gsap.fromTo(node, { scaleY: 0 }, {
      scaleY: 1, duration: 1.1, ease: 'expo.out', paused: true,
    });
    const st = ScrollTrigger.create({ trigger: node, start: 'top 85%', once: true, onEnter: () => tw.play() });
    if (node.getBoundingClientRect().top < window.innerHeight * 0.85) tw.play();
    return () => { st.kill(); tw.kill(); gsap.set(node, { clearProps: 'transform' }); };
  }, [ready]);
  return (
    <div className="sec-head">
      <span ref={mark} className="mark" aria-hidden />
      <Reveal from="left"><small>{n ? <i>{n}</i> : null}{k}</small></Reveal>
      <Reveal delay={80}><h2 id={id}>{h1} <em>{h2}</em></h2></Reveal>
    </div>
  );
}

const SLIDE_MS = 7000;

function HeroText({ h1, h2, live }: { h1: string; h2: string; live?: 'off' | 'polite' }) {
  const { t } = useI18n();
  return (
    <div className="hero-in">
      <p className="hero-k">{t('hero_k')}</p>
      {/* every slide's title sits invisibly in the same grid cell, so the block keeps the height of the tallest one
          and the buttons below never move when the title changes */}
      <div className="hero-tt">
        {HERO.map((h) => (
          <p key={h.src} className="hero-ghost" aria-hidden>
            <span><b>{t(h.h1)}</b></span>
            <span><b><em>{t(h.h2)}</em></b></span>
          </p>
        ))}
        <h1 aria-live={live}>
          <span><b>{h1}</b></span>
          <span><b><em>{h2}</em></b></span>
        </h1>
      </div>
      <div className="hero-foot">
        <p>{t('hero_p')}</p>
        <div className="hero-cta">
          <a href="#catalog" className="btn solid" onClick={(e) => { e.preventDefault(); goToSection('#catalog'); }}>{t('hero_cta')} <span className="arr" aria-hidden>→</span></a>
          <button type="button" className="btn" onClick={() => openRequest({ kind: 'call' })}>{t('call_order')}</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero: monochrome photo slideshow behind the mockup's gold column (multiplied over the photo).
 * Slides change with a directional clip wipe; autoplay shows its progress and can be paused (WCAG 2.2.2),
 * starts paused for reduced motion and stops while the hero is off screen.
 * Pinned: the services block rides up over it while the photo scales down into the dark.
 */
export function Hero({ onLoadProgress }: { onLoadProgress: (v: number) => void }) {
  const { t } = useI18n();
  const ready = useScrollReady();
  const el = useRef<HTMLElement>(null);
  const first = useRef<HTMLImageElement>(null);
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const dir = useRef(1);
  const busy = useRef(false);
  useStack(el);

  useEffect(() => { if (prefersReducedMotion()) setPlaying(false); }, []);

  // entrance (gold column, title, controls) starts once the hero sits where it stays: after the pin wraps it on the animated page
  // (useStack above runs first), right away on the static one, and not before the first photo is in (or the preloader gave up)
  const staticMode = useStaticMode();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = first.current;
    const done = () => setLoaded(true);
    if (!img || img.complete) { done(); return; }
    img.addEventListener('load', done); img.addEventListener('error', done);
    const late = setTimeout(done, 1800);
    return () => { clearTimeout(late); img.removeEventListener('load', done); img.removeEventListener('error', done); };
  }, []);
  // GSAP, not CSS animations: a ScrollTrigger refresh moves the pinned hero out of its spacer and back, which restarts CSS animations
  useEffect(() => {
    const root = el.current;
    if (!root || !loaded || !(ready || staticMode) || root.classList.contains('go')) return;
    root.classList.add('go');
    if (prefersReducedMotion()) return;
    const fade = { autoAlpha: 0, y: 14 }, shown = { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', clearProps: 'opacity,visibility,transform' };
    gsap.timeline()
      .fromTo(root.querySelector('.hero-gold'), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform' }, 0.15)
      .fromTo(root.querySelectorAll('.hero-in h1 b'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.15, clearProps: 'transform' }, 0.35)
      .fromTo(root.querySelector('.hero-k'), fade, shown, 0.5)
      .fromTo(root.querySelector('.hero-foot'), fade, shown, 0.8)
      .fromTo(root.querySelectorAll('.hero-bar > *'), fade, shown, 1);
  }, [loaded, ready, staticMode]);

  // preloader leaves as soon as the first photo is there
  useEffect(() => {
    const img = first.current;
    if (!img) return;
    onLoadProgress(40);
    const done = () => onLoadProgress(100);
    if (img.complete) { done(); return; }
    img.addEventListener('load', done); img.addEventListener('error', done);
    return () => { img.removeEventListener('load', done); img.removeEventListener('error', done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // once the page moves, nothing keeps animating under the block that rides over the hero (repaints there made block 01 flicker)
  useEffect(() => {
    const node = el.current!;
    const on = () => node.classList.toggle('held', window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // autoplay only while the hero is on screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6] });
    io.observe(el.current!);
    return () => io.disconnect();
  }, []);

  const go = useCallback((to: number, d: 1 | -1) => {
    if (busy.current) return;
    setI((cur) => {
      const n = (to + HERO.length) % HERO.length;
      if (n === cur) return cur;
      dir.current = d; setPrev(cur);
      return n;
    });
  }, []);
  const at = useRef(0);
  at.current = i;
  useSwipe(el, (d) => go(at.current + d, d));

  // slide change: the new photo wipes in from the side it comes from, the old one drifts and dims; title lines swap
  useEffect(() => {
    if (prev === null) return;
    const root = el.current!;
    const inc = root.querySelector<HTMLElement>(`[data-slide="${i}"]`);
    const out = root.querySelector<HTMLElement>(`[data-slide="${prev}"]`);
    const lines = root.querySelectorAll('.hero-in h1 b');
    if (prefersReducedMotion() || !inc || !out) { setPrev(null); return; }
    busy.current = true;
    const d = dir.current;
    const tl = gsap.timeline({ onComplete: () => { busy.current = false; setPrev(null); } });
    tl.fromTo(inc, { clipPath: d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.15, ease: 'expo.inOut' }, 0)
      // no zoom on a slide change (owner's call): the photo keeps one size, only a slight sideways drift under the wipe
      .fromTo(inc.querySelector('img'), { xPercent: d * 3 }, { xPercent: 0, duration: 1.6, ease: 'expo.out' }, 0)
      .to(out.querySelector('img'), { xPercent: -d * 8, duration: 1.15, ease: 'expo.inOut' }, 0);
    if (lines?.length) tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.95, stagger: 0.09, ease: 'expo.out' }, 0.35);
    return () => { tl.kill(); busy.current = false; gsap.set([inc, out, inc.querySelector('img'), out.querySelector('img')], { clearProps: 'all' }); };
  }, [i, prev]);

  // scroll: the content lifts away and the photo sinks into the dark as the next block covers it
  useEffect(() => {
    if (!ready) return;
    const root = el.current!;
    const next = (root.parentElement?.classList.contains('pin-spacer') ? root.parentElement : root).nextElementSibling as HTMLElement | null;
    if (!next) return;
    const media = root.querySelector('.hero-media'), inner = root.querySelectorAll('.hero-in'), bar = root.querySelector('.hero-bar');
    const tl = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } })
      .to(inner, { yPercent: -18, autoAlpha: 0, ease: 'none', force3D: true }, 0)
      .to(bar, { autoAlpha: 0, ease: 'none', duration: 0.4, force3D: true }, 0)
      .to(media, { scale: 1.1, opacity: 0.25, ease: 'none', force3D: true }, 0);
    const off = ScrollTrigger.create({ trigger: next, start: 'top top', end: 'max', onToggle: (s) => root.classList.toggle('off', s.isActive) });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); off.kill(); root.classList.remove('off'); gsap.set([media, inner, bar], { clearProps: 'all' }); };
  }, [ready]);

  const run = playing && visible;
  const s = HERO[i];
  return (
    <section ref={el} id="top" className="hero" data-tone="dark" aria-roledescription="carousel" aria-label={t('hero_k')}>
      <div className="hero-media" aria-hidden>
        {HERO.map((h, k) => (
          <div key={h.src} data-slide={k} className={`hero-slide${k === i ? ' on' : ''}${k === prev ? ' was' : ''}`}>
            <img ref={k === 0 ? first : undefined} src={h.src} srcSet={`${h.small} 960w, ${h.src} ${h.w}w`} sizes="100vw" alt="" width={h.w} height={h.h}
              fetchPriority={k === 0 ? 'high' : 'low'} loading={k === 0 ? undefined : 'lazy'} decoding="async" />
          </div>
        ))}
        <span className="hero-veil" />
      </div>
      {/* the mockup's yellow column: solid, on top of the photo (the slides change underneath), under the text and the logo */}
      <span className="hero-gold" aria-hidden />

      <HeroText h1={t(s.h1)} h2={t(s.h2)} live={run ? 'off' : 'polite'} />

      <div className="hero-bar">
        <a className="hero-addr" href={MAP_URL} target="_blank" rel="noopener">
          <Ico src="/icons/pin.svg" />
          <span><b>{ADDRESS}</b><i>{t('map')}</i></span>
        </a>
        <div className="hero-ctl">
          <button type="button" className="rnd gold" aria-label={t('hero_prev')} onClick={() => go(i - 1, -1)}><Arrow dir={-1} /></button>
          <div className="hero-dots">
            {HERO.map((h, k) => (
              <button key={h.src} type="button" className={k === i ? 'on' : ''} aria-label={`${k + 1} / ${HERO.length}`} aria-current={k === i ? 'true' : undefined}
                onClick={() => go(k, k > i ? 1 : -1)}>
                <span>{pad(k + 1)}</span>
                <i>{k === i && <b key={i} className={run ? "run" : undefined} style={{ animationDuration: `${SLIDE_MS}ms` }}
                  onAnimationEnd={() => go(i + 1, 1)} />}</i>
              </button>
            ))}
          </div>
          <button type="button" className="rnd" aria-label={t('hero_next')} onClick={() => go(i + 1, 1)}><Arrow /></button>
          <button type="button" className="rnd sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('pause') : t('play')}>
            {playing
              ? <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M1 0v12M9 0v12" stroke="currentColor" strokeWidth="2" /></svg>
              : <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>}
          </button>
        </div>
        <span className="hero-scroll" aria-hidden>{t('scroll')}<i /></span>
      </div>
    </section>
  );
}

/** Services: five tall tiles across the screen; the hovered one fills with gold like the mockup's active card. */
export function Services() {
  const { t } = useI18n();
  return (
    <section id="services" className="sec srv" data-tone="light" aria-labelledby="srv-h">
      <div className="srv-top">
        <Head n="01" k={t('srv_k')} h1={t('srv_h1')} h2={t('srv_h2')} id="srv-h" />
        <Reveal delay={160} className="srv-lead"><p>{t('hero_p')}</p></Reveal>
      </div>
      <ul className="srv-grid">
        {SERVICES.map((s, k) => (
          <li key={s.t}>
            <Reveal delay={70 * k} from="up">
              <a href={s.href} className="srv-card" onClick={(e: MouseEvent) => { e.preventDefault(); goToSection(s.href); }}>
                <i className="srv-n">{pad(k + 1)}</i>
                <Ico src={s.icon} className="srv-ico" />
                <h3>{t(s.t)}</h3>
                <p>{t(s.p)}</p>
                <span className="srv-go" aria-hidden><Arrow /></span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** About: why buy a ready-made company — layered photos with parallax, the checklist and the closing note. */
export function About() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const photo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const root = photo.current!;
    const img = root.querySelector('.ab-big img'), card = root.querySelector('.ab-card');
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo(img, { yPercent: -8, force3D: true }, { yPercent: 8, ease: 'none', force3D: true }, 0)
      .fromTo(card, { yPercent: 30 }, { yPercent: -30, ease: 'none' }, 0);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([img, card], { clearProps: 'transform' }); };
  }, [ready]);

  return (
    <section id="about" className="sec about" data-tone="light" aria-labelledby="ab-h">
      <Head n="02" k={t('adv_k')} h1={t('adv_h1')} h2={t('adv_h2')} id="ab-h" />
      <div className="ab-grid">
        <div ref={photo} className="ab-photos">
          <Reveal from="clip" className="ab-big">
            <img src="/img/desk.webp" srcSet="/img/desk-700.webp 700w, /img/desk.webp 1200w" sizes="(max-width: 900px) 100vw, 46vw" alt={t('adv_alt')} width={1200} height={896} loading="lazy" decoding="async" />
          </Reveal>
          <div className="ab-card">
            <img src="/img/planner.webp" alt="" width={438} height={339} loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="ab-copy">
          <Reveal><p className="lead">{t('adv_p')}</p></Reveal>
          <ul className="checks">
            {[1, 2, 3, 4].map((k) => (
              <li key={k}>
                <Reveal delay={60 * k} from="left">
                  <img src="/icons/shield.svg" alt="" width={17} height={21} />
                  <span>{t(`adv_l${k}`)}</span>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="ab-note"><p>{t('adv_note')}</p></Reveal>
        </div>
      </div>
      <Marquee />
    </section>
  );
}

/** Service names sliding sideways with the scroll, solid and outlined in turn: a band between About and the catalog. */
/**
 * The running line at the foot of About: it runs on its own (a CSS loop, also on phones), not with the scroll —
 * with one-block-per-gesture scrolling a scroll-driven line only twitched during the glide.
 * Two identical halves; the row moves by exactly one half per loop, so the seam never shows.
 */
export function Marquee() {
  const { t } = useI18n();
  const half = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4].map((k) => t(`marq${k}`));   // one half is wider than a 2560px screen
  return (
    <div className="marq" aria-hidden>
      <div className="marq-row">
        {[0, 1].map((h) => half.map((w, k) => <span key={`${h}-${k}`} className={k % 2 ? 'o' : ''}>{w}<i>✦</i></span>))}
      </div>
    </div>
  );
}

/** Catalog: semantic table that stacks into cards in a narrow container; a row opens the gold "buy" bar from the mockup. */
export function Catalog() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState<number>(0);
  const price = (n: number) => new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n);
  const row = (f: (typeof FIRMS)[number]) =>
    t('cat_row').replace('{ifns}', f.ifns).replace('{q}', String(f.q)).replace('{year}', String(f.year)).replace('{okved}', f.okved);

  return (
    <section id="catalog" className="sec cat" data-tone="light" aria-labelledby="cat-h">
      <div className="cat-top">
        <Head n="03" k={t('cat_k')} h1={t('cat_h1')} h2={t('cat_h2')} id="cat-h" />
        <Reveal delay={140}>
          <button type="button" className="dl" onClick={() => openRequest({ kind: 'catalog' })}>
            <Ico src="/icons/cloud.svg" className="dl-ico" />
            <span>{t('download')}</span>
          </button>
        </Reveal>
      </div>
      <Reveal from="up" delay={120}>
        <div className="tbl-wrap" data-lenis-prevent role="region" aria-labelledby="cat-cap" tabIndex={0}>
          <table className="tbl">
            <caption id="cat-cap" className="vh">{t('cat_caption')}</caption>
            <thead>
              <tr><th scope="col">{t('cat_no')}</th><th scope="col">{t('cat_name')}</th><th scope="col">{t('cat_tax')}</th><th scope="col">{t('cat_acc')}</th><th scope="col">{t('cat_price')}</th></tr>
            </thead>
            <tbody>
              {FIRMS.map((f, k) => (
                <FirmRows key={f.no} f={f} k={k} open={open === k} onToggle={() => setOpen(open === k ? -1 : k)}
                  text={row(f)} acc={t(f.acc)} price={price(f.price)} labels={[t('cat_no'), t('cat_tax'), t('cat_acc'), t('cat_price')]} buy={t('buy')} />
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      <div className="cat-foot">
        <p className="cat-hint">{t('cat_hint')}</p>
        <button type="button" className="btn" onClick={() => openRequest({ kind: 'catalog' })}>{t('to_catalog')} <span className="arr" aria-hidden>→</span></button>
      </div>
    </section>
  );
}

function FirmRows({ f, k, open, onToggle, text, acc, price, labels, buy }: {
  f: (typeof FIRMS)[number]; k: number; open: boolean; onToggle: () => void; text: string; acc: string; price: string; labels: string[]; buy: string;
}) {
  const id = `firm-${f.no}`;
  return (
    <>
      <tr className={`frow${open ? ' open' : ''}${k % 2 ? ' alt' : ''}`} onClick={onToggle}>
        <td data-label={labels[0]}>{f.no}</td>
        <th scope="row">
          <button type="button" aria-expanded={open} aria-controls={id} onClick={(e) => { e.stopPropagation(); onToggle(); }}>{f.name}</button>
        </th>
        <td data-label={labels[1]}>{text}</td>
        <td data-label={labels[2]}>{acc}</td>
        <td data-label={labels[3]} className="price">{price}</td>
      </tr>
      <tr id={id} className="buy-row" hidden={!open}>
        <td colSpan={5}>
          <button type="button" className="buy-bar" onClick={() => openRequest({ kind: 'buy', firm: `${f.name} · №${f.no}`, price })}>
            <span>{buy}</span><b>{f.name}</b><Arrow />
          </button>
        </td>
      </tr>
    </>
  );
}

const REVIEW_MS = 9000;

/** Reviews: a dark pinned screen, giant "Clients" sliding with the scroll; portrait + quote switch with a wipe. */
export function Reviews() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const el = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hold, setHold] = useState(false);
  const firstRun = useRef(true);
  useStack(el);

  useEffect(() => { if (prefersReducedMotion()) setPlaying(false); }, []);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tw = gsap.fromTo(word.current, { xPercent: 8 }, {
      xPercent: -22, ease: 'none',
      scrollTrigger: { trigger: el.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, [ready]);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (prefersReducedMotion() || !stage.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.rvw-photo img', { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1, ease: 'expo.out' });
      gsap.fromTo('.rvw-q.on > *', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' });
    }, stage);
    return () => ctx.revert();
  }, [i]);

  const go = (n: number) => setI((n + REVIEWS.length) % REVIEWS.length);
  useSwipe(stage, (d) => setI((cur) => (cur + d + REVIEWS.length) % REVIEWS.length));
  const r = REVIEWS[i];
  const run = playing && visible && !hold;
  return (
    <section ref={el} id="reviews" className="rvw" data-tone="dark" aria-labelledby="rvw-h"
      onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div className="dk-bg" aria-hidden><img src="/img/bg-dark.webp" alt="" width={1280} height={714} loading="lazy" decoding="async" /></div>
      <div ref={word} className="rvw-word" aria-hidden>{t('rev_mark')}</div>
      <Head n="04" k={t('rev_k')} h1={t('rev_h1')} h2={t('rev_h2')} id="rvw-h" />
      <div ref={stage} className="rvw-stage" aria-roledescription="carousel">
        <Reveal from="up" className="rvw-photo-wrap">
          <figure className="rvw-photo">
            <span className="rvw-dots" aria-hidden />
            <span className="rvw-sq" aria-hidden />
            <img key={r.img} src={r.img} alt="" width={r.w} height={r.h} loading="lazy" decoding="async" />
          </figure>
        </Reveal>
        <Reveal delay={120} className="rvw-q-wrap">
          {/* all quotes share one grid cell, so the block is as tall as the longest one and never changes height
              (a height change mid-page would move every pinned block below it) */}
          <div className="rvw-qs" aria-live={run ? 'off' : 'polite'}>
            {REVIEWS.map((x, k) => (
              <blockquote key={x.name} className={`rvw-q${k === i ? ' on' : ''}`} aria-hidden={k !== i} {...(k !== i ? { inert: true } : {})}>
                <Ico src="/icons/quotes.svg" className="q-ico" />
                <p>{t(x.text)}</p>
                <footer><b>{t(x.name)}</b><span>{t(x.role)}</span></footer>
              </blockquote>
            ))}
          </div>
          <div className="rvw-ctl">
            <button type="button" className="rnd gold" aria-label={t('rev_prev')} onClick={() => go(i - 1)}><Arrow dir={-1} /></button>
            <div className="rvw-dots-nav">
              {REVIEWS.map((x, k) => (
                <button key={x.name} type="button" className={k === i ? 'on' : ''} aria-label={`${t('rev_n')} ${k + 1}`} aria-current={k === i ? 'true' : undefined} onClick={() => go(k)}>
                  {k === i && <b key={i} className={run ? "run" : undefined} style={{ animationDuration: `${REVIEW_MS}ms` }} onAnimationEnd={() => go(i + 1)} />}
                </button>
              ))}
            </div>
            <button type="button" className="rnd" aria-label={t('rev_next')} onClick={() => go(i + 1)}><Arrow /></button>
            <button type="button" className="rnd sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('pause') : t('play')}>
              {playing
                ? <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M1 0v12M9 0v12" stroke="currentColor" strokeWidth="2" /></svg>
                : <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Partners: an endless running line of logo tiles (two identical halves, the track slides by one half).
 *  Hover or focus slows it to a stop; a visible button pauses it (WCAG 2.2.2); reduced motion gets a still, swipeable row. */
export function Partners() {
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (prefersReducedMotion()) setPaused(true); }, []);
  const set = [...PARTNERS, ...PARTNERS, ...PARTNERS];   // one half: wide enough to fill a 2560px screen
  return (
    <section className={`sec par${paused ? ' paused' : ''}`} data-tone="light" aria-labelledby="par-h">
      <div className="par-top">
        <Head n="05" k={t('par_k')} h1={t('par_h1')} h2={t('par_h2')} id="par-h" />
        <button type="button" className="rnd dark sm par-pause" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('play') : t('pause')}>
          {paused
            ? <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
            : <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M1 0v12M9 0v12" stroke="currentColor" strokeWidth="2" /></svg>}
        </button>
      </div>
      <Reveal from="up" className="par-run">
        <div className="par-track">
          {[0, 1].map((half) => (
            <ul key={half} className="par-half" aria-hidden={half === 1 || undefined}>
              {set.map((p, k) => (
                <li key={`${p.alt}-${k}`} aria-hidden={(half === 1 || k >= PARTNERS.length) || undefined}>
                  <div className="par-card"><img src={p.src} alt={half === 0 && k < PARTNERS.length ? p.alt : ''} width={p.w} height={p.h} loading="lazy" decoding="async" /></div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Contacts + footer in one block (they repeated each other): the question form from the mockup beside the photo,
 * phone and address, the footer menu, the brand across the full width and the copyright.
 */
const FOOTER_VIDEO = "/videos/professional-meeting-in-modern-office-with-diverse-2026-10-02-15-00-01-utc.mov";

export function Footer() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const el = useRef<HTMLElement>(null);
  const ph = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  // the backdrop video loads only when the contacts come near and plays only while they are on screen
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (prefersReducedMotion()) { v.preload = "metadata"; return; }   // a still first frame instead of motion
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
    }, { rootMargin: "200px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tw = gsap.fromTo(ph.current, { yPercent: 10 }, {
      yPercent: -4, ease: 'none', force3D: true, scrollTrigger: { trigger: ph.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, [ready]);

  // size the brand so one line exactly fills the content width
  useEffect(() => {
    const node = title.current;
    if (!node) return;
    const fit = () => {
      if (!el.current) return;   // fonts.ready can resolve after unmount
      node.style.fontSize = '100px'; node.style.width = 'max-content';
      const w = node.getBoundingClientRect().width || 1;
      node.style.width = '';
      const byWidth = ((document.documentElement.clientWidth - 2 * parseFloat(getComputedStyle(el.current!).paddingLeft)) / w) * 100;
      // on a static (phone) page the footer grows freely; otherwise the line is capped so the whole block fits one screen
      const byHeight = document.documentElement.classList.contains('static') ? Infinity : (window.innerHeight * 0.15) / 1;   // line .86 + padding .04 + .1 below so the letters are not cut
      const size = Math.min(byWidth, byHeight);
      node.style.fontSize = `${size}px`;
      // the demo studio frame (strip + CTA band) takes part of the screen: shrink the line by whatever still spills over
      const over = Number.isFinite(byHeight) ? el.current.offsetHeight - window.innerHeight : 0;
      if (over > 0) node.style.fontSize = `${Math.max(40, size - over / 0.95)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit); ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // the letters rise one after another as the end of the page comes into view
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const letters = title.current?.querySelectorAll('span');
    if (!letters?.length) return;
    const tw = gsap.fromTo(letters, { yPercent: 100 }, {
      yPercent: 0, stagger: 0.04, ease: 'none',
      scrollTrigger: { trigger: title.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(letters, { clearProps: 'transform' }); };
  }, [ready]);

  return (
    <footer ref={el} id="contacts" className="ftr" data-tone="dark" aria-labelledby="ct-h">
      {/* an office meeting as a darkened black-and-white backdrop (the grey comes from CSS) */}
      <div className="ft-bg" aria-hidden><div ref={ph} className="ft-bg-in">
        <video ref={vid} src={FOOTER_VIDEO} muted loop playsInline preload="none" disablePictureInPicture />
      </div></div>
      {/* one screen high: heading and contacts on the left, the form on the right, then menu, brand line and copyright */}
      <div className="ftr-main">
        <div className="ftr-l">
          <Head n="06" k={t('c_k')} h1={t('c_h1')} h2={t('c_h2')} id="ct-h" />
          <Reveal from="up" delay={120} className="ct-info">
            <dl>
              <div><dt>{t('c_phone')}</dt><dd><a href={PHONE.href}>{PHONE.label}</a></dd></div>
              <div><dt>{t('c_addr')}</dt><dd>{ADDRESS}<br /><a href={MAP_URL} target="_blank" rel="noopener" className="ln">{t('map')} ↗</a></dd></div>
            </dl>
          </Reveal>
        </div>
        <Reveal from="up" className="ct-form">
          <LeadForm fields={['name', 'phone', 'email', 'question']} required={['name', 'phone']} submit={t('f_send')} />
        </Reveal>
      </div>
      <nav className="ftr-nav" aria-label={t('menu')}>
        {FOOTER_NAV.map((n) => <a key={n.t} href={n.href} onClick={(e) => { e.preventDefault(); goToSection(n.href); }}>{t(n.t)}</a>)}
      </nav>
      <div ref={title} className="ftr-title" aria-hidden>
        {BRAND_FULL.toUpperCase().split('').map((c, k) => <span key={k}>{c === ' ' ? '\u00a0' : c}</span>)}
      </div>
      <div className="ftr-bot"><span>{t('f_rights')}</span><span>{t('f_made')}</span></div>
    </footer>
  );
}

/** Refresh the triggers once images below the fold have their size. */
export function useLateRefresh() {
  const ready = useScrollReady();
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 600);
    // safety net: whenever the page height changes (late images, language switch), re-measure the pins
    const main = document.querySelector('main')!;
    let h = main.offsetHeight, t = 0;
    const ro = new ResizeObserver(() => {
      if (Math.abs(main.offsetHeight - h) < 2) return;
      h = main.offsetHeight; clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    ro.observe(main);
    return () => { clearTimeout(id); clearTimeout(t); ro.disconnect(); };
  }, [ready]);
}

export { useStaticMode };
