'use client';

import Link from 'next/link';
import { num, pct, priceOf, tk } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { useStore } from './StoreProvider';

export function ProductCard({ product }: { product: Product }) {
  const { lang, t, cats } = useStore();
  const title = lang === 'bn' && product.name_bn ? product.name_bn : product.name;
  const discountPct = pct(product);
  const cat = cats.find((c) => c.id === product.category_id || c.slug === product.category_slug);
  const catLabel = lang === 'bn' ? cat?.name_bn || product.category_name : product.category_name;

  return (
    <article className="card">
      <Link href={`/product/${product.slug}`} className="card-img">
        <img loading="lazy" src={product.images[0] || '/img/logo-mark.svg'} alt={title} />
        {product.stock <= 0 ? (
          <span className="tag out">{t('sold_out')}</span>
        ) : discountPct > 0 ? (
          <span className="tag">−{num(lang, discountPct)}%</span>
        ) : null}
      </Link>
      <div className="card-b">
        <small>{catLabel}</small>
        <Link href={`/product/${product.slug}`}>
          <h3>{title}</h3>
        </Link>
        <div className="price">
          <b>{tk(lang, priceOf(product))}</b>
          {discountPct > 0 && <s>{tk(lang, product.price)}</s>}
        </div>
      </div>
    </article>
  );
}
