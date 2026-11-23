'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/ProductCard';
import { useStore } from '@/components/store/StoreProvider';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { num, pct, priceOf, tk } from '@/lib/i18n';
import type { Product } from '@/lib/types';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t, cats, addToCart } = useStore();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [mainImg, setMainImg] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      let found: Product | null = null;
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) found = await res.json();
      } catch {
        // fallback below
      }
      if (!found) {
        const dp = DEMO_PRODUCTS.find((x) => x.slug === slug);
        if (dp) {
          found = {
            ...dp,
            related: DEMO_PRODUCTS.filter((x) => x.category_slug === dp.category_slug && x.id !== dp.id).slice(0, 4),
          };
        }
      }
      setProduct(found);
      if (found) {
        setMainImg(found.images[0] || '/img/logo-mark.svg');
        setSize(found.sizes[0] || '');
        setColor(found.colors[0] || '');
        setQty(1);
      }
    })();
  }, [slug]);

  if (product === undefined) return <div className="wrap page" />;
  if (product === null) {
    return (
      <div className="wrap page">
        <div className="empty">
          <h3>{t('nf')}</h3>
          <Link className="btn" href="/shop">
            {t('back_shop')}
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === 'bn' && product.name_bn ? product.name_bn : product.name;
  const desc = lang === 'bn' && product.description_bn ? product.description_bn : product.description;
  const cat = cats.find((c) => c.id === product.category_id || c.slug === product.category_slug);
  const catLabel = lang === 'bn' ? cat?.name_bn || product.category_name : product.category_name;
  const discountPct = pct(product);

  return (
    <div className="wrap page">
      <div className="crumb">
        <Link href="/">{t('home')}</Link> /{' '}
        <Link href={`/shop?category=${product.category_slug}`}>{catLabel}</Link> / {title}
      </div>

      <div className="pd">
        <div className="pd-gal">
          <div className="pd-main">
            <img src={mainImg} alt={title} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={src === mainImg ? 'on' : ''}
                  onClick={() => setMainImg(src)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <small style={{ color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>{catLabel}</small>
          <h1>{title}</h1>
          <div className="price">
            <b>{tk(lang, priceOf(product))}</b>
            {discountPct > 0 && (
              <>
                <s>{tk(lang, product.price)}</s>
                <em>{t('save', num(lang, discountPct))}</em>
              </>
            )}
          </div>
          <p style={{ marginTop: 8 }}>
            {product.stock <= 0 ? (
              <span className="stock no">{t('out_stock')}</span>
            ) : product.stock <= 5 ? (
              <span className="stock low">{t('only_left', num(lang, product.stock))}</span>
            ) : (
              <span className="stock ok">{t('in_stock')}</span>
            )}
          </p>
          <p className="pd-desc">{desc}</p>

          {product.sizes.length > 0 && (
            <div className="opt">
              <label>{product.category_slug === 'tshirt' ? t('size') : t('length')}</label>
              <div className="opts">
                {product.sizes.map((s) => (
                  <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 1 && (
            <div className="opt">
              <label>{t('colour')}</label>
              <div className="opts">
                {product.colors.map((c) => (
                  <button key={c} className={color === c ? 'on' : ''} onClick={() => setColor(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="opt">
            <label>{t('qty')}</label>
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{num(lang, qty)}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div className="buy">
            <button
              className="btn"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product, { size, color, qty })}
            >
              {t('add')}
            </button>
            <button
              className="btn gold"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product, { size, color, qty, silent: true });
                router.push('/checkout');
              }}
            >
              {t('buy_now')}
            </button>
          </div>

          <div className="facts">
            {product.material && (
              <div>
                <span>{t('material')}</span>
                <b>{product.material}</b>
              </div>
            )}
            {product.origin && (
              <div>
                <span>{t('origin')}</span>
                <b>{product.origin === 'Made in Bangladesh' ? t('made_bd') : product.origin}</b>
              </div>
            )}
            <div>
              <span>SKU</span>
              <b>{product.sku}</b>
            </div>
            <div>
              <span>{t('delivery')}</span>
              <b>{t('deliv_t')}</b>
            </div>
            <div>
              <span>{t('payment')}</span>
              <b>{t('pay_t')}</b>
            </div>
          </div>
        </div>
      </div>

      {product.related && product.related.length > 0 && (
        <>
          <div className="sec-h" style={{ marginTop: 80 }}>
            <h2>{t('like')}</h2>
            <span className="orn" />
          </div>
          <div className="grid">
            {product.related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
