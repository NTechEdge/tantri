'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { money, num, tk } from '@/lib/i18n';
import { useStore } from './StoreProvider';

function LoginModal() {
  const { lang, t, loginOpen, closeLogin, setUser, toast, afterLoginCb } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginOpen) return null;

  const sendOtp = async () => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setErr('Enter a valid email address');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, lang }),
      });
      if (!r.ok && r.status !== 404) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || t('err_generic'));
      }
      setEmail(clean);
      setStep(2);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('err_generic'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.trim().length < 6) return;
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp.trim() }),
      });
      let loggedUser;
      if (r.status === 404) {
        loggedUser = { id: 'demo', email, role: 'customer' as const };
      } else {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || t('err_generic'));
        loggedUser = d.user;
      }
      setUser(loggedUser);
      toast(t('logged_as', loggedUser.email));
      const cb = afterLoginCb;
      setStep(1);
      setOtp('');
      closeLogin();
      if (cb) cb();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('err_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal on" role="dialog" aria-modal="true">
      <button className="x" aria-label="Close" onClick={closeLogin}>
        ×
      </button>
      {step === 1 ? (
        <>
          <h2>{t('wlc')}</h2>
          <p>{t('wlc_s')}</p>
          <div className="fld">
            <label>{t('email')}</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
              autoFocus
            />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn block" onClick={sendOtp} disabled={loading}>
            {loading ? t('sending') : t('send_code')}
          </button>
        </>
      ) : (
        <>
          <h2>{t('chk_mail')}</h2>
          <p>{t('sent_to', email)}</p>
          <div className="fld">
            <input
              maxLength={6}
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
              autoFocus
            />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn block" onClick={verifyOtp} disabled={loading}>
            {t('verify')}
          </button>
          <p style={{ textAlign: 'center', margin: '16px 0 0' }}>
            <button className="link" onClick={sendOtp}>
              {t('resend')}
            </button>{' '}
            ·{' '}
            <button className="link" onClick={() => setStep(1)}>
              {t('change_email')}
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const {
    lang,
    toggleLang,
    t,
    user,
    cfg,
    bannerOffer,
    cart,
    updateQty,
    removeItem,
    subtotal,
    cartOpen,
    setCartOpen,
    loginOpen,
    openLogin,
    closeLogin,
    toastMsg,
  } = useStore();
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') || '';

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div className="topbar">
        {bannerOffer ? (
          <>
            {lang === 'bn' && bannerOffer.title_bn ? bannerOffer.title_bn : bannerOffer.title} — {t('top_use')}{' '}
            <b>{bannerOffer.code}</b>
          </>
        ) : (
          t('top_free', money(lang, cfg.free_shipping_over))
        )}
      </div>

      <header className="hdr">
        <div className="wrap hdr-in">
          <button className="icon-btn burger" aria-label="Menu" onClick={() => setNavOpen(true)}>
            ☰
          </button>
          <Link href="/" className="brand">
            <img src="/img/logo.svg" alt="Tantri" />
          </Link>
          <nav className={`nav ${navOpen ? 'on' : ''}`} onClick={() => setNavOpen(false)}>
            <Link href="/shop" className={pathname === '/shop' && !catParam ? 'on' : ''}>
              {t('nav_all')}
            </Link>
            <Link href="/shop?category=lungi" className={catParam === 'lungi' ? 'on' : ''}>
              {t('nav_lungi')}
            </Link>
            <Link href="/shop?category=gamcha" className={catParam === 'gamcha' ? 'on' : ''}>
              {t('nav_gamcha')}
            </Link>
            <Link href="/shop?category=tshirt" className={catParam === 'tshirt' ? 'on' : ''}>
              {t('nav_tshirt')}
            </Link>
            <Link href="/about" className={pathname === '/about' ? 'on' : ''}>
              {t('nav_story')}
            </Link>
          </nav>

          <div className="hdr-act">
            <form className="search" onSubmit={onSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_ph')}
                aria-label="Search"
              />
              <button aria-label="Search">⌕</button>
            </form>
            <button className="lang" onClick={toggleLang} aria-label="Language">
              {lang === 'bn' ? 'EN' : 'বাংলা'}
            </button>
            <button
              className="icon-btn"
              aria-label="Account"
              onClick={() => (user ? router.push('/account') : openLogin())}
            >
              👤<span id="accLabel">{user ? user.name || user.email.split('@')[0] : t('login')}</span>
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              🛍<b>{num(lang, cartCount)}</b>
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="ftr">
        <div className="wrap ftr-grid">
          <div>
            <img src="/img/logo-light.svg" alt="Tantri" className="ftr-logo" />
            <p>{t('ftr_about')}</p>
          </div>
          <div>
            <h4>{t('ftr_shop')}</h4>
            <Link href="/shop?category=lungi">{t('nav_lungi')}</Link>
            <Link href="/shop?category=gamcha">{t('nav_gamcha')}</Link>
            <Link href="/shop?category=tshirt">{t('nav_tshirt')}</Link>
            <Link href="/shop?sort=popular">{t('ftr_best')}</Link>
          </div>
          <div>
            <h4>{t('ftr_help')}</h4>
            <Link href="/account">{t('my_orders')}</Link>
            <Link href="/about">{t('nav_story')}</Link>
            <span>{t('ftr_pay1')}</span>
            <span>{t('ftr_pay2')}</span>
          </div>
          <div>
            <h4>{t('ftr_contact')}</h4>
            <span>{cfg.support_phone}</span>
            <span>{t('ftr_city')}</span>
            <span>{t('ftr_deliv')}</span>
          </div>
        </div>
        <div className="ftr-bot">
          © <span>{num(lang, new Date().getFullYear())}</span> <span>{t('ftr_copy')}</span>
        </div>
      </footer>

      <div
        className={`overlay ${cartOpen || loginOpen || navOpen ? 'on' : ''}`}
        onClick={() => {
          setCartOpen(false);
          closeLogin();
          setNavOpen(false);
        }}
      />

      <aside className={`drawer ${cartOpen ? 'on' : ''}`} aria-label="Cart">
        <div className="dr-h">
          <h3>{t('cart')}</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>
        <div className="dr-b">
          {cart.length ? (
            cart.map((item, idx) => (
              <div className="li" key={item.key}>
                <Link href={`/product/${item.slug}`} onClick={() => setCartOpen(false)}>
                  <img src={item.image} alt="" />
                </Link>
                <div>
                  <h4>{lang === 'bn' && item.name_bn ? item.name_bn : item.name}</h4>
                  <small>{[item.size, item.color].filter(Boolean).join(' · ')}</small>
                  <div className="qty">
                    <button onClick={() => updateQty(idx, -1)}>−</button>
                    <span>{num(lang, item.qty)}</span>
                    <button onClick={() => updateQty(idx, 1)}>+</button>
                  </div>
                  <br />
                  <button className="rm" onClick={() => removeItem(idx)}>
                    {t('remove')}
                  </button>
                </div>
                <b>{tk(lang, item.price * item.qty)}</b>
              </div>
            ))
          ) : (
            <div className="empty">
              <h3>{t('cart_empty')}</h3>
              <p>{t('cart_empty_s')}</p>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="dr-f">
            <div className="ship-note">
              {subtotal < cfg.free_shipping_over
                ? t('add_more', money(lang, cfg.free_shipping_over - subtotal))
                : t('free_unlocked')}
            </div>
            <div className="row t">
              <span>{t('subtotal')}</span>
              <span>{tk(lang, subtotal)}</span>
            </div>
            <button
              className="btn block"
              style={{ marginTop: 14 }}
              onClick={() => {
                setCartOpen(false);
                router.push('/checkout');
              }}
            >
              {t('checkout')}
            </button>
          </div>
        )}
      </aside>

      <LoginModal />
      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
    </>
  );
}
