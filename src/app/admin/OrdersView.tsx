'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconChevronDown } from '@/components/Icons';
import { getDemoAdminOrders } from '@/lib/demo-data';
import type { Order } from '@/lib/types';
import { tk, useAdmin } from './AdminShell';

export function OrdersView() {
  const { toast } = useAdmin();
  const [orders, setOrders] = useState<Order[]>(getDemoAdminOrders);
  const [ostatus, setOstatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const r = await fetch('/api/admin/orders' + (ostatus ? `?status=${ostatus}` : '')).catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      if (Array.isArray(d)) setOrders(d);
    }
  }, [ostatus]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

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

  return (
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
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span>
                                  {i.name} {i.variant && <small className="adm-mut">({i.variant})</small>} × {i.qty}
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
                        <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
  );
}
