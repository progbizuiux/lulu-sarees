import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { cartService } from "@/services/cart.service";

/** Puts the backend's updated cart into the cache, so every cart view (navbar, drawer, page) updates. */
function useSaveCart() {
  const queryClient = useQueryClient();
  return (cart) => {
    if (cart) queryClient.setQueryData(queryKeys.cart, cart);
    else queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    // Checkout totals depend on the cart, so they must be fetched again.
    queryClient.invalidateQueries({ queryKey: queryKeys.checkout.all });
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
  return useMutation({
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
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.cart, context.previous);
    },
    onSuccess: saveCart,
  });
}

/** Removes a line straight away and brings it back if the API call fails. */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const saveCart = useSaveCart();
  return useMutation({
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
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.cart, context.previous);
    },
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
    mutationFn: (code) => cartService.applyCoupon(code),
    onSuccess: saveCart,
  });
}

export function useRemoveCoupon() {
  const saveCart = useSaveCart();
  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: saveCart,
  });
}
