import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { storeService } from "@/services/store.service";

/**
 * What the shop allows (guest checkout, COD, free delivery…), from the ERP's get-store-config.
 * @example const { data: store } = useStoreConfig();  store?.allowGuestCheckout
 */
export function useStoreConfig(options = {}) {
  return useQuery({
    queryKey: queryKeys.storeConfig,
    queryFn: () => storeService.getConfig(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
