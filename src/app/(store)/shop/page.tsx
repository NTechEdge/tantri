'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/ProductCard';
import { useStore } from '@/components/store/StoreProvider';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { priceOf } from '@/lib/i18n';
import type { Product } from '@/lib/types';

function ShopContent() {
  const { lang, t, cats } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const cat = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const q = searchParams.get('q') || '';
  const cur = cats.find((c) => c.slug === cat);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?' + new URLSearchParams({ category: cat, sort, q }));
        if (res.ok) {
          setProducts(await res.json());
          return;
        }
      } catch {
        // fallback below
      }
      const list = DEMO_PRODUCTS.filter(
        (p) =>
          (!cat || p.category_slug === cat) &&
          (!q || (p.name + p.description + p.name_bn).toLowerCase().includes(q.toLowerCase()))
      );
      if (sort === 'popular') list.sort((a, b) => b.sold - a.sold);
      else if (sort === 'price_asc') list.sort((a, b) => priceOf(a) - priceOf(b));
      else if (sort === 'price_desc') list.sort((a, b) => priceOf(b) - priceOf(a));
      setProducts(list);
    })();
  }, [cat, sort, q]);

  const catName = cur ? (lang === 'bn' ? cur.name_bn : cur.name) : '';
  const catDesc = cur
    ? t('cat_' + cur.slug) === 'cat_' + cur.slug
      ? cur.description
      : t('cat_' + cur.slug)
    : t('tagline_all');

  const onSortChange = (nextSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSort) params.set('sort', nextSort);
    else params.delete('sort');
    router.push('/shop?' + params.toString());
  };

  return (
    <div className="wrap page">
      <div className="crumb">
        <Link href="/">{t('home')}</Link> / {t('shop')}
        {cur ? ` / ${catName}` : ''}
      </div>

      <div className="shop-h">
        <div>
          <h1>{q ? t('results_for', q) : cur ? catName : t('all_products')}</h1>
          <p style={{ color: 'var(--muted)' }}>{catDesc}</p>
        </div>
        <select className="sel" value={sort} onChange={(e) => onSortChange(e.target.value)}>
          <option value="">{t('s_new')}</option>
          <option value="popular">{t('s_pop')}</option>
          <option value="price_asc">{t('s_lo')}</option>
          <option value="price_desc">{t('s_hi')}</option>
        </select>
      </div>

      <div className="chips" style={{ marginBottom: 26 }}>
        <Link className={`chip ${!cat ? 'on' : ''}`} href="/shop">
          {t('nav_all')}
        </Link>
        {cats.map((c) => (
          <Link
            key={c.slug}
            className={`chip ${cat === c.slug ? 'on' : ''}`}
            href={`/shop?category=${c.slug}`}
          >
            {lang === 'bn' ? c.name_bn : c.name}
          </Link>
        ))}
      </div>

      {products.length ? (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>{t('none')}</h3>
          <p>{t('none_s')}</p>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="wrap page" />}>
      <ShopContent />
    </Suspense>
  );
}
