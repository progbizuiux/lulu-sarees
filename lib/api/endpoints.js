// Every ERP path lives here, relative to /api/Ecommerce/store (see lib/config.js).
// Names come from the ERP Storefront API handover (28 Oct 2026).

const id = (value) => encodeURIComponent(String(value));

export const ENDPOINTS = {
  store: {
    config: "/get-store-config",
  },
  auth: {
    login: "/login",
    register: "/sign-up",
    logout: "/logout",
    me: "/get-authentication-state",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  products: {
    list: "/get-product-list", // POST
    filters: "/get-filter-view", // POST
    detail: (idOrSlug) => `/get-product-details/${id(idOrSlug)}`,
    latest: "/get-latest-products", // ?count=
    featured: "/get-featured-products",
    bestSelling: "/get-best-selling-products",
    withVideo: "/get-products-with-video",
    categories: "/get-list-of-categories",
    compare: "/compare-products", // POST { productIDs }
  },
  cart: {
    get: "/get-cart-items",
    add: "/add-to-cart", // POST { variantID, quantity }
    update: "/update-cart-quantity", // POST { cartID, quantity }
    remove: "/remove-cart-item", // POST { cartID }
  },
  wishlist: {
    get: "/get-wishlist-items",
    toggle: (variantId) => `/add-or-remove-wishlist/${id(variantId)}`, // POST
    remove: (wishlistId) => `/remove-wishlist-item/${id(wishlistId)}`, // POST
  },
  checkout: {
    summary: "/get-checkout-summary", // POST { addressID, paymentMethod }
  },
  orders: {
    list: "/get-orders-list", // POST { page, pageSize }
    create: "/create-order-from-cart", // POST { addressID, paymentMethod }
    detail: (orderId) => `/fetch-order-details/${id(orderId)}`,
    paymentStatus: (orderId) => `/get-order-payment-status/${id(orderId)}`,
    retryPayment: (orderId) => `/retry-payment/${id(orderId)}`, // POST
    cancel: "/cancel-order", // POST { orderID, reason }
    track: "/track-order", // GET ?orderNo=&phone=
  },
  addresses: {
    list: "/get-address-list",
    save: "/save-address", // POST, addressID 0 = new
    remove: (addressId) => `/remove-address/${id(addressId)}`, // POST
    countries: "/get-list-of-countries",
    states: (countryId) => `/get-list-of-states/${id(countryId)}`,
  },
};
