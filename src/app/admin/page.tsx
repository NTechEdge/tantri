'use client';

import { useAdmin } from './AdminShell';
import { CustomersView } from './CustomersView';
import { DashboardView } from './DashboardView';
import { OffersView } from './OffersView';
import { OrdersView } from './OrdersView';
import { ProductsView } from './ProductsView';
import { SettingsView } from './SettingsView';

export default function AdminPage() {
  const { view } = useAdmin();

  if (view === 'products') return <ProductsView />;
  if (view === 'orders') return <OrdersView />;
  if (view === 'offers') return <OffersView />;
  if (view === 'customers') return <CustomersView />;
  if (view === 'settings') return <SettingsView />;
  return <DashboardView />;
}
