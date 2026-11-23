'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { num, tk } from '@/lib/i18n';
import type { Order } from '@/lib/types';

export default function AccountPage() {
  const { lang, t, user, setUser, openLogin, logout, toast } = useStore();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setOrders(d))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="wrap page">
        <div className="empty">
          <h3>{t('login_see')}</h3>
          <button className="btn" onClick={() => openLogin()}>
            {t('login_email')}
          </button>
        </div>
      </div>
    );
  }

  const saveProfile = async () => {
    await fetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    }).catch(() => {});
    setUser({ ...user, name, phone });
    toast(t('saved'));
  };

  return (
    <div className="wrap page" style={{ maxWidth: 860 }}>
      <div className="shop-h">
        <div>
          <h1>{t('my_acc')}</h1>
          <p style={{ color: 'var(--muted)' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user.role === 'admin' && (
            <Link className="btn sm gold" href="/admin">
              {t('admin_panel')}
            </Link>
          )}
          <button
            className="btn sm ghost"
            onClick={async () => {
              await logout();
              router.push('/');
            }}
          >
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="box">
        <h3>{t('profile')}</h3>
        <div className="g2">
          <div className="fld">
            <label>{t('name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="fld">
            <label>{t('mobile')}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <button className="btn sm" onClick={saveProfile}>
          {t('save_prof')}
        </button>
      </div>

      <h2 style={{ fontSize: 26, margin: '30px 0 16px' }}>{t('my_orders')}</h2>
      {orders.length ? (
        orders.map((o) => (
          <div className="ord" key={o.id}>
            <div className="ord-h">
              <div>
                <b>#{o.order_no}</b>
              </div>
              <div>
                <span className={`pst ${o.payment_status}`}>{t('ps_' + (o.payment_status || 'unpaid'))}</span>{' '}
                <span className={`st ${o.status}`}>{t('st_' + o.status)}</span>
              </div>
            </div>
            {o.items.map((i, idx) => (
              <div className="row" key={idx}>
                <span>
                  {i.name} × {num(lang, i.qty)}
                </span>
                <span>{tk(lang, i.price * i.qty)}</span>
              </div>
            ))}
            <div className="row t">
              <span>{t('total')}</span>
              <span>{tk(lang, o.total)}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty">
          <h3>{t('no_orders')}</h3>
          <Link className="btn" href="/shop">
            {t('start_shop')}
          </Link>
        </div>
      )}
    </div>
  );
}
