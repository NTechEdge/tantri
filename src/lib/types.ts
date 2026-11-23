export type Lang = 'bn' | 'en';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  description: string;
  image: string;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  description: string;
  description_bn: string;
  price: number;
  sale_price: number | null;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string;
  origin: string;
  featured: boolean | number;
  active?: boolean | number;
  sold: number;
  related?: Product[];
}

export interface Offer {
  id?: string;
  code: string;
  title: string;
  title_bn: string;
  type: 'percent' | 'flat';
  value: number;
  min_order: number;
  max_discount?: number | null;
  expires_at?: string | null;
  usage_limit?: number | null;
  used?: number;
  active?: boolean | number;
  show_banner?: boolean | number;
}

export interface PaymentMethodConfig {
  id: 'cod' | 'bkash' | 'rocket' | 'nagad' | 'bangla_qr';
  enabled: boolean | number;
  label_en: string;
  label_bn: string;
  number: string;
  qr: string;
}

export interface StoreConfig {
  shipping_dhaka: number;
  shipping_outside: number;
  free_shipping_over: number;
  support_phone: string;
  payments: PaymentMethodConfig[];
}

export interface CartItem {
  key: string;
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  qty: number;
  stock: number;
}

export interface OrderItem {
  name: string;
  variant?: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  order_no: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  note?: string;
  payment_method: string;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
  payment_ref?: string;
  payment_sender?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface AdminStats {
  revenue: number;
  orders: number;
  today_revenue: number;
  today_orders: number;
  pending: number;
  customers: number;
  days: { d: string; v: number; n: number }[];
  low_stock: { name: string; stock: number }[];
  recent: { order_no: string; name: string; total: number; status: string; created_at: string }[];
  top: { name: string; sold: number }[];
}

export interface AdminCustomer {
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  created_at: string;
}
