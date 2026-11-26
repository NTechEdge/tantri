'use client';

import { useEffect, useState } from 'react';
import { IconAlert, IconAward, IconCheck } from '@/components/Icons';
import { getDemoAdminStats } from '@/lib/demo-data';
import type { AdminStats } from '@/lib/types';
import { tk } from './AdminShell';

export function DashboardView() {
  const [stats, setStats] = useState<AdminStats>(getDemoAdminStats);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  const maxDayRev = Math.max(...stats.days.map((d) => d.v), 1);

  return (
    <>
      <div className="adm-top">
        <h1>Dashboard</h1>
      </div>
      <div className="adm-kpis">
        <div className="adm-kpi">
          <span>Total revenue</span>
          <b>{tk(stats.revenue)}</b>
          <small>{stats.orders} orders</small>
        </div>
        <div className="adm-kpi">
          <span>Today</span>
          <b>{tk(stats.today_revenue)}</b>
          <small>{stats.today_orders} orders</small>
        </div>
        <div className="adm-kpi">
          <span>Pending orders</span>
          <b>{stats.pending}</b>
          <small>need action</small>
        </div>
        <div className="adm-kpi">
          <span>Customers</span>
          <b>{stats.customers}</b>
          <small>registered</small>
        </div>
      </div>

      <div className="adm-g">
        <div className="adm-card">
          <h3>Sales — last 7 days</h3>
          <div className="adm-bars">
            {stats.days.map((d) => (
              <div className="adm-bar" key={d.d}>
                <b>{d.v ? tk(d.v) : ''}</b>
                <i style={{ height: `${(d.v / maxDayRev) * 100}%` }} />
                <small>{new Date(d.d).toLocaleDateString('en-GB', { weekday: 'short' })}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="adm-card">
          <h3 className="adm-h-ico">
            <IconAlert size={16} /> Low stock
          </h3>
          {stats.low_stock.length ? (
            <table>
              <tbody>
                {stats.low_stock.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>
                      <span className={`adm-pill ${p.stock ? '' : 'off'}`}>{p.stock} left</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="adm-emp adm-h-ico" style={{ justifyContent: 'center' }}>
              <IconCheck size={16} /> All products well stocked
            </div>
          )}
        </div>
      </div>

      <div className="adm-g">
        <div className="adm-card">
          <h3>Recent orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o.order_no}>
                  <td>
                    <b>#{o.order_no}</b>
                  </td>
                  <td>{o.name}</td>
                  <td>{tk(o.total)}</td>
                  <td>
                    <span className={`adm-pill ${o.status}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-card">
          <h3 className="adm-h-ico">
            <IconAward size={16} /> Best sellers
          </h3>
          <table>
            <tbody>
              {stats.top.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>
                    <b>{p.sold}</b> sold
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
