# Workspace

## Overview

pnpm workspace monorepo — full-stack e-commerce plant store for Tunisia ("Verdure").

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + Wouter (routing)
- **Auth**: JWT (custom implementation), bcrypt-equivalent SHA256+salt

## Project: Verdure Plant Store

A bilingual (French/Arabic) e-commerce website for selling plants in Tunisia.

**Business**: Khniss, Monastir 5011, Tunisia  
**Currency**: TND (Tunisian Dinar)  
**Admin credentials**: admin@verdure.tn / admin123

### Pages

**Public**:
- `/` — Home (hero, featured products, categories, benefits, testimonials, newsletter)
- `/shop` — Shop with filters (price, category), search, sorting, pagination
- `/product/:slug` — Product detail with image gallery, care info, reviews
- `/categories` — Category cards grid
- `/categories/:slug` — Category product listing
- `/cart` — Cart with quantity controls
- `/checkout` — Order form (name, phone, address, city, payment method)
- `/about` — About page with location info
- `/contact` — Contact form with map placeholder
- `/login` — Login
- `/register` — Register
- `/account` — User profile + order history (protected)
- `/wishlist` — Wishlist (protected)
- `/not-found` — Custom 404

**Admin** (role=admin required):
- `/admin` — Dashboard with stats + charts
- `/admin/products` — Product management (CRUD)
- `/admin/orders` — Order management + status updates
- `/admin/customers` — Customer list

### Language System

- FR (French) and AR (Arabic)
- RTL support when Arabic selected
- Stored in localStorage as `lang`
- LanguageContext: `useLang()` → `{ lang, setLang, t }`
- Translations in `artifacts/plant-store/src/lib/i18n.ts`

### Auth

- JWT stored in localStorage as `token`
- User object stored in localStorage as `user` (JSON)
- AuthContext: `useAuth()` → `{ user, token, isAuthenticated, isAdmin, setAuth, logout }`

### Cart

- CartContext: `useCart()` → `{ items, addItem, removeItem, updateQuantity, clearCart, total }`
- Persisted in localStorage

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/     # auth, products, categories, orders, users, wishlist, reviews, newsletter, admin
│   │       ├── middlewares/ # auth.ts (requireAuth, requireAdmin, optionalAuth)
│   │       └── lib/        # jwt.ts (signToken, verifyToken)
│   └── plant-store/        # React + Vite frontend
│       └── src/
│           ├── pages/      # All page components including admin/
│           ├── components/ # layout/ (Navbar, Footer, AdminLayout) + shared/ (ProductCard, CartDrawer)
│           ├── contexts/   # AuthContext, CartContext, LanguageContext
│           └── lib/        # i18n.ts (translations), api-helpers.ts
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── src/schema/     # users, categories, products, orders, wishlist, reviews, newsletter
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

Tables: `users`, `categories`, `products`, `order_items`, `orders`, `wishlist`, `reviews`, `newsletter`

## API Routes

All at `/api` prefix:
- `GET/POST /products`, `GET/PATCH/DELETE /products/:slug`, `GET /products/featured`
- `GET/POST /categories`, `GET /categories/:slug`
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `PATCH /users/profile`, `GET /users/orders`
- `POST /orders`, `GET /orders` (admin), `GET/PATCH /orders/:id`
- `GET/POST /wishlist`, `DELETE /wishlist/:productId`
- `GET/POST /reviews/:productId`
- `POST /newsletter/subscribe`
- `GET /admin/stats`, `GET /admin/customers`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` with `composite: true`.

- Run `pnpm run typecheck` from root for full typecheck
- Run `pnpm --filter @workspace/api-spec run codegen` after spec changes
- Run `pnpm --filter @workspace/db run push` after schema changes
