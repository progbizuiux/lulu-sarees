"use client";
import { openCartModal } from "@/utlis/openCartModal";
import { openWistlistModal } from "@/utlis/openWishlist";
import { useAddToCart, useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/useWishlist";
import { EMPTY_CART } from "@/lib/mappers/cart.mapper";

import React, { useMemo, useRef } from "react";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

const sameId = (a, b) => String(a) === String(b);

/**
 * Shared shop state for the template's components.
 *
 * The cart and wishlist come from the backend (or the mock backend) through React Query.
 * The function names below are the ones the template's ~95 components already use, so they
 * keep working unchanged. New code can use the hooks in hooks/useCart.js and hooks/useWishlist.js
 * directly. Compare and quick view are UI-only and stay local.
 */
export default function Context({ children }) {
  // ---- Cart
  const { data: cart = EMPTY_CART, isPending: isCartLoading } = useCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const addingToCart = useRef(new Set()); // ignores a second click while the first add is still saving

  // The template expects product fields + quantity, with `id` being the product id.
  // `lineId` is the backend's cart line id (needed when the same product is in the cart twice,
  // e.g. in two colours).
  const cartProducts = useMemo(
    () => cart.items.map((item) => ({ ...item, id: item.productId, lineId: item.id })),
    [cart.items]
  );

  const findLine = (productId) => cart.items.find((item) => sameId(item.productId, productId));

  const isAddedToCartProducts = (id) => Boolean(findLine(id));

  // Adding a product that is already in the cart raises its quantity (the backend adds `qty` more).
  // `variantId`: the colour/size option picked on the product page, when the product has options.
  const addProductToCart = (id, qty, isModal = true, variantId = null) => {
    const key = String(id);
    if (addingToCart.current.has(key)) return;

    addingToCart.current.add(key);
    addToCart.mutate(
      { productId: id, variantId, quantity: Number(qty) || 1 },
      {
        onSuccess: () => {
          if (isModal) openCartModal();
        },
        onSettled: () => addingToCart.current.delete(key),
      }
    );
  };

  // "Buy it now": buys the quantity chosen on the page — puts it in the cart (or sets the cart's
  // quantity to it if the item is already there) and goes to checkout.
  const router = useRouter();
  const goToCheckout = () => {
    // close an open popup (e.g. quick view) so its dark backdrop doesn't stay over the checkout page
    const bootstrap = require("bootstrap");
    document.querySelectorAll(".modal.show").forEach((el) => bootstrap.Modal.getInstance(el)?.hide());
    router.push("/checkout");
  };
  const buyNow = (id, qty, variantId = null) => {
    const line = findLine(id);
    if (line) {
      const quantity = Number(qty) || 1;
      if (quantity === line.quantity) return goToCheckout();
      updateCartItem.mutate({ itemId: line.id, quantity }, { onSuccess: goToCheckout });
      return;
    }
    const key = String(id);
    if (addingToCart.current.has(key)) return;

    addingToCart.current.add(key);
    addToCart.mutate(
      { productId: id, variantId, quantity: Number(qty) || 1 },
      {
        onSuccess: goToCheckout,
        onSettled: () => addingToCart.current.delete(key),
      }
    );
  };

  const updateQuantity = (id, qty) => {
    const line = findLine(id);
    const quantity = Number(qty);
    if (!line || !Number.isFinite(quantity) || quantity === line.quantity) return;
    if (quantity < 1) removeCartItem.mutate(line.id);
    else updateCartItem.mutate({ itemId: line.id, quantity });
  };

  const removeFromCart = (id) => {
    const line = findLine(id);
    if (line) removeCartItem.mutate(line.id);
  };

  // Old components set the cart array directly. The cart now lives on the backend, so that
  // can't work any more: use addProductToCart / updateQuantity / removeFromCart instead.
  const setCartProducts = () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("setCartProducts() is no longer supported. Use addProductToCart, updateQuantity or removeFromCart.");
    }
  };

  // Number shown on the cart icon (follows instant quantity changes).
  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  // ---- Wishlist
  const { data: wishlist } = useWishlist();
  const addWishlistItem = useAddToWishlist();
  const removeWishlistItem = useRemoveFromWishlist();
  const wishList = useMemo(() => wishlist?.productIds ?? [], [wishlist]);

  const isAddedtoWishlist = (id) => wishList.some((wishId) => sameId(wishId, id));

  // The heart buttons toggle: a second click removes the item again.
  const addToWishlist = (id) => {
    if (isAddedtoWishlist(id)) {
      removeWishlistItem.mutate(id);
      return;
    }
    addWishlistItem.mutate(id);
    openWistlistModal();
  };

  const removeFromWishlist = (id) => {
    if (isAddedtoWishlist(id)) removeWishlistItem.mutate(id);
  };

  // ---- Compare and quick view (UI only, unchanged)
  const [compareItem, setCompareItem] = useState([]); // starts empty (the template pre-filled 3 demo products)
  // Set when a product's "Quick view" is clicked. Starts empty so the big demo product file isn't
  // loaded on every page just for a starting value.
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickAddItem, setQuickAddItem] = useState(1);

  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoCompareItem = (id) => compareItem.includes(id);

  const contextElement = {
    // cart
    cart,
    cartProducts,
    cartCount,
    isCartLoading,
    totalPrice: cart.summary.subtotal, // from the backend
    addProductToCart,
    buyNow,
    isAddedToCartProducts,
    updateQuantity,
    removeFromCart,
    setCartProducts,
    // wishlist
    wishList,
    wishlistItems: wishlist?.items ?? [],
    addToWishlist,
    removeFromWishlist,
    isAddedtoWishlist,
    // compare and quick view
    quickViewItem,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
