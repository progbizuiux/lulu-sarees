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
| Login | any valid email + password of 6+ characters |
| Email already used | register with `taken@example.com` |
| Pincode not serviceable | `999999` |
| Reset mock data | clear localStorage keys starting with `lulu-mock:` |
