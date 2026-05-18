# Store E-Commerce

A cash-on-delivery (COD) e-commerce storefront built with Next.js 16, Firebase, Cloudinary, TanStack Query, and Zustand.

## Features

- Product catalog and cart (guest checkout)
- COD checkout with order confirmation
- Order tracking by order ID
- Optional customer accounts (`/account`)
- Admin panel: product CRUD, order management, status updates

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Firebase project (Firestore + Authentication)
- Cloudinary account (admin product images)

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment variables**

   Copy [`.env.example`](.env.example) to `.env.local` and fill in your values:

   - `NEXT_PUBLIC_FIREBASE_*` — Firebase web app config
   - `NEXT_PUBLIC_ADMIN_EMAILS` — comma-separated admin emails
   - `CLOUDINARY_*` — server-side image upload (admin only)
   - `NEXT_PUBLIC_STORE_NAME`, currency settings (optional)

3. **Firebase**

   - Enable **Firestore** and **Authentication** (Email/Password)
   - Create an admin user in Authentication with an email listed in `NEXT_PUBLIC_ADMIN_EMAILS`
   - Deploy Firestore security rules — see [Firestore security rules](docs/ECOM_BUILD_GUIDE.md#firestore-security-rules-outline) in the build guide

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Build guide

Full phased implementation plan, schema, and acceptance criteria:

**[docs/ECOM_BUILD_GUIDE.md](docs/ECOM_BUILD_GUIDE.md)**

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Start development server |
| `pnpm build`   | Production build         |
| `pnpm start`   | Start production server  |
| `pnpm lint`    | Run ESLint               |

## Project structure (high level)

| Path | Purpose |
|------|---------|
| `src/app/shop` | Storefront catalog |
| `src/app/cart`, `checkout` | Cart and COD checkout |
| `src/app/order`, `track-order` | Confirmation and tracking |
| `src/app/admin` | Admin auth, products, orders |
| `src/lib/firebase` | Firebase client and server helpers |
| `src/lib/queries` | Firestore data access |
| `src/stores/cart-store.ts` | Persisted cart (Zustand) |

## Payment

This store supports **cash on delivery (COD) only**. No payment gateway integration.

## Order emails (optional)

When an admin sets an order status to **Transferred** (accepted), the customer receives an email with order details via Nodemailer (Gmail SMTP: `smtp.gmail.com:587`). Configure credentials in `.env.local`:

- `SMTP_USER` — Gmail address
- `SMTP_PASS` — Gmail app password
- `NEXT_PUBLIC_APP_URL` — used for track-order links in emails

The sender name uses `NEXT_PUBLIC_STORE_NAME`; the from address is `{store name} <{SMTP_USER}>`.

If SMTP credentials are not set, status updates still work; emails are skipped with a server log warning.

## Deploy

Deploy to [Vercel](https://vercel.com) or any Node.js host. Set the same environment variables in your hosting dashboard. Restart the app after changing env vars.
