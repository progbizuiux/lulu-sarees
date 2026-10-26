import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { cartService } from "@/services/cart.service";

// All cart changes share one key and one queue ("scope"), so quick clicks reach the backend
// one at a time and in order. meta.errorToast shows a pop-up message if a change fails
// (QueryProvider does that); coupon errors are shown next to the coupon box instead.
const CART_MUTATION = { mutationKey: ["cart"], scope: { id: "cart" } };
const WITH_ERROR_TOAST = { errorToast: true };

/** Puts the backend's updated cart into the cache, so every cart view (navbar, drawer, page) updates. */
function useSaveCart() {
  const queryClient = useQueryClient();
  return (cart) => {
    // Another cart change is still waiting: its response will be newer, so skip this one
    // (otherwise the quantity would jump back for a moment).
    if (queryClient.isMutating({ mutationKey: ["cart"] }) > 1) return;

    if (cart) queryClient.setQueryData(queryKeys.cart, cart);
    else queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    // Checkout totals depend on the cart, so they must be fetched again.
    queryClient.invalidateQueries({ queryKey: queryKeys.checkout.all });
  };
}

/** Undo an instant (optimistic) change and fetch the real cart again. */
function useUndoCartChange() {
  const queryClient = useQueryClient();
  return (_error, _variables, context) => {
    if (context?.previous) queryClient.setQueryData(queryKeys.cart, context.previous);
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });
  };
}

/**
 * The current cart: items, item count, coupon and backend-calculated totals.
 * @example const { data: cart, isLoading } = useCart();  // cart.summary.total
 */
export function useCart(options = {}) {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => cartService.get(),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * @example
 * const addToCart = useAddToCart();
 * addToCart.mutate({ productId, quantity: 1 }, { onSuccess: openCartModal });
 * <button disabled={addToCart.isPending}>Add to cart</button>
 */
export function useAddToCart() {
  const saveCart = useSaveCart();
  return useMutation({
    ...CART_MUTATION,
    meta: WITH_ERROR_TOAST,
    mutationFn: (item) => cartService.addItem(item),
    onSuccess: saveCart,
  });
}

/**
 * Changes a line's quantity. The new quantity shows instantly and is undone if the API refuses it.
 * @example updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 });
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const saveCart = useSaveCart();
  const undo = useUndoCartChange();
  return useMutation({
    ...CART_MUTATION,
    meta: WITH_ERROR_TOAST,
    mutationFn: ({ itemId, quantity }) => cartService.updateItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previous = queryClient.getQueryData(queryKeys.cart);
      if (previous) {
        queryClient.setQueryData(queryKeys.cart, {
          ...previous,
          items: previous.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        });
      }
      return { previous };
    },
    onError: undo,
    onSuccess: saveCart,
  });
}

/** Removes a line straight away and brings it back if the API call fails. */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const saveCart = useSaveCart();
  const undo = useUndoCartChange();
  return useMutation({
    ...CART_MUTATION,
    meta: WITH_ERROR_TOAST,
    mutationFn: (itemId) => cartService.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previous = queryClient.getQueryData(queryKeys.cart);
      if (previous) {
        queryClient.setQueryData(queryKeys.cart, {
          ...previous,
          items: previous.items.filter((item) => item.id !== itemId),
        });
      }
      return { previous };
    },
    onError: undo,
    onSuccess: saveCart,
  });
}

/**
 * The backend checks the code. On failure, show `error.message` (or `error.fieldErrors.code`).
 * @example applyCoupon.mutate("LULU10");
 */
export function useApplyCoupon() {
  const saveCart = useSaveCart();
  return useMutation({
    ...CART_MUTATION,
    mutationFn: (code) => cartService.applyCoupon(code),
    onSuccess: saveCart,
  });
}

export function useRemoveCoupon() {
  const saveCart = useSaveCart();
  return useMutation({
    ...CART_MUTATION,
    meta: WITH_ERROR_TOAST,
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: saveCart,
  });
}

/** Coupons the customer can pick from on the cart page. */
export function useAvailableCoupons(options = {}) {
  return useQuery({
    queryKey: queryKeys.coupons,
    queryFn: () => cartService.getAvailableCoupons(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
