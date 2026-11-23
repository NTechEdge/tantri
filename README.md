# Tantri — Woven in Bengal. Worn with pride.
Full e-commerce: storefront + backend API + admin dashboard (lungi, gamcha, t-shirts).

## Run
```bash
npm install
cp .env.example .env        # then edit .env (see below)
npm run seed                # creates DB + demo products/images (once)
npm start                   # http://localhost:3000   Admin: /admin
```
Needs Node 22.13+ (uses built-in SQLite, no DB install needed).

## .env — must set
- `ADMIN_EMAILS` = your email(s). Only these can enter /admin (login by email OTP).
- `JWT_SECRET` = long random string.
- `SMTP_*` + `MAIL_FROM` = real email sending (Gmail App Password, Brevo, Zoho, etc).
  Without SMTP, emails (OTP, invoices) are saved in `./outbox` and OTP is printed in the console (dev mode).
- `SITE_URL` = your https domain in production.

## Features
- Email-OTP login (customers + admin), hashed codes, 10-min expiry, rate limits, 5-attempt lock
- Orders auto-generate a PDF invoice and email it (HTML + PDF attachment); admin gets a new-order email
- Status changes (confirmed/shipped/delivered/cancelled) email the customer; cancel restores stock
- Admin: dashboard, products (add/edit/delete/upload photos), orders, coupons/offers, customers, settings (delivery fee, bKash/Nagad numbers)
- Payments: Cash on Delivery, bKash Merchant, Rocket Merchant, Nagad, Bangla QR. Set merchant numbers + upload QR images in Admin → Settings.
  Customer pays to your merchant number/QR, enters the TrxID at checkout; you verify it in your merchant app and mark the order **Paid** (Admin → Orders).
  Methods with no number/QR set are hidden from customers (Bangla QR needs an uploaded QR image).
  Note: this is manual TrxID verification. Fully automatic confirmation needs a gateway account (bKash PGW API / SSLCommerz / aamarPay / ShurjoPay) — can be added later.
- Bangla + English storefront (default Bangla, toggle in header). Enter Bangla product names/descriptions and offer titles in Admin. Emails (OTP, invoice, status) follow the customer's language. Invoice PDF is English.
- COD, free-delivery threshold, 64-district form

## Replace demo images
Demo product pictures are generated illustrations. In Admin → Products → Edit, upload real photos (first = main).

## Production tips
Run behind HTTPS (Nginx/Caddy), use `pm2 start npm -- start`, back up `tantri.db` and `uploads/`.
