'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/ProductCard';
import { useStore } from '@/components/store/StoreProvider';
import { DEMO_OFFERS, DEMO_PRODUCTS } from '@/lib/demo-data';
import { money, num, tk } from '@/lib/i18n';
import type { Offer, Product } from '@/lib/types';

export default function HomePage() {
  const { lang, t, cfg, cats, toast } = useStore();
  const [featured, setFeatured] = useState<Product[]>(DEMO_PRODUCTS.filter((p) => p.featured));
  const [offers, setOffers] = useState<Offer[]>(DEMO_OFFERS);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          fetch('/api/products?featured=1&limit=8'),
          fetch('/api/offers/banner'),
        ]);
        if (pRes.ok) {
          const d = await pRes.json();
          if (Array.isArray(d) && d.length) setFeatured(d);
        }
        if (oRes.ok) {
          const d = await oRes.json();
          if (Array.isArray(d)) setOffers(d);
        }
      } catch {
        // Keep demo fallback data
      }
    })();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-in">
            <div className="bn">{t('hero_bn')}</div>
            <span className="eyebrow">{t('hero_eye')}</span>
            <h1>
              {t('hero_h1a')}
              <br />
              <em>{t('hero_h1b')}</em>
            </h1>
            <p>{t('hero_p')}</p>
            <Link className="btn gold" href="/shop">
              {t('shop_coll')}
            </Link>
            <Link className="btn ghost" style={{ color: '#fff' }} href="/shop?category=lungi">
              {t('explore_lungi')}
            </Link>
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="wrap">
          <div>
            <i>🧵</i>
            <p>
              <b>{t('tr1')}</b>
              <span>{t('tr1s')}</span>
            </p>
          </div>
          <div>
            <i>🚚</i>
            <p>
              <b>{t('tr2')}</b>
              <span>{t('tr2s', money(lang, cfg.free_shipping_over))}</span>
            </p>
          </div>
          <div>
            <i>💵</i>
            <p>
              <b>{t('tr3')}</b>
              <span>{t('tr3s')}</span>
            </p>
          </div>
          <div>
            <i>✉️</i>
            <p>
              <b>{t('tr4')}</b>
              <span>{t('tr4s')}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-h">
            <h2>{t('by_cat')}</h2>
            <span className="orn" />
          </div>
          <div className="cats">
            {cats.map((c) => {
              const title = lang === 'bn' ? c.name_bn : c.name;
              const sub = lang === 'bn' ? c.name : c.name_bn;
              return (
                <Link key={c.slug} className="cat" href={`/shop?category=${c.slug}`}>
                  <img src={c.image} alt={title} />
                  <div className="cat-t">
                    <span>{sub}</span>
                    <h3>{title}</h3>
                    <small>{t('products_n', num(lang, c.count))}</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="sec-h">
            <h2>{t('fav')}</h2>
            <p>{t('fav_s')}</p>
            <span className="orn" />
          </div>
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link className="btn ghost" href="/shop">
              {t('view_all')}
            </Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap story">
          <div className="story-img" />
          <div>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>
              {t('story_eye')}
            </span>
            <h2>{t('story_h')}</h2>
            <p>{t('story_p1')}</p>
            <p>{t('story_p2')}</p>
            <div className="steps">
              <div>
                <b>{num(lang, '01')}</b>
                <p>{t('st1')}</p>
              </div>
              <div>
                <b>{num(lang, '02')}</b>
                <p>{t('st2')}</p>
              </div>
              <div>
                <b>{num(lang, '03')}</b>
                <p>{t('st3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="sec alt">
          <div className="wrap">
            <div className="sec-h">
              <h2>{t('offers')}</h2>
              <span className="orn" />
            </div>
            <div className="offers">
              {offers.map((o) => (
                <div className="offer" key={o.code}>
                  <h3>
                    {o.type === 'percent' ? `${num(lang, o.value)}% ` : `${tk(lang, o.value)} `}
                    {t('off')}
                  </h3>
                  <p>{lang === 'bn' && o.title_bn ? o.title_bn : o.title}</p>
                  <span
                    className="code"
                    onClick={() => {
                      navigator.clipboard?.writeText(o.code);
                      toast(t('copied', o.code));
                    }}
                  >
                    {o.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
