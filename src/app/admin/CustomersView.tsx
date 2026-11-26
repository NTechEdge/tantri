'use client';

import { useEffect, useState } from 'react';
import { getDemoAdminCustomers } from '@/lib/demo-data';
import type { AdminCustomer } from '@/lib/types';
import { tk } from './AdminShell';

export function CustomersView() {
  const [customers, setCustomers] = useState<AdminCustomer[]>(getDemoAdminCustomers);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => Array.isArray(d) && setCustomers(d))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="adm-top">
        <h1>Customers</h1>
      </div>
      <div className="adm-card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr className="hv" key={c.email}>
                <td>
                  <b>{c.name || '—'}</b>
                  <br />
                  <small className="adm-mut">{c.email}</small>
                </td>
                <td>{c.phone || '—'}</td>
                <td>{c.orders}</td>
                <td>
                  <b>{tk(c.spent)}</b>
                </td>
                <td className="adm-mut">
                  {c.created_at
                    ? new Date(c.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
