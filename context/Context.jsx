"use client";
import { openCartModal } from "@/utlis/openCartModal";
import { openWistlistModal } from "@/utlis/openWishlist";
import { useAddToCart, useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/useWishlist";
import { EMPTY_CART } from "@/lib/mappers/cart.mapper";

import React, { useMemo, useRef } from "react";
import { useContext, useState } from "react";
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
  const addingToCart = useRef(new Set()); // stops double-clicks adding the same product twice

  // The template expects product fields + quantity, with `id` being the product id.
  // `lineId` is the backend's cart line id (needed when the same product is in the cart twice,
  // e.g. in two colours).
  const cartProducts = useMemo(
    () => cart.items.map((item) => ({ ...item, id: item.productId, lineId: item.id })),
    [cart.items]
  );

  const findLine = (productId) => cart.items.find((item) => sameId(item.productId, productId));

  const isAddedToCartProducts = (id) => Boolean(findLine(id));

  const addProductToCart = (id, qty, isModal = true) => {
    const key = String(id);
    if (isAddedToCartProducts(id) || addingToCart.current.has(key)) return;

    addingToCart.current.add(key);
    addToCart.mutate(
      { productId: id, quantity: Number(qty) || 1 },
      {
        onSuccess: () => {
          if (isModal) openCartModal();
        },
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
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
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
