'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEMO_CATEGORIES, DEMO_CONFIG, DEMO_OFFERS } from '@/lib/demo-data';
import { priceOf, t as tr } from '@/lib/i18n';
import type { CartItem, Category, Lang, Offer, Product, StoreConfig, User } from '@/lib/types';

interface StoreContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string, ...args: (string | number)[]) => string;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  cfg: StoreConfig;
  cats: Category[];
  bannerOffer: Offer | null;
  cart: CartItem[];
  addToCart: (p: Product, opts?: { size?: string; color?: string; qty?: number; silent?: boolean }) => void;
  updateQty: (idx: number, delta: number) => void;
  removeItem: (idx: number) => void;
  clearCart: () => void;
  subtotal: number;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loginOpen: boolean;
  openLogin: (cb?: () => void) => void;
  closeLogin: () => void;
  afterLoginCb: (() => void) | null;
  toastMsg: string;
  toast: (msg: string) => void;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('bn');
  const [user, setUser] = useState<User | null>(null);
  const [cfg, setCfg] = useState<StoreConfig>(DEMO_CONFIG);
  const [cats, setCats] = useState<Category[]>(DEMO_CATEGORIES);
  const [bannerOffer, setBannerOffer] = useState<Offer | null>(DEMO_OFFERS[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [afterLoginCb, setAfterLoginCb] = useState<(() => void) | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const t = useCallback((k: string, ...args: (string | number)[]) => tr(lang, k, ...args), [lang]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(''), 2600);
    return () => clearTimeout(id);
  }, [toastMsg]);

  useEffect(() => {
    const savedLang = localStorage.getItem('tantri_lang');
    if (savedLang === 'en' || savedLang === 'bn') setLang(savedLang);
    try {
      const savedCart = JSON.parse(localStorage.getItem('tantri_cart') || '[]');
      if (Array.isArray(savedCart)) setCart(savedCart);
    } catch {
      // ignore invalid cart
    }

    (async () => {
      try {
        const [cRes, catRes, meRes, offRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/categories'),
          fetch('/api/me'),
          fetch('/api/offers/banner'),
        ]);
        if (cRes.ok) setCfg(await cRes.json());
        if (catRes.ok) setCats(await catRes.json());
        if (meRes.ok) {
          const d = await meRes.json();
          setUser(d.user || null);
        }
        if (offRes.ok) {
          const offs = await offRes.json();
          if (Array.isArray(offs) && offs.length) setBannerOffer(offs[0]);
        }
      } catch {
        // Fallback to demo state when backend APIs are unreachable
      }
    })();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const persistCart = (next: CartItem[]) => {
    setCart(next);
    localStorage.setItem('tantri_cart', JSON.stringify(next));
  };

  const toggleLang = () => {
    const next: Lang = lang === 'bn' ? 'en' : 'bn';
    setLang(next);
    localStorage.setItem('tantri_lang', next);
  };

  const addToCart = (p: Product, opts: { size?: string; color?: string; qty?: number; silent?: boolean } = {}) => {
    const key = [p.id, opts.size || '', opts.color || ''].join('|');
    const qtyToAdd = opts.qty || 1;
    const existing = cart.find((i) => i.key === key);
    let next: CartItem[];
    if (existing) {
      next = cart.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qtyToAdd, p.stock) } : i));
    } else {
      next = [
        ...cart,
        {
          key,
          id: p.id,
          slug: p.slug,
          name: p.name,
          name_bn: p.name_bn,
          image: p.images[0] || '/img/logo-mark.svg',
          price: priceOf(p),
          size: opts.size,
          color: opts.color,
          qty: qtyToAdd,
          stock: p.stock,
        },
      ];
    }
    persistCart(next);
    toast(t('added'));
    if (!opts.silent) setCartOpen(true);
  };

  const updateQty = (idx: number, delta: number) => {
    const item = cart[idx];
    if (!item) return;
    if (delta < 0 && item.qty <= 1) {
      persistCart(cart.filter((_, i) => i !== idx));
      return;
    }
    if (delta > 0 && item.qty >= item.stock) {
      toast(t('no_stock'));
      return;
    }
    persistCart(cart.map((x, i) => (i === idx ? { ...x, qty: x.qty + delta } : x)));
  };

  const removeItem = (idx: number) => {
    persistCart(cart.filter((_, i) => i !== idx));
  };

  const clearCart = () => persistCart([]);

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const openLogin = (cb?: () => void) => {
    setAfterLoginCb(() => cb || null);
    setLoginOpen(true);
  };

  const closeLogin = () => {
    setLoginOpen(false);
    setAfterLoginCb(null);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    toast(t('logged_out'));
  };

  return (
    <StoreContext.Provider
      value={{
        lang,
        toggleLang,
        t,
        user,
        setUser,
        cfg,
        cats,
        bannerOffer,
        cart,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        cartOpen,
        setCartOpen,
        loginOpen,
        openLogin,
        closeLogin,
        afterLoginCb,
        toastMsg,
        toast,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
