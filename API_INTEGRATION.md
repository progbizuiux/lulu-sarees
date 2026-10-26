# API integration guide

How the frontend talks to the .NET backend, and what to change when the real APIs arrive.

## How a request flows

```
Page / component
  → hooks/        React Query hooks (loading, errors, caching, refetching)
  → services/     one function per backend action
  → lib/mappers/  converts backend data to the shape the UI uses
  → lib/api/      axios client (base URL, cookies, token refresh, errors)
  → .NET API
```

While `NEXT_PUBLIC_USE_MOCKS=true`, services use `lib/mocks/` (built on `data/products.js`) instead of the API.

## When the real APIs arrive

1. **`.env.local`**: set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_MOCKS=false`, then restart `npm run dev`.
2. **`lib/api/endpoints.js`**: replace the placeholder paths with the real routes.
3. **`lib/api/client.js`**: if every response is wrapped (e.g. `{ success, data }`), change `unwrap` to `response.data?.data`.
4. **`lib/mappers/*.js`**: rename the backend fields to match the real responses. Pages and hooks don't change.
5. **Auth**: confirm the refresh endpoint and whether a CSRF header is needed (see `client.js`).
6. **Session cookie** (on hold): once the backend confirms its cookie name and that it's set for our
   domain, put it in `AUTH_COOKIE_NAME` to turn on the server-side redirect in `middleware.js`.
   Until then the middleware stays off and `RequireAuth` protects the account pages on its own.
7. **Guest wishlist**: guests can have a wishlist. Confirm whether the backend stores it for guests
   or the frontend keeps it in the browser, and whether it merges into the account on login.

## Shop and product pages

- **Shop filters live in the URL**, e.g. `/shop-default-grid?category=silk-sarees&color=Red&sort=price-asc&page=2`
  (see `lib/shop/filters.js`). `mapProductQuery` in `lib/mappers/product.mapper.js` turns them into the
  backend's query params: `page, pageSize, search, category, sortBy, color, size, brands, onSale, minPrice, maxPrice, inStock`.
- **Ask the backend to return filter options ("facets") with the product list**, so the filter panel only
  offers choices that exist:
  ```json
  { "items": [...], "page": 1, "pageSize": 12, "totalCount": 47, "totalPages": 4,
    "facets": { "categories": [{ "slug": "silk-sarees", "name": "Silk Sarees", "count": 12 }],
                "colors": [{ "name": "Red", "hex": "#c0392b", "count": 8 }],
                "sizes": [{ "name": "Free Size", "count": 30 }],
                "brands": [], "availability": { "inStock": 40, "outOfStock": 7 },
                "priceRange": { "min": 499, "max": 24999 } } }
  ```
  Without facets, the panel shows only the price slider and availability.
- **The product page loads on the server** (`app/(productDetails)/product-detail/[id]/page.jsx`), so search
  engines see it. A 404 from the API shows the 404 page; other errors show a "Try again" page.
- **Product photos**: send an `images` array. The product page uses it for its gallery.
- **Still demo data** (need backend endpoints later): home page sections, related products,
  the cart drawer's "You may also like", and the search page's "Product Recent".

## Account: orders, addresses, tracking

- **Orders** (`/my-account-orders`, `/my-account-orders-details?id=…`): the backend should return only the
  logged-in customer's orders, newest first, and 404 for anyone else's order.
- **Order history and courier**: send a `timeline` array (`[{ status, date, note }]`) and a `tracking` object
  (`{ courier, trackingNumber, trackingUrl, estimatedDelivery }`). Status names are shown through
  `lib/orders/status.js`; add the backend's real status codes there.
- **Addresses** (`/my-account-address`): Indian fields only (`firstName, lastName, phone, line1, line2, city,
  state, pincode, label, isDefault`). Phone numbers are sent as 10 digits. Only one address can be the default.
  The same form (`components/my-account/AddressForm.jsx`) will be used at checkout.
- **Order tracking** (`/order-tracking`, no login): `POST /orders/track` with `{ orderNumber, contact }`, where
  contact is the email or phone used for the order. The backend must give the same error for a wrong number
  and a wrong contact, so the form can't be used to guess other people's orders.

## Checkout and payment

- **Place order** (`POST /orders`, see `mapPlaceOrderInput`): `{ paymentMethod: "cod" | "online", addressId }` for
  logged-in customers, or `{ paymentMethod, shippingAddress, email }` for guests, plus an optional `note`.
  The cart and coupon are already on the backend.
- **Response**: the order, plus for online payment a `payment` object:
  `{ provider: "razorpay", gatewayOrderId: "order_XXX", key: "rzp_live_or_test_key_id", currency: "INR" }`.
  `key` is the **public** key id only. The amount comes from the Razorpay order the backend creates.
- **Verify** (`POST /payments/verify`): `{ orderId, gatewayOrderId, gatewayPaymentId, signature }`. The backend
  checks the signature with its secret and confirms the order. The success page only opens after this succeeds.
- **Retries**: if payment fails or is cancelled, the customer retries **the same order** (same Razorpay order id).
  Changing the cart, address or payment method places a new order next time.
- **Webhook** (backend): please also confirm payments from Razorpay's `payment.captured` webhook, in case the
  customer closes the browser after paying but before verify runs.
- **Card details never touch our site**: they are typed into Razorpay's window.
- In mock mode, `payment.key` is empty and a test payment window appears (pay / fail / close).

## Private pages

| Page | Who can see it | How |
|---|---|---|
| `/my-account`, `/my-account-orders`, `/my-account-orders-details`, `/my-account-address` | Logged-in users | `RequireAuth` in the page + `middleware.js` |
| `/login`, `/register` | Guests (logged-in users are sent to My Account) | `useRedirectIfLoggedIn` |
| `/checkout` | Everyone (guest checkout is allowed) | Not protected |
| `/wish-list` | Everyone (guests can have a wishlist) | Not protected |

To protect a new page: wrap its content in `<RequireAuth>` and add its path to `matcher` in `middleware.js`.
These only hide pages. The backend must still return 401 for private data without a valid session.

## Rules

- The backend calculates every price (totals, discounts, shipping, COD fee, tax). The frontend only displays them.
- Tokens live in httpOnly cookies set by the backend. Never store tokens in localStorage or state.
- Show `error.message` to users. Use `error.fieldErrors.<field>` to highlight form fields.
- Disable submit buttons while a mutation `isPending`.

## Mock test data

| Case | How |
|---|---|
| Valid coupons | `LULU10` (10% off), `WELCOME200` (₹200 off, min ₹1999) |
| Invalid coupon | any other code |
| Login | any valid email + any password of 6+ characters |
| Register | first name + any valid email + password of 8+ characters (last name optional) |
| Email already used | register with `taken@example.com` |
| Pincode not serviceable | `999999` |
| Orders and tracking | mock orders are created by checkout (Phase 4); they belong to the logged-in email |
| Reset mock data | clear localStorage keys starting with `lulu-mock:` |
