'use client';

import Link from 'next/link';
import { useStore } from '@/components/store/StoreProvider';

export default function AboutPage() {
  const { t } = useStore();
  return (
    <div className="wrap page" style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 44, marginBottom: 8 }}>{t('about_h')}</h1>
      <p style={{ fontFamily: "'Hind Siliguri'", color: 'var(--maroon)', fontSize: 22, marginBottom: 22 }}>
        বুননে বাংলার ঐতিহ্য
      </p>
      <p style={{ fontSize: 17, color: '#5b4b3c', marginBottom: 16 }}>{t('about_p1')}</p>
      <p style={{ fontSize: 17, color: '#5b4b3c', marginBottom: 16 }}>{t('about_p2')}</p>
      <Link className="btn" href="/shop">
        {t('shop_now')}
      </Link>
    </div>
  );
}
