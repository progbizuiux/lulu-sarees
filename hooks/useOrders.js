import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { orderService } from "@/services/order.service";

/** The logged-in customer's orders. */
export function useOrders(options = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list,
    queryFn: () => orderService.list(),
    ...options,
  });
}

/** @example const { data: order } = useOrder(orderId); */
export function useOrder(orderId, options = {}) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.get(orderId),
    enabled: orderId !== undefined && orderId !== null && orderId !== "",
    ...options,
  });
}

/**
 * Public order tracking form. The result is the order (status, timeline, courier).
 * @example trackOrder.mutate({ orderNumber, contact });
 */
export function useTrackOrder() {
  return useMutation({
    mutationFn: (payload) => orderService.track(payload),
  });
}
