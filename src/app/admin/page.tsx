'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import {
  IconAlert,
  IconAward,
  IconBox,
  IconCamera,
  IconChart,
  IconCheck,
  IconChevronDown,
  IconClose,
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
import type {
  AdminCustomer,
  AdminStats,
  Category,
  Offer,
  Order,
  PaymentMethodConfig,
  Product,
  User,
} from '@/lib/types';
import './admin.css';

type AdminView = 'dashboard' | 'products' | 'orders' | 'offers' | 'customers' | 'settings';

const tk = (n: number) => '৳' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const NAV: { key: AdminView; icon: React.ReactNode; label: string }[] = [
  { key: 'dashboard', icon: <IconChart size={18} />, label: 'Dashboard' },
  { key: 'products', icon: <IconLoom size={18} />, label: 'Products' },
  { key: 'orders', icon: <IconBox size={18} />, label: 'Orders' },
  { key: 'offers', icon: <IconTag size={18} />, label: 'Offers' },
  { key: 'customers', icon: <IconUsers size={18} />, label: 'Customers' },
  { key: 'settings', icon: <IconSettings size={18} />, label: 'Settings' },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function compressImageFile(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, or WebP images are allowed');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 5MB limit`);
  }
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1000;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(raw);
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL('image/webp', 0.82);
      resolve(out.startsWith('data:image/webp') ? out : canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(raw);
    img.src = raw;
  });
}

interface ProductFormState {
  id?: string;
  name: string;
  name_bn: string;
  category_id: string;
  price: string;
  sale_price: string;
  stock: string;
  sku: string;
  material: string;
  origin: string;
  sizes: string;
  colors: string;
  images: string[];
  description: string;
  description_bn: string;
  featured: boolean;
  active: boolean;
}

interface OfferFormState {
  id?: string;
  code: string;
  type: 'percent' | 'flat';
  title: string;
  title_bn: string;
  value: string;
  min_order: string;
  max_discount: string;
  expires_at: string;
  usage_limit: string;
  active: boolean;
  show_banner: boolean;
}

