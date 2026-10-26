import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { checkoutService } from "@/services/checkout.service";

/**
 * Backend-calculated totals for checkout. Changing the params (payment method, address) refetches them.
 * @example const { data } = useCheckoutSummary({ paymentMethod: "cod", addressId });
 */
export function useCheckoutSummary(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.checkout.summary(params),
    queryFn: () => checkoutService.getSummary(params),
    staleTime: 0, // totals must always be current
    ...options,
  });
}

/**
 * Runs only once a full 6-digit pincode is typed.
 * @example const { data } = usePincodeCheck(pincode);  data?.serviceable, data?.codAvailable
 */
export function usePincodeCheck(pincode, options = {}) {
  return useQuery({
    queryKey: queryKeys.checkout.pincode(pincode),
    queryFn: () => checkoutService.checkPincode(pincode),
    enabled: /^\d{6}$/.test(String(pincode || "")),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Places the order. Use `isPending` to disable the button and prevent double orders.
 * - COD: result.payment is null, the order is confirmed → go to the success page.
 * - Online: open the gateway with result.payment, then call useVerifyPayment.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => checkoutService.placeOrder(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (!result?.payment) queryClient.invalidateQueries({ queryKey: queryKeys.cart }); // COD: cart is now empty
    },
  });
}

/** Sends the gateway response to the backend to confirm payment. Only show success after this succeeds. */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => checkoutService.verifyPayment(payload),
    onSuccess: (order) => {
      if (order?.id !== undefined) queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
