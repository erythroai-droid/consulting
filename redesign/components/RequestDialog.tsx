'use client';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { lockScroll } from '@/lib/scroll';
import LeadForm from './LeadForm';

type Kind = 'call' | 'buy' | 'catalog';
type Detail = { kind: Kind; firm?: string; price?: string };
const EVT = 'psb:request';

/** Open the request dialog from anywhere (header, hero, catalog rows). */
export const openRequest = (d: Detail) => window.dispatchEvent(new CustomEvent<Detail>(EVT, { detail: d }));

const TEXT: Record<Kind, [string, string]> = {
  call: ['d_call_h', 'd_call_p'],
  buy: ['d_buy_h', 'd_buy_p'],
  catalog: ['d_cat_h', 'd_cat_p'],
};

/**
 * Native modal <dialog>: the browser gives the inert page, focus containment, Esc / back gesture and focus return.
 * closedby="any" adds click-outside where supported; elsewhere a pointer-position fallback does the same.
 */
export default function RequestDialog() {
  const { t } = useI18n();
  const dlg = useRef<HTMLDialogElement>(null);
  const [d, setD] = useState<Detail>({ kind: 'call' });

  useEffect(() => {
    const node = dlg.current!;
    const open = (e: Event) => {
      setD((e as CustomEvent<Detail>).detail);
      if (!node.open) { node.showModal(); lockScroll(true); }
    };
    const closed = () => lockScroll(false);
    window.addEventListener(EVT, open);
    node.addEventListener('close', closed);

    let off = () => {};
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      // press and release both outside the box (a text-selection drag ending on the backdrop does not close it)
      const outside = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let down = false;
      const pd = (e: PointerEvent) => { down = outside(e); };
      const pu = (e: PointerEvent) => { if (down && outside(e)) node.close(); };
      node.addEventListener('pointerdown', pd); node.addEventListener('pointerup', pu);
      off = () => { node.removeEventListener('pointerdown', pd); node.removeEventListener('pointerup', pu); };
    }
    return () => { window.removeEventListener(EVT, open); node.removeEventListener('close', closed); off(); };
  }, []);

  const [h, p] = TEXT[d.kind];
  const fields = d.kind === 'catalog' ? (['name', 'email'] as const) : (['name', 'phone'] as const);
  return (
    <dialog ref={dlg} className="dlg" aria-labelledby="dlg-h" {...({ closedby: 'any' } as object)}>
      <form method="dialog" className="dlg-x-wrap">
        <button className="dlg-x" aria-label={t('close')}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>
      </form>
      <span className="dlg-mark" aria-hidden />
      <h2 id="dlg-h">{t(h)}</h2>
      {d.firm && <p className="dlg-firm"><b>{d.firm}</b><span>{d.price}</span></p>}
      <p className="dlg-p">{t(p)}</p>
      <LeadForm key={`${d.kind}-${d.firm ?? ''}`} fields={[...fields]} required={[...fields]} submit={t('d_send')}
        hidden={d.firm ? { firm: d.firm } : undefined} focusFirst />
    </dialog>
  );
}
