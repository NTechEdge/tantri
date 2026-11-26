'use client';

import { useEffect, useState } from 'react';
import { DEMO_CONFIG } from '@/lib/demo-data';
import type { PaymentMethodConfig } from '@/lib/types';
import { useAdmin } from './AdminShell';

export function SettingsView() {
  const { toast } = useAdmin();
  const [shippingDhaka, setShippingDhaka] = useState(String(DEMO_CONFIG.shipping_dhaka));
  const [shippingOutside, setShippingOutside] = useState(String(DEMO_CONFIG.shipping_outside));
  const [freeOver, setFreeOver] = useState(String(DEMO_CONFIG.free_shipping_over));
  const [phone, setPhone] = useState(DEMO_CONFIG.support_phone);
  const [payments, setPayments] = useState<PaymentMethodConfig[]>(DEMO_CONFIG.payments);

  useEffect(() => {
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
  }, []);

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

  return (
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
          <div key={pm.id} className="adm-card" style={{ background: '#fbf8f1', marginBottom: 12, padding: 16 }}>
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
                      setPayments((prev) => prev.map((x, i) => (i === idx ? { ...x, number: e.target.value } : x)))
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
  );
}
