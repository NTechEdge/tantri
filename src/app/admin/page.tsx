'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  IconAlert,
  IconAward,
  IconBox,
  IconChart,
  IconCheck,
  IconChevronDown,
  IconGlobe,
  IconLogout,
  IconLoom,
  IconSettings,
  IconStar,
  IconTag,
  IconUsers,
} from '@/components/Icons';
import {
  DEMO_CATEGORIES,
  DEMO_CONFIG,
  DEMO_OFFERS,
  DEMO_PRODUCTS,
  getDemoAdminCustomers,
  getDemoAdminOrders,
  getDemoAdminStats,
} from '@/lib/demo-data';
import type { AdminCustomer, AdminStats, Offer, Order, Product, User } from '@/lib/types';
import './admin.css';

type AdminView = 'dashboard' | 'products' | 'orders' | 'offers' | 'customers' | 'settings';

const tk = (n: number) => '৳' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const NAV: { key: AdminView; icon: React.ReactNode; label: string }[] = [
  { key: 'dashboard', icon: <IconChart size={18} />, label: 'Dashboard' },
  { key: 'products', icon: <IconLoom size={18} />, label: 'Products' },
  { key: 'orders', icon: <IconBox size={18} />, label: 'Orders' },
  { key: 'offers', icon: <IconTag size={18} />, label: 'Offers' },
  { key: 'customers', icon: <IconUsers size={18} />, label: 'Customers' },
  { key: 'settings', icon: <IconSettings size={18} />, label: 'Settings' },
];

