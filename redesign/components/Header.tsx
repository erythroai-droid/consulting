'use client';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { LANGS, useI18n } from '@/lib/i18n';
import { goToSection, lockScroll, refreshScroll } from '@/lib/scroll';
import { BRAND, BRAND_FULL, NAV, PHONE } from '@/lib/site';
import { openRequest } from './RequestDialog';
import Flag from './Flag';

/** Logo tile: the mockup's gold column with the emblem. */
export function Logo({ small = false }: { small?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={`logo${small ? ' sm' : ''}`}>
      <img src="/img/logo.svg?v=4" alt="" width={288} height={80} />
      <span className="logo-t"><b>{BRAND}</b><i>{t('brand_sub')}</i></span>
    </span>
  );
}

/**
 * Fixed header: logo, two-line navigation (title + caption, as in the mockup), phone, language, menu button.
 * Turns light/dark with the section under it and gets a solid backdrop once the page has moved.
 * On narrow screens the navigation lives in a swipeable drawer (a modal <dialog> with a scroll-snap sheet).
 */
export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState('');
  const drawer = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  const pending = useRef<string | null>(null);

  // tone + active item from what is under the header line
  useEffect(() => {
    let raf = 0;
    const on = () => {
      raf = 0;
      setSolid(window.scrollY > 40);
      const els = document.elementsFromPoint(window.innerWidth / 2, 44);
      const sec = els.map((e) => e.closest<HTMLElement>('[data-tone]')).find(Boolean);
      setDark(sec ? sec.dataset.tone === 'dark' : false);
      const mid = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * 0.45)
        .map((e) => e.closest<HTMLElement>('section[id], footer[id]')).find(Boolean);
      setActive(mid ? `#${mid.id}` : '');
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(on); };
    on();
    // a reload in the middle of the page restores the scroll position later (and the preloader may hold it),
    // sometimes without a scroll event reaching us: look again so the big logo never sits over a section
    const late = [300, 1000, 2200].map((ms) => setTimeout(ask, ms));
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    window.addEventListener('load', ask);
    return () => {
      window.removeEventListener('scroll', ask); window.removeEventListener('resize', ask); window.removeEventListener('load', ask);
      late.forEach(clearTimeout); cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => { refreshScroll(); }, [lang]);   // text height changes with the language

  // ---- drawer (modern-web-guidance: navigation-drawer) ----
  useEffect(() => {
    const dlg = drawer.current!, sc = scroller.current!, sh = sheet.current!;
    // innerWidth is 0 in a tab that is not laid out yet (hidden pane, background tab): keep the threshold finite
    const visible = 1 / Math.max(window.innerWidth, 320);
    const io = new IntersectionObserver((entries) => {
      const e = entries.at(-1)!;
      if (e.intersectionRatio < visible && dlg.open) {
        dlg.close(); lockScroll(false);
        openBtn.current?.setAttribute('aria-expanded', 'false');
      }
      if (e.intersectionRatio > 0.99) openBtn.current?.setAttribute('aria-expanded', 'true');
    }, { root: dlg, threshold: [visible, 0.99, 1] });
    io.observe(sh);
    // a menu link was chosen: go there once the dialog is closed and has returned focus to the menu button
    // (that focus would cancel a smooth scroll started earlier)
    const onClose = () => {
      lockScroll(false);
      openBtn.current?.setAttribute('aria-expanded', 'false');
      const h = pending.current;
      if (h) { pending.current = null; setTimeout(() => goToSection(h), 60); }
    };
    dlg.addEventListener('close', onClose);
    let fallback = () => {};
    if (!CSS.supports('animation-timeline: scroll()')) {
      const f = () => dlg.style.setProperty('--drawer-backdrop', String(Math.max(0, 1 - sc.scrollLeft / sh.offsetWidth)));
      sc.addEventListener('scroll', f, { passive: true });
      fallback = () => sc.removeEventListener('scroll', f);
    }
    const tap = (e: Event) => { if (!sh.contains(e.target as Node)) closeDrawer(); };
    const cancel = (e: Event) => { if (e.cancelable) { e.preventDefault(); closeDrawer(); } };
    dlg.addEventListener('click', tap);
    dlg.addEventListener('cancel', cancel);
    return () => { io.disconnect(); fallback(); dlg.removeEventListener('click', tap); dlg.removeEventListener('cancel', cancel); dlg.removeEventListener('close', onClose); };
  }, []);

  const openDrawer = async () => {
    const dlg = drawer.current!, sc = scroller.current!;
    dlg.showModal(); lockScroll(true);
    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      sc.scrollTo({ left: sc.offsetWidth, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    sc.scrollTo({ left: 0, behavior: 'auto' });
    settle(0);
  };
  const closeDrawer = () => { const sc = scroller.current!; sc.scrollTo({ left: sc.offsetWidth, behavior: 'auto' }); settle(1); };
  // safety net: if a smooth programmatic scroll gets dropped (seen with touch emulation), land on the snap stop anyway
  const settle = (closed: 0 | 1) => setTimeout(() => {
    const dlg = drawer.current, sc = scroller.current, sh = sheet.current;
    if (!dlg?.open || !sc || !sh) return;
    const want = closed ? sc.offsetWidth : 0;
    if (Math.abs(sc.scrollLeft - Math.min(want, sc.scrollWidth - sc.clientWidth)) > 4) sc.scrollTo({ left: want, behavior: 'instant' });
  }, 800);

  const go = (e: MouseEvent, href: string) => { e.preventDefault(); goToSection(href); };
  const goFromDrawer = (e: MouseEvent, href: string) => { e.preventDefault(); pending.current = href; closeDrawer(); };

  return (
    <>
      <header className={`hdr${solid ? ' solid' : ''}${dark ? ' on-dark' : ''}`}>
        <a href="#top" className="hdr-logo" aria-label={BRAND_FULL} onClick={(e) => go(e, '#top')}><Logo small={solid} /></a>
        <nav className="hdr-nav" aria-label={t('menu')}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={active === n.href ? 'on' : ''} aria-current={active === n.href ? 'true' : undefined} onClick={(e) => go(e, n.href)}>
              <b>{t(n.t)}</b><span>{t(n.s)}</span>
            </a>
          ))}
        </nav>
        <div className="hdr-r">
          <div className="hdr-tel">
            <a href={PHONE.href}>{PHONE.label}</a>
            <button type="button" onClick={() => openRequest({ kind: 'call' })}>{t('call_order')}</button>
          </div>
          <div className="lang" role="group" aria-label={t('lang')}>
            {LANGS.map((l) => (
              <button key={l.code} type="button" className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)} title={l.name}>
                <Flag code={l.code} size={16} />{l.label}
              </button>
            ))}
          </div>
          <button ref={openBtn} type="button" className="burger" aria-label={t('menu')} aria-expanded="false" aria-controls="drawer" onClick={openDrawer}>
            <span /><span />
          </button>
        </div>
      </header>

      <dialog ref={drawer} id="drawer" className="drw" aria-label={t('menu')}>
        <div ref={scroller} className="drw-scroller">
          <nav ref={sheet} className="drw-sheet">
            <div className="drw-top">
              <Logo />
              <button type="button" className="drw-x" aria-label={t('close')} autoFocus onClick={closeDrawer}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.4" /></svg>
              </button>
            </div>
            <ul>
              {NAV.map((n, i) => (
                <li key={n.href} style={{ '--i': i } as React.CSSProperties}>
                  <a href={n.href} onClick={(e) => goFromDrawer(e, n.href)}><i>0{i + 1}</i><b>{t(n.t)}</b><span>{t(n.s)}</span></a>
                </li>
              ))}
            </ul>
            <div className="drw-foot">
              <a href={PHONE.href} className="drw-tel">{PHONE.label}</a>
              <div className="lang" role="group" aria-label={t('lang')}>
                {LANGS.map((l) => (
                  <button key={l.code} type="button" className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>
                    <Flag code={l.code} size={16} />{l.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