export default function AdminPage() {
  const [me, setMe] = useState<User | null>(null);
  const [email, setEmail] = useState('admin@tantri.com');
  const [password, setPassword] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [view, setView] = useState<AdminView>('dashboard');
  const [toastMsg, setToastMsg] = useState('');

  const [stats, setStats] = useState<AdminStats>(getDemoAdminStats);
  const [cats, setCats] = useState<Category[]>(DEMO_CATEGORIES);
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
  const [payments, setPayments] = useState<PaymentMethodConfig[]>(DEMO_CONFIG.payments);

  const [prodModal, setProdModal] = useState<ProductFormState | null>(null);
  const [offerModal, setOfferModal] = useState<OfferFormState | null>(null);
  const [modalErr, setModalErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImgs, setUploadingImgs] = useState(false);

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

  const loadProducts = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      fetch('/api/categories').catch(() => null),
      fetch('/api/admin/products').catch(() => null),
    ]);
    if (catRes?.ok) {
      const c = await catRes.json();
      if (Array.isArray(c) && c.length) setCats(c);
    }
    if (prodRes?.ok) {
      const p = await prodRes.json();
      if (Array.isArray(p)) setProducts(p);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    const r = await fetch('/api/admin/orders' + (ostatus ? `?status=${ostatus}` : '')).catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      if (Array.isArray(d)) setOrders(d);
    }
  }, [ostatus]);

  const loadOffers = useCallback(async () => {
    const r = await fetch('/api/admin/offers').catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      if (Array.isArray(d)) setOffers(d);
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    if (view === 'dashboard') {
      fetch('/api/admin/stats')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setStats(d))
        .catch(() => {});
    } else if (view === 'products') {
      loadProducts();
    } else if (view === 'orders') {
      loadOrders();
    } else if (view === 'offers') {
      loadOffers();
    } else if (view === 'customers') {
      fetch('/api/admin/customers')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && setCustomers(d))
        .catch(() => {});
    } else if (view === 'settings') {
      fetch('/api/admin/settings')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return;
          if (d.shipping_dhaka) setShippingDhaka(String(d.shipping_dhaka));
          if (d.shipping_outside) setShippingOutside(String(d.shipping_outside));
          if (d.free_over) setFreeOver(String(d.free_over));
          if (d.phone) setPhone(String(d.phone));
          if (Array.isArray(d.payments)) setPayments(d.payments);
        })
        .catch(() => {});
    }
  }, [me, view, loadProducts, loadOrders, loadOffers]);

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr('');
    try {
      const r = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (r.status === 404) {
        if (email.trim().toLowerCase() === 'admin@tantri.com' && password === 'Admin@1234') {
          setMe({ id: 'demo-admin', email: 'admin@tantri.com', role: 'admin' });
          return;
        }
        throw new Error('Invalid admin email or password');
      }
      const d = await r.json().catch(() => null);
      if (!d) throw new Error(`Server error (${r.status}) — backend may be waking up or unreachable`);
      if (!r.ok) throw new Error(d.error || 'Login failed');
      setMe(d.user);
    } catch (err) {
      setAuthErr(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const openProductModal = (p?: Product) => {
    setModalErr('');
    setUploadingImgs(false);
    setProdModal({
      id: p?.id,
      name: p?.name || '',
      name_bn: p?.name_bn || '',
      category_id: p?.category_id || cats[0]?.id || '',
      price: p ? String(p.price) : '',
      sale_price: p?.sale_price ? String(p.sale_price) : '',
      stock: p ? String(p.stock) : '10',
      sku: p?.sku || '',
      material: p?.material || '100% cotton',
      origin: p?.origin || 'Made in Bangladesh',
      sizes: (p?.sizes || []).join(', '),
      colors: (p?.colors || []).join(', '),
      images: p?.images ? [...p.images] : [],
      description: p?.description || '',
      description_bn: p?.description_bn || '',
      featured: Boolean(p?.featured),
      active: p ? p.active !== false && p.active !== 0 : true,
    });
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length || !prodModal) return;
    setModalErr('');
    setUploadingImgs(true);
    try {
      const added: string[] = [];
      for (const f of Array.from(files)) {
        added.push(await compressImageFile(f));
      }
      setProdModal((prev) => (prev ? { ...prev, images: [...prev.images, ...added] } : prev));
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Failed to load image');
    } finally {
      setUploadingImgs(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodModal) return;
    setModalErr('');
    setSaving(true);
    const body = {
      name: prodModal.name.trim(),
      name_bn: prodModal.name_bn.trim(),
      category_id: prodModal.category_id,
      price: Number(prodModal.price),
      sale_price: prodModal.sale_price ? Number(prodModal.sale_price) : null,
      stock: Number(prodModal.stock || 0),
      sku: prodModal.sku.trim(),
      material: prodModal.material.trim(),
      origin: prodModal.origin.trim() || 'Made in Bangladesh',
      sizes: splitList(prodModal.sizes),
      colors: splitList(prodModal.colors),
      images: prodModal.images,
      description: prodModal.description.trim(),
      description_bn: prodModal.description_bn.trim(),
      featured: prodModal.featured,
      active: prodModal.active,
    };

    try {
      const r = await fetch('/api/admin/products' + (prodModal.id ? `/${prodModal.id}` : ''), {
        method: prodModal.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed to save product');
      setProdModal(null);
      toast(prodModal.id ? 'Product updated' : 'Product added');
      await loadProducts();
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? (If it has past orders it will be hidden instead.)`)) return;
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed to delete');
      toast(d.archived ? 'Product hidden (has orders)' : 'Product deleted');
      await loadProducts();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const r = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error('Failed to update status');
      toast(`Status → ${status}`);
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const updatePaymentStatus = async (id: string, payment_status: Order['payment_status']) => {
    try {
      const r = await fetch(`/api/admin/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status }),
      });
      if (!r.ok) throw new Error('Failed to update payment');
      toast(`Payment → ${payment_status}`);
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const openOfferModal = (o?: Offer) => {
    setModalErr('');
    setOfferModal({
      id: o?.id,
      code: o?.code || '',
      type: o?.type || 'percent',
      title: o?.title || '',
      title_bn: o?.title_bn || '',
      value: o ? String(o.value) : '',
      min_order: o ? String(o.min_order) : '0',
      max_discount: o?.max_discount ? String(o.max_discount) : '',
      expires_at: o?.expires_at ? String(o.expires_at).slice(0, 10) : '',
      usage_limit: o?.usage_limit ? String(o.usage_limit) : '',
      active: o ? o.active !== false && o.active !== 0 : true,
      show_banner: Boolean(o?.show_banner),
    });
  };

  const saveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModal) return;
    setModalErr('');
    setSaving(true);
    try {
      const r = await fetch('/api/admin/offers' + (offerModal.id ? `/${offerModal.id}` : ''), {
        method: offerModal.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: offerModal.code.trim().toUpperCase(),
          type: offerModal.type,
          title: offerModal.title.trim(),
          title_bn: offerModal.title_bn.trim(),
          value: Number(offerModal.value),
          min_order: Number(offerModal.min_order || 0),
          max_discount: offerModal.max_discount ? Number(offerModal.max_discount) : null,
          expires_at: offerModal.expires_at || null,
          usage_limit: offerModal.usage_limit ? Number(offerModal.usage_limit) : null,
          active: offerModal.active,
          show_banner: offerModal.show_banner,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed to save coupon');
      setOfferModal(null);
      toast('Coupon saved');
      await loadOffers();
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async (id?: string) => {
    if (!id || !confirm('Delete this coupon?')) return;
    const r = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
    if (r.ok) {
      toast('Coupon deleted');
      await loadOffers();
    }
  };

  const saveSettings = async () => {
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_dhaka: shippingDhaka,
          shipping_outside: shippingOutside,
          free_over: freeOver,
          phone,
          payments,
        }),
      });
      if (!r.ok) throw new Error('Failed to save settings');
      toast('Settings saved');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (!me) {
    return (
      <div className="adm-wrap">
        <div className="adm-login">
          <form className="box" onSubmit={loginWithPassword}>
            <img src="/img/logo.svg" alt="Tantri" />
            <h2>Admin sign in</h2>
            <p>Sign in with your admin email and password.</p>
            <div className="fld">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="fld">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {authErr && <div className="err">{authErr}</div>}
            <button type="submit" className="adm-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Sign in
            </button>
            <p className="adm-mut" style={{ fontSize: 12, margin: '14px 0 0', textAlign: 'center' }}>
              Demo: admin@tantri.com / Admin@1234
            </p>
          </form>
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
              setPassword('');
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
                <button className="adm-btn" onClick={() => openProductModal()}>
                  + Add product
                </button>
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
                      <th />
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
                        <td>{p.category_name || cats.find((c) => c.id === p.category_id)?.name}</td>
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
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="adm-btn sm o" onClick={() => openProductModal(p)}>
                            Edit
                          </button>{' '}
                          <button className="adm-btn sm r" onClick={() => deleteProduct(p)}>
                            Delete
                          </button>
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
                            <td>
                              {o.payment_method.toUpperCase()}{' '}
                              <span
                                className={`adm-pill ${o.payment_status === 'paid' ? 'on' : o.payment_status === 'failed' ? 'off' : ''}`}
                              >
                                {o.payment_status || 'unpaid'}
                              </span>
                            </td>
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
                                <div className="adm-f2">
                                  <div>
                                    <b>Deliver to</b>
                                    <br />
                                    {o.name} · {o.phone}
                                    <br />
                                    {o.address}, {o.district}
                                    <br />
                                    <span className="adm-mut">{o.email}</span>
                                    {o.note && (
                                      <>
                                        <br />
                                        <i>Note: {o.note}</i>
                                      </>
                                    )}
                                    {o.payment_ref && (
                                      <>
                                        <br />
                                        <b>TrxID:</b> {o.payment_ref}
                                      </>
                                    )}
                                    {o.payment_sender && (
                                      <>
                                        <br />
                                        <b>Sender no:</b> {o.payment_sender}
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
                                          {i.name} {i.variant && <small className="adm-mut">({i.variant})</small>} ×{' '}
                                          {i.qty}
                                        </span>
                                        <b>{tk(i.price * i.qty)}</b>
                                      </div>
                                    ))}
                                    <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>Delivery</span>
                                      <span>{tk(o.shipping)}</span>
                                    </div>
                                    {o.discount > 0 && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Discount {o.coupon || ''}</span>
                                        <span>−{tk(o.discount)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    marginTop: 14,
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <b>Update status:</b>
                                  {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
                                    <button
                                      key={s}
                                      className={`adm-btn sm ${o.status === s ? '' : 'o'}`}
                                      onClick={() => updateOrderStatus(o.id, s)}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <b>Payment:</b>
                                  {(['unpaid', 'pending', 'paid', 'failed'] as const).map((ps) => (
                                    <button
                                      key={ps}
                                      className={`adm-btn sm ${(o.payment_status || 'unpaid') === ps ? '' : 'o'}`}
                                      onClick={() => updatePaymentStatus(o.id, ps)}
                                    >
                                      {ps}
                                    </button>
                                  ))}
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
                <button className="adm-btn" onClick={() => openOfferModal()}>
                  + New coupon
                </button>
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
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((o) => (
                      <tr className="hv" key={o.code}>
                        <td>
                          <b style={{ letterSpacing: 1 }}>{o.code}</b>
                        </td>
                        <td>
                          {o.title}{' '}
                          {o.show_banner ? <span className="adm-pill on">banner</span> : null}
                        </td>
                        <td>{o.type === 'percent' ? `${o.value}%` : tk(o.value)}</td>
                        <td>{tk(o.min_order)}</td>
                        <td>{o.used || 0}</td>
                        <td>
                          <span className={`adm-pill ${o.active ? 'on' : 'off'}`}>{o.active ? 'Active' : 'Off'}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="adm-btn sm o" onClick={() => openOfferModal(o)}>
                            Edit
                          </button>{' '}
                          <button className="adm-btn sm r" onClick={() => deleteOffer(o.id)}>
                            Delete
                          </button>
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
              <div className="adm-card" style={{ maxWidth: 740, marginBottom: 16 }}>
                <h3>Delivery &amp; Contact</h3>
                <div className="adm-f3">
                  <div className="fld">
                    <label>Delivery – Dhaka (৳)</label>
                    <input value={shippingDhaka} onChange={(e) => setShippingDhaka(e.target.value)} />
                  </div>
                  <div className="fld">
                    <label>Delivery – outside (৳)</label>
                    <input value={shippingOutside} onChange={(e) => setShippingOutside(e.target.value)} />
                  </div>
                  <div className="fld">
                    <label>Free delivery over (৳)</label>
                    <input value={freeOver} onChange={(e) => setFreeOver(e.target.value)} />
                  </div>
                </div>
                <div className="fld">
                  <label>Support phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="adm-card" style={{ maxWidth: 740 }}>
                <h3>Payment methods</h3>
                {payments.map((pm, idx) => (
                  <div
                    key={pm.id}
                    className="adm-card"
                    style={{ background: '#fbf8f1', marginBottom: 12, padding: 16 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <b>
                        {pm.label_en} <span className="adm-mut">/ {pm.label_bn}</span>
                      </b>
                      <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(pm.enabled)}
                          onChange={(e) =>
                            setPayments((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, enabled: e.target.checked ? 1 : 0 } : x))
                            )
                          }
                        />
                        Enabled
                      </label>
                    </div>
                    {pm.id !== 'cod' && (
                      <div className="adm-f2">
                        <div className="fld">
                          <label>{pm.id === 'bangla_qr' ? 'Merchant ID (optional)' : 'Merchant number'}</label>
                          <input
                            value={pm.number || ''}
                            onChange={(e) =>
                              setPayments((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, number: e.target.value } : x))
                              )
                            }
                          />
                        </div>
                        <div className="fld">
                          <label>QR image URL (optional)</label>
                          <input
                            value={pm.qr || ''}
                            onChange={(e) =>
                              setPayments((prev) => prev.map((x, i) => (i === idx ? { ...x, qr: e.target.value } : x)))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button className="adm-btn" onClick={saveSettings}>
                  Save settings
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {prodModal && (
        <>
          <div className="adm-mback" onClick={() => setProdModal(null)} />
          <form className="adm-mdl" onSubmit={saveProduct}>
            <h2>{prodModal.id ? 'Edit product' : 'Add product'}</h2>
            <div className="adm-f2">
              <div className="fld">
                <label>Name (English)</label>
                <input
                  required
                  value={prodModal.name}
                  onChange={(e) => setProdModal({ ...prodModal, name: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>নাম (বাংলা)</label>
                <input
                  value={prodModal.name_bn}
                  onChange={(e) => setProdModal({ ...prodModal, name_bn: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f3">
              <div className="fld">
                <label>Category</label>
                <select
                  value={prodModal.category_id}
                  onChange={(e) => setProdModal({ ...prodModal, category_id: e.target.value })}
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>Price (৳)</label>
                <input
                  type="number"
                  required
                  value={prodModal.price}
                  onChange={(e) => setProdModal({ ...prodModal, price: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Sale price (৳, optional)</label>
                <input
                  type="number"
                  value={prodModal.sale_price}
                  onChange={(e) => setProdModal({ ...prodModal, sale_price: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f3">
              <div className="fld">
                <label>Stock</label>
                <input
                  type="number"
                  value={prodModal.stock}
                  onChange={(e) => setProdModal({ ...prodModal, stock: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>SKU</label>
                <input value={prodModal.sku} onChange={(e) => setProdModal({ ...prodModal, sku: e.target.value })} />
              </div>
              <div className="fld">
                <label>Material</label>
                <input
                  value={prodModal.material}
                  onChange={(e) => setProdModal({ ...prodModal, material: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Sizes / lengths (comma separated)</label>
                <input
                  placeholder="S, M, L, XL"
                  value={prodModal.sizes}
                  onChange={(e) => setProdModal({ ...prodModal, sizes: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Colours (comma separated)</label>
                <input
                  placeholder="Maroon, Indigo"
                  value={prodModal.colors}
                  onChange={(e) => setProdModal({ ...prodModal, colors: e.target.value })}
                />
              </div>
            </div>
            <div className="fld">
              <label>Origin</label>
              <input value={prodModal.origin} onChange={(e) => setProdModal({ ...prodModal, origin: e.target.value })} />
            </div>
            <div className="fld">
              <label>Images (first one is the main photo)</label>
              {prodModal.images.length > 0 && (
                <div className="adm-imgs">
                  {prodModal.images.map((u, idx) => (
                    <div className="adm-img-item" key={idx}>
                      <img src={u} alt="" />
                      {idx === 0 && <span className="adm-img-main">Main</span>}
                      <button
                        type="button"
                        className="adm-img-rm"
                        aria-label="Remove image"
                        onClick={() =>
                          setProdModal({
                            ...prodModal,
                            images: prodModal.images.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <IconClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="adm-drop" style={{ display: 'flex', marginBottom: 0 }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={uploadingImgs}
                  onChange={(e) => {
                    void handlePhotoUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
                <IconCamera size={17} />
                <span>{uploadingImgs ? 'Processing photos…' : 'Click to upload photos (JPG / PNG / WebP, max 5MB)'}</span>
              </label>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Description (English)</label>
                <textarea
                  rows={3}
                  value={prodModal.description}
                  onChange={(e) => setProdModal({ ...prodModal, description: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  value={prodModal.description_bn}
                  onChange={(e) => setProdModal({ ...prodModal, description_bn: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-chk">
              <label>
                <input
                  type="checkbox"
                  checked={prodModal.featured}
                  onChange={(e) => setProdModal({ ...prodModal, featured: e.target.checked })}
                />{' '}
                Featured on home page
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={prodModal.active}
                  onChange={(e) => setProdModal({ ...prodModal, active: e.target.checked })}
                />{' '}
                Visible in store
              </label>
            </div>
            {modalErr && <div className="err">{modalErr}</div>}
            <div className="adm-acts">
              <button type="button" className="adm-btn o" onClick={() => setProdModal(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn" disabled={saving || uploadingImgs}>
                {saving ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </form>
        </>
      )}

      {offerModal && (
        <>
          <div className="adm-mback" onClick={() => setOfferModal(null)} />
          <form className="adm-mdl" onSubmit={saveOffer}>
            <h2>{offerModal.id ? 'Edit coupon' : 'New coupon'}</h2>
            <div className="adm-f2">
              <div className="fld">
                <label>Code</label>
                <input
                  required
                  style={{ textTransform: 'uppercase' }}
                  value={offerModal.code}
                  onChange={(e) => setOfferModal({ ...offerModal, code: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Type</label>
                <select
                  value={offerModal.type}
                  onChange={(e) =>
                    setOfferModal({ ...offerModal, type: e.target.value === 'flat' ? 'flat' : 'percent' })
                  }
                >
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat amount (৳)</option>
                </select>
              </div>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Title (English)</label>
                <input value={offerModal.title} onChange={(e) => setOfferModal({ ...offerModal, title: e.target.value })} />
              </div>
              <div className="fld">
                <label>শিরোনাম (বাংলা)</label>
                <input
                  value={offerModal.title_bn}
                  onChange={(e) => setOfferModal({ ...offerModal, title_bn: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f3">
              <div className="fld">
                <label>Value</label>
                <input
                  type="number"
                  required
                  value={offerModal.value}
                  onChange={(e) => setOfferModal({ ...offerModal, value: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Min order (৳)</label>
                <input
                  type="number"
                  value={offerModal.min_order}
                  onChange={(e) => setOfferModal({ ...offerModal, min_order: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Max discount (৳)</label>
                <input
                  type="number"
                  value={offerModal.max_discount}
                  onChange={(e) => setOfferModal({ ...offerModal, max_discount: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Expires on</label>
                <input
                  type="date"
                  value={offerModal.expires_at}
                  onChange={(e) => setOfferModal({ ...offerModal, expires_at: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Usage limit</label>
                <input
                  type="number"
                  value={offerModal.usage_limit}
                  onChange={(e) => setOfferModal({ ...offerModal, usage_limit: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-chk">
              <label>
                <input
                  type="checkbox"
                  checked={offerModal.active}
                  onChange={(e) => setOfferModal({ ...offerModal, active: e.target.checked })}
                />{' '}
                Active
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={offerModal.show_banner}
                  onChange={(e) => setOfferModal({ ...offerModal, show_banner: e.target.checked })}
                />{' '}
                Show on website banner
              </label>
            </div>
            {modalErr && <div className="err">{modalErr}</div>}
            <div className="adm-acts">
              <button type="button" className="adm-btn o" onClick={() => setOfferModal(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save coupon'}
              </button>
            </div>
          </form>
        </>
      )}

      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
    </div>
  );
}