export default function AdminPage() {
  const [me, setMe] = useState<User | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [view, setView] = useState<AdminView>('dashboard');
  const [toastMsg, setToastMsg] = useState('');

  const [stats, setStats] = useState<AdminStats>(getDemoAdminStats);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(getDemoAdminOrders);
  const [ostatus, setOstatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>(DEMO_OFFERS);
  const [customers, setCustomers] = useState<AdminCustomer[]>(getDemoAdminCustomers);
  const [shippingDhaka, setShippingDhaka] = useState(String(DEMO_CONFIG.shipping_dhaka));
  const [shippingOutside, setShippingOutside] = useState(String(DEMO_CONFIG.shipping_outside));
  const [freeOver, setFreeOver] = useState(String(DEMO_CONFIG.free_shipping_over));
  const [phone, setPhone] = useState(DEMO_CONFIG.support_phone);

  const toast = (m: string) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(''), 2400);
  };

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user?.role === 'admin') setMe(d.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) return;
    if (view === 'dashboard') {
      fetch('/api/admin/stats')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setStats(d))
        .catch(() => {});
    } else if (view === 'products') {
      fetch('/api/admin/products')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && setProducts(d))
        .catch(() => {});
    } else if (view === 'orders') {
      fetch('/api/admin/orders' + (ostatus ? `?status=${ostatus}` : ''))
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && setOrders(d))
        .catch(() => {});
    } else if (view === 'offers') {
      fetch('/api/admin/offers')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && setOffers(d))
        .catch(() => {});
    } else if (view === 'customers') {
      fetch('/api/admin/customers')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && setCustomers(d))
        .catch(() => {});
    }
  }, [me, view, ostatus]);

  const sendOtp = async () => {
    const clean = email.trim().toLowerCase();
    setAuthErr('');
    try {
      const r = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      if (!r.ok && r.status !== 404) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Failed');
      }
      setEmail(clean);
      setStep(2);
    } catch (e) {
      setAuthErr(e instanceof Error ? e.message : 'Failed');
    }
  };

  const verifyOtp = async () => {
    setAuthErr('');
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (r.status === 404) {
        setMe({ id: 'demo-admin', email: email || 'admin@tantri.demo', role: 'admin' });
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      if (d.user?.role !== 'admin') {
        await fetch('/api/auth/logout', { method: 'POST' });
        setStep(1);
        setAuthErr('This email is not an admin account.');
        return;
      }
      setMe(d.user);
    } catch (e) {
      setAuthErr(e instanceof Error ? e.message : 'Failed');
    }
  };

  if (!me) {
    return (
      <div className="adm-wrap">
        <div className="adm-login">
          <div className="box">
            <img src="/img/logo.svg" alt="Tantri" />
            <h2>Admin sign in</h2>
            {step === 1 ? (
              <>
                <p>Enter your admin email. We&apos;ll email you a one-time code.</p>
                <div className="fld">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    autoFocus
                  />
                </div>
                {authErr && <div className="err">{authErr}</div>}
                <button className="adm-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={sendOtp}>
                  Send code
                </button>
              </>
            ) : (
              <>
                <p>
                  Code sent to <b>{email}</b>
                </p>
                <div className="fld">
                  <label>6-digit code</label>
                  <input
                    maxLength={6}
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                    style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center' }}
                    autoFocus
                  />
                </div>
                {authErr && <div className="err">{authErr}</div>}
                <button className="adm-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={verifyOtp}>
                  Verify &amp; sign in
                </button>
                <p style={{ margin: '14px 0 0', textAlign: 'center' }}>
                  <button
                    style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                    onClick={() => {
                      setStep(1);
                      setCode('');
                    }}
                  >
                    Use a different email
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const maxDayRev = Math.max(...stats.days.map((d) => d.v), 1);

  return (
    <div className="adm-wrap">
      <div className="adm-app">
        <aside className="adm-side">
          <img src="/img/logo-light.svg" alt="Tantri" />
          {NAV.map((item) => (
            <button key={item.key} className={`nv ${view === item.key ? 'on' : ''}`} onClick={() => setView(item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
          <div className="sp" />
          <Link className="nv" href="/">
            <IconGlobe size={18} /> View store
          </Link>
          <button
            className="nv"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
              setMe(null);
              setStep(1);
            }}
          >
            <IconLogout size={18} /> Log out
          </button>
          <small>{me.email}</small>
        </aside>

        <main className="adm-main">
          {view === 'dashboard' && (
            <>
              <div className="adm-top">
                <h1>Dashboard</h1>
              </div>
              <div className="adm-kpis">
                <div className="adm-kpi">
                  <span>Total revenue</span>
                  <b>{tk(stats.revenue)}</b>
                  <small>{stats.orders} orders</small>
                </div>
                <div className="adm-kpi">
                  <span>Today</span>
                  <b>{tk(stats.today_revenue)}</b>
                  <small>{stats.today_orders} orders</small>
                </div>
                <div className="adm-kpi">
                  <span>Pending orders</span>
                  <b>{stats.pending}</b>
                  <small>need action</small>
                </div>
                <div className="adm-kpi">
                  <span>Customers</span>
                  <b>{stats.customers}</b>
                  <small>registered</small>
                </div>
              </div>

              <div className="adm-g">
                <div className="adm-card">
                  <h3>Sales — last 7 days</h3>
                  <div className="adm-bars">
                    {stats.days.map((d) => (
                      <div className="adm-bar" key={d.d}>
                        <b>{d.v ? tk(d.v) : ''}</b>
                        <i style={{ height: `${(d.v / maxDayRev) * 100}%` }} />
                        <small>{new Date(d.d).toLocaleDateString('en-GB', { weekday: 'short' })}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="adm-card">
                  <h3 className="adm-h-ico">
                    <IconAlert size={16} /> Low stock
                  </h3>
                  {stats.low_stock.length ? (
                    <table>
                      <tbody>
                        {stats.low_stock.map((p) => (
                          <tr key={p.name}>
                            <td>{p.name}</td>
                            <td>
                              <span className={`adm-pill ${p.stock ? '' : 'off'}`}>{p.stock} left</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="adm-emp adm-h-ico" style={{ justifyContent: 'center' }}>
                      <IconCheck size={16} /> All products well stocked
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-g">
                <div className="adm-card">
                  <h3>Recent orders</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.map((o) => (
                        <tr key={o.order_no}>
                          <td>
                            <b>#{o.order_no}</b>
                          </td>
                          <td>{o.name}</td>
                          <td>{tk(o.total)}</td>
                          <td>
                            <span className={`adm-pill ${o.status}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="adm-card">
                  <h3 className="adm-h-ico">
                    <IconAward size={16} /> Best sellers
                  </h3>
                  <table>
                    <tbody>
                      {stats.top.map((p) => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>
                            <b>{p.sold}</b> sold
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {view === 'products' && (
            <>
              <div className="adm-top">
                <h1>Products</h1>
              </div>
              <div className="adm-card">
                <table>
                  <thead>
                    <tr>
                      <th />
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr className="hv" key={p.id}>
                        <td>
                          <img className="adm-th" src={p.images[0] || '/img/logo-mark.svg'} alt={p.name} />
                        </td>
                        <td>
                          <b>{p.name}</b>
                          <br />
                          <small className="adm-mut adm-feat">
                            {p.sku}
                            {p.featured && (
                              <span className="adm-feat-tag">
                                {' '}
                                · <IconStar size={12} /> featured
                              </span>
                            )}
                          </small>
                        </td>
                        <td>{p.category_name || DEMO_CATEGORIES.find((c) => c.id === p.category_id)?.name}</td>
                        <td>
                          {p.sale_price ? (
                            <>
                              <b>{tk(p.sale_price)}</b> <s className="adm-mut">{tk(p.price)}</s>
                            </>
                          ) : (
                            <b>{tk(p.price)}</b>
                          )}
                        </td>
                        <td>
                          <span className={`adm-pill ${p.stock > 5 ? 'on' : p.stock ? '' : 'off'}`}>{p.stock}</span>
                        </td>
                        <td>
                          <span className={`adm-pill ${p.active !== false && p.active !== 0 ? 'on' : 'off'}`}>
                            {p.active !== false && p.active !== 0 ? 'Live' : 'Hidden'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === 'orders' && (
            <>
              <div className="adm-top">
                <h1>Orders</h1>
              </div>
              <div className="adm-tabs">
                {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button key={s} className={ostatus === s ? 'on' : ''} onClick={() => setOstatus(s)}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <div className="adm-card">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((o) => !ostatus || o.status === ostatus)
                      .map((o) => (
                        <React.Fragment key={o.id}>
                          <tr
                            className="hv"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                          >
                            <td>
                              <b>#{o.order_no}</b>
                            </td>
                            <td>
                              {o.name}
                              <br />
                              <small className="adm-mut">{o.district}</small>
                            </td>
                            <td>
                              <b>{tk(o.total)}</b>
                            </td>
                            <td>{o.payment_method.toUpperCase()}</td>
                            <td>
                              <span className={`adm-pill ${o.status}`}>{o.status}</span>
                            </td>
                            <td>
                              <IconChevronDown size={16} />
                            </td>
                          </tr>
                          {expandedOrder === o.id && (
                            <tr className="adm-ox">
                              <td colSpan={6}>
                                <div className="g2">
                                  <div>
                                    <b>Deliver to</b>
                                    <br />
                                    {o.name} · {o.phone}
                                    <br />
                                    {o.address}, {o.district}
                                    <br />
                                    <span className="adm-mut">{o.email}</span>
                                    {o.payment_ref && (
                                      <>
                                        <br />
                                        <b>TrxID:</b> {o.payment_ref}
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    {o.items.map((i, idx) => (
                                      <div
                                        key={idx}
                                        style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                                      >
                                        <span>
                                          {i.name} × {i.qty}
                                        </span>
                                        <b>{tk(i.price * i.qty)}</b>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === 'offers' && (
            <>
              <div className="adm-top">
                <h1>Offers &amp; Coupons</h1>
              </div>
              <div className="adm-card">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Offer</th>
                      <th>Discount</th>
                      <th>Min order</th>
                      <th>Used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((o) => (
                      <tr className="hv" key={o.code}>
                        <td>
                          <b style={{ letterSpacing: 1 }}>{o.code}</b>
                        </td>
                        <td>{o.title}</td>
                        <td>{o.type === 'percent' ? `${o.value}%` : tk(o.value)}</td>
                        <td>{tk(o.min_order)}</td>
                        <td>{o.used || 0}</td>
                        <td>
                          <span className={`adm-pill ${o.active ? 'on' : 'off'}`}>{o.active ? 'Active' : 'Off'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === 'customers' && (
            <>
              <div className="adm-top">
                <h1>Customers</h1>
              </div>
              <div className="adm-card">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Orders</th>
                      <th>Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr className="hv" key={c.email}>
                        <td>
                          <b>{c.name || '—'}</b>
                          <br />
                          <small className="adm-mut">{c.email}</small>
                        </td>
                        <td>{c.phone || '—'}</td>
                        <td>{c.orders}</td>
                        <td>
                          <b>{tk(c.spent)}</b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === 'settings' && (
            <>
              <div className="adm-top">
                <h1>Settings</h1>
              </div>
              <div className="adm-card" style={{ maxWidth: 680 }}>
                <h3>Delivery &amp; Contact</h3>
                <div className="g2">
                  <div className="fld">
                    <label>Delivery – Dhaka (৳)</label>
                    <input value={shippingDhaka} onChange={(e) => setShippingDhaka(e.target.value)} />
                  </div>
                  <div className="fld">
                    <label>Delivery – outside (৳)</label>
                    <input value={shippingOutside} onChange={(e) => setShippingOutside(e.target.value)} />
                  </div>
                </div>
                <div className="g2">
                  <div className="fld">
                    <label>Free delivery over (৳)</label>
                    <input value={freeOver} onChange={(e) => setFreeOver(e.target.value)} />
                  </div>
                  <div className="fld">
                    <label>Support phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <button className="adm-btn" onClick={() => toast('Settings saved')}>
                  Save settings
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
    </div>
  );
}
