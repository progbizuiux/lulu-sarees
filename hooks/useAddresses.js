import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { addressService } from "@/services/address.service";

/** The logged-in customer's saved addresses (default first). Also used by checkout. */
export function useAddresses(options = {}) {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => addressService.list(),
    ...options,
  });
}

// Changing one address can change others (only one can be the default), so refetch the list.
function useAddressMutation(mutationFn, extra = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...extra,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

/** Form errors come back as `error.fieldErrors`. @example createAddress.mutate(values) */
export const useCreateAddress = () => useAddressMutation((values) => addressService.create(values));

/** @example updateAddress.mutate({ id: address.id, values }) */
export const useUpdateAddress = () =>
  useAddressMutation(({ id, values }) => addressService.update(id, values));

/** Errors show as a pop-up message. */
export const useDeleteAddress = () =>
  useAddressMutation((addressId) => addressService.remove(addressId), { meta: { errorToast: true } });
