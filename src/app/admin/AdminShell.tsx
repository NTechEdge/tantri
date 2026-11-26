'use client';

import Link from 'next/link';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  IconBox,
  IconChart,
  IconGlobe,
  IconLogout,
  IconLoom,
  IconSettings,
  IconTag,
  IconUsers,
} from '@/components/Icons';
import type { User } from '@/lib/types';

export type AdminView = 'dashboard' | 'products' | 'orders' | 'offers' | 'customers' | 'settings';

export const tk = (n: number) =>
  '৳' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const NAV: { key: AdminView; icon: React.ReactNode; label: string }[] = [
  { key: 'dashboard', icon: <IconChart size={18} />, label: 'Dashboard' },
  { key: 'products', icon: <IconLoom size={18} />, label: 'Products' },
  { key: 'orders', icon: <IconBox size={18} />, label: 'Orders' },
  { key: 'offers', icon: <IconTag size={18} />, label: 'Offers' },
  { key: 'customers', icon: <IconUsers size={18} />, label: 'Customers' },
  { key: 'settings', icon: <IconSettings size={18} />, label: 'Settings' },
];

interface AdminContextValue {
  me: User;
  view: AdminView;
  setView: (v: AdminView) => void;
  toast: (msg: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminShell');
  return ctx;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<User | null>(null);
  const [email, setEmail] = useState('admin@tantri.com');
  const [password, setPassword] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [view, setView] = useState<AdminView>('dashboard');
  const [toastMsg, setToastMsg] = useState('');

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

  return (
    <AdminContext.Provider value={{ me, view, setView, toast }}>
      <div className="adm-wrap">
        <div className="adm-app">
          <aside className="adm-side">
            <img src="/img/logo-light.svg" alt="Tantri" />
            {NAV.map((item) => (
              <button
                key={item.key}
                className={`nv ${view === item.key ? 'on' : ''}`}
                onClick={() => setView(item.key)}
              >
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

          <main className="adm-main">{children}</main>
        </div>
        <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
      </div>
    </AdminContext.Provider>
  );
}
