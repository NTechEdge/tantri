'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DEMO_OFFERS } from '@/lib/demo-data';
import type { Offer } from '@/lib/types';
import { tk, useAdmin } from './AdminShell';

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

export function OffersView() {
  const { toast } = useAdmin();
  const [offers, setOffers] = useState<Offer[]>(DEMO_OFFERS);
  const [offerModal, setOfferModal] = useState<OfferFormState | null>(null);
  const [modalErr, setModalErr] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOffers = useCallback(async () => {
    const r = await fetch('/api/admin/offers').catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      if (Array.isArray(d)) setOffers(d);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

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

  return (
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
                  {o.title} {o.show_banner ? <span className="adm-pill on">banner</span> : null}
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
    </>
  );
}
