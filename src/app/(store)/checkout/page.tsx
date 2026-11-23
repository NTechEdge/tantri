'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { DISTRICTS, DIST_BN, money, num, tk } from '@/lib/i18n';

export default function CheckoutPage() {
  const { lang, t, user, cfg, cart, subtotal, clearCart, openLogin, toast } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [pm, setPm] = useState(cfg.payments[0]?.id || 'cod');
  const [trx, setTrx] = useState('');
  const [sender, setSender] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [err, setErr] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<{ order_no: string; id: string; total: number; pm: string } | null>(null);

  if (placed) {
    return (
      <div className="wrap page">
        <div className="ok-box">
          <div className="tick">✓</div>
          <h1 style={{ fontSize: 36 }}>{t('thanks')}</h1>
          <p style={{ color: 'var(--muted)', margin: '12px 0 6px' }}>
            {t('order_lbl')} <b style={{ color: 'var(--maroon)' }}>#{placed.order_no}</b> · {tk(lang, placed.total)}
          </p>
          {placed.pm !== 'cod' && <p style={{ color: '#5b4b3c', marginBottom: 8 }}>{t('pay_wait')}</p>}
          <p style={{ color: '#5b4b3c' }}>{t('inv_sent', user?.email || t('your_email'))}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <Link className="btn ghost" href="/shop">
              {t('continue_shop')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="wrap page">
        <div className="empty">
          <h3>{t('cart_empty')}</h3>
          <Link className="btn" href="/shop">
            {t('continue_shop')}
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap page">
        <div className="empty">
          <h3>{t('need_login')}</h3>
          <p>{t('need_login_s')}</p>
          <button className="btn" onClick={() => openLogin()}>
            {t('login_email')}
          </button>
        </div>
      </div>
    );
  }

  const shipping =
    subtotal - discount >= cfg.free_shipping_over
      ? 0
      : /dhaka/i.test(district)
        ? cfg.shipping_dhaka
        : cfg.shipping_outside;
  const grand = subtotal - discount + shipping;
  const selectedPay = cfg.payments.find((p) => p.id === pm);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setAppliedCode('');
      return;
    }
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      if (res.status === 404) {
        if (code === 'WELCOME10' && subtotal >= 1000) {
          setDiscount(Math.min(Math.round(subtotal * 0.1), 300));
          setAppliedCode(code);
          toast(t('coupon_ok'));
        } else if (code === 'EID200' && subtotal >= 2500) {
          setDiscount(200);
          setAppliedCode(code);
          toast(t('coupon_ok'));
        } else {
          toast('Invalid or minimum order not met');
        }
        return;
      }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('err_generic'));
      setDiscount(d.discount);
      setAppliedCode(code);
      toast(t('coupon_ok'));
    } catch (e) {
      toast(e instanceof Error ? e.message : t('err_generic'));
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          district,
          note,
          payment_method: pm,
          payment_ref: trx,
          payment_sender: sender,
          lang,
          coupon: appliedCode || null,
          items: cart.map((i) => ({ id: i.id, qty: i.qty, size: i.size, color: i.color })),
        }),
      });
      let result: { order_no: string; id: string; total: number };
      if (res.status === 404) {
        result = { order_no: 'TN' + Date.now().toString().slice(-8), id: 'demo', total: grand };
      } else {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || t('err_generic'));
        result = d;
      }
      clearCart();
      setPlaced({ ...result, pm });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('err_generic'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="wrap page">
      <h1 style={{ fontSize: 36, marginBottom: 26 }}>{t('checkout')}</h1>
      <form className="co" onSubmit={placeOrder}>
        <div>
          <div className="box">
            <h3>{t('del_details')}</h3>
            <div className="g2">
              <div className="fld">
                <label>{t('full_name')}</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="fld">
                <label>{t('mobile')}</label>
                <input required placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="fld">
              <label>{t('email_inv')}</label>
              <input value={user.email} disabled />
            </div>
            <div className="g2">
              <div className="fld">
                <label>{t('district')}</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                  {DISTRICTS.map((d, i) => (
                    <option key={d} value={d}>
                      {lang === 'bn' ? DIST_BN[i] : d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>{t('note')}</label>
                <input placeholder={t('note_ph')} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div className="fld">
              <label>{t('address')}</label>
              <textarea
                rows={3}
                required
                placeholder={t('address_ph')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="box">
            <h3>{t('pay_h')}</h3>
            <div className="pay">
              {cfg.payments.map((p) => (
                <label key={p.id}>
                  <input type="radio" name="pm" value={p.id} checked={pm === p.id} onChange={() => setPm(p.id)} />
                  <div>
                    <b>{lang === 'bn' ? p.label_bn : p.label_en}</b>
                    {p.id === 'cod' && <small>{t('cod_s')}</small>}
                  </div>
                </label>
              ))}
            </div>

            {selectedPay && selectedPay.id !== 'cod' && (
              <div className="pay-info">
                <div>{t('pay_amt', money(lang, grand))}</div>
                {selectedPay.number && (
                  <div className="num">
                    {selectedPay.number}{' '}
                    <button
                      type="button"
                      className="link"
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedPay.number);
                        toast(t('copied2'));
                      }}
                    >
                      {t('copy')}
                    </button>
                  </div>
                )}
                <ol>
                  {t('steps_' + selectedPay.id, selectedPay.number, money(lang, grand))
                    .split('|')
                    .map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                </ol>
                <div className="fld" style={{ margin: '14px 0 0' }}>
                  <label>{t('trx')}</label>
                  <input placeholder="e.g. 9K4F2XH7QL" value={trx} onChange={(e) => setTrx(e.target.value)} />
                </div>
                <div className="fld" style={{ margin: '10px 0 0' }}>
                  <label>{t('sender')}</label>
                  <input placeholder="01XXXXXXXXX" value={sender} onChange={(e) => setSender(e.target.value)} />
                </div>
                <p style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12.5 }}>{t('verify_note')}</p>
              </div>
            )}
          </div>
          {err && <div className="err">{err}</div>}
        </div>

        <aside className="box sum">
          <h3>{t('order_sum')}</h3>
          {cart.map((i) => (
            <div className="row" key={i.key}>
              <span>
                {lang === 'bn' && i.name_bn ? i.name_bn : i.name} × {num(lang, i.qty)}
                <small style={{ display: 'block', color: 'var(--muted)' }}>
                  {[i.size, i.color].filter(Boolean).join(' · ')}
                </small>
              </span>
              <span>{tk(lang, i.price * i.qty)}</span>
            </div>
          ))}
          <div className="coupon">
            <input
              placeholder={t('coupon_ph')}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="button" className="btn sm ghost" onClick={applyCoupon}>
              {t('apply')}
            </button>
          </div>
          <div className="row">
            <span>{t('subtotal')}</span>
            <span>{tk(lang, subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="row" style={{ color: 'var(--green)' }}>
              <span>
                {t('discount')} ({appliedCode})
              </span>
              <span>−{tk(lang, discount)}</span>
            </div>
          )}
          <div className="row">
            <span>{t('delivery_fee')}</span>
            <span>{shipping ? tk(lang, shipping) : t('free')}</span>
          </div>
          <div className="row t">
            <span>{t('total')}</span>
            <span>{tk(lang, grand)}</span>
          </div>
          <button className="btn block" type="submit" disabled={placing} style={{ marginTop: 18 }}>
            {placing ? t('placing') : t('place')}
          </button>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>{t('inv_auto')}</p>
        </aside>
      </form>
    </div>
  );
}
