'use client';
import { FormEvent, useId, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

type Field = 'name' | 'phone' | 'email' | 'question';
type Props = {
  fields: Field[];
  required: Field[];
  submit: string;
  className?: string;
  hidden?: Record<string, string>;     // extra data sent with the request (e.g. the firm being bought)
  onDone?: () => void;
  focusFirst?: boolean;
};

const AUTO: Record<Field, { type: string; ac: string; im?: 'tel' | 'email' }> = {
  name: { type: 'text', ac: 'name' },
  phone: { type: 'tel', ac: 'tel', im: 'tel' },
  email: { type: 'email', ac: 'email', im: 'email' },
  question: { type: 'text', ac: 'off' },
};
const LABEL: Record<Field, string> = { name: 'f_name', phone: 'f_phone', email: 'f_email', question: 'f_question' };
const ERR: Partial<Record<Field | 'agree', string>> = { name: 'f_err_name', phone: 'f_err_phone', email: 'f_err_email', agree: 'f_err_agree' };

/** Validity of one value (localised messages, so the form uses noValidate and checks itself). */
function check(f: Field | 'agree', v: string | boolean, req: boolean): boolean {
  if (f === 'agree') return v === true;
  const s = String(v).trim();
  if (!s) return !req;
  if (f === 'phone') return s.replace(/\D/g, '').length >= 10;
  if (f === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  return true;
}

/**
 * Lead form shared by the contact block and the request dialog.
 * Visible labels above the fields, autocomplete hints, errors only after the user leaves a field they edited
 * (or on submit, which then moves focus to the first invalid field), cleared while typing; result announced in a status region.
 */
export default function LeadForm({ fields, required, submit, className = '', hidden, onDone, focusFirst }: Props) {
  const { t } = useI18n();
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const edited = useRef(new Set<string>());
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'ok'>('idle');
  const [status, setStatus] = useState('');

  const value = (name: string): string | boolean => {
    const el = form.current?.elements.namedItem(name) as HTMLInputElement | null;
    return el ? (el.type === 'checkbox' ? el.checked : el.value) : '';
  };
  const validate = (name: Field | 'agree') => check(name, value(name), name === 'agree' || required.includes(name as Field));

  const onBlur = (name: Field | 'agree') => {
    if (!edited.current.has(name)) return;
    setErrs((e) => ({ ...e, [name]: !validate(name) }));
  };
  const onInput = (name: Field | 'agree') => {
    edited.current.add(name);
    if (errs[name] && validate(name)) setErrs((e) => ({ ...e, [name]: false }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    const all: (Field | 'agree')[] = [...fields, 'agree'];
    const next: Record<string, boolean> = {};
    for (const f of all) next[f] = !validate(f);
    setErrs(next);
    const bad = all.find((f) => next[f]);
    if (bad) {
      setStatus(t('f_fix'));
      (form.current?.elements.namedItem(bad) as HTMLElement | null)?.focus();
      return;
    }
    setState('sending'); setStatus(t('f_sending'));
    // demo: nothing is sent; wire a real endpoint here (POST FormData)
    void new FormData(form.current!);
    await new Promise((r) => setTimeout(r, 700));
    form.current?.reset(); edited.current.clear();
    setState('ok'); setStatus(t('f_ok'));
    onDone?.();
    setTimeout(() => { setState('idle'); setStatus(''); }, 6000);
  };

  return (
    <form ref={form} className={`lf ${className}`} noValidate onSubmit={onSubmit} method="post" action="#">
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => {
        const id = `${uid}-${f}`, req = required.includes(f), bad = !!errs[f], a = AUTO[f];
        return (
          <div key={f} className={`fld fld-${f}${bad ? ' bad' : ''}`}>
            <label htmlFor={id}>{t(LABEL[f])}{req ? <span aria-hidden> *</span> : <small> · {t('f_opt')}</small>}</label>
            {f === 'question' ? (
              <textarea id={id} name={f} rows={6} onBlur={() => onBlur(f)} onInput={() => onInput(f)} />
            ) : (
              <input id={id} name={f} type={a.type} autoFocus={focusFirst && f === fields[0]} autoComplete={a.ac} inputMode={a.im} required={req}
                aria-invalid={bad || undefined} aria-describedby={bad ? `${id}-e` : undefined}
                enterKeyHint="next" spellCheck={f === 'email' ? false : undefined} autoCapitalize={f === 'email' ? 'none' : undefined}
                onBlur={() => onBlur(f)} onInput={() => onInput(f)} />
            )}
            {ERR[f] && <span id={`${id}-e`} className="fld-err">{bad ? t(ERR[f]!) : ''}</span>}
          </div>
        );
      })}
      <div className={`agree${errs.agree ? ' bad' : ''}`}>
        <input id={`${uid}-agree`} name="agree" type="checkbox" required defaultChecked
          aria-invalid={errs.agree || undefined} aria-describedby={errs.agree ? `${uid}-agree-e` : undefined}
          onChange={() => { onInput('agree'); setErrs((e) => ({ ...e, agree: !validate('agree') })); }} />
        <label htmlFor={`${uid}-agree`}>{t('f_agree')}</label>
        <span id={`${uid}-agree-e`} className="fld-err">{errs.agree ? t('f_err_agree') : ''}</span>
      </div>
      <div className="lf-foot">
        <button type="submit" className="btn solid" disabled={state === 'sending'}>{submit} <span className="arr" aria-hidden>→</span></button>
        <p className={`lf-status ${state}`} role="status">{status}</p>
      </div>
      <p className="lf-demo">{t('f_demo')}</p>
    </form>
  );
}
