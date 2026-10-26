import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { wishlistService } from "@/services/wishlist.service";

/** @example const { data } = useWishlist();  data.productIds.includes(product.id) */
export function useWishlist(options = {}) {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => wishlistService.get(),
    ...options,
  });
}

function useWishlistMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (wishlist) => {
      if (wishlist) queryClient.setQueryData(queryKeys.wishlist, wishlist);
      else queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
}

export const useAddToWishlist = () => useWishlistMutation((productId) => wishlistService.add(productId));

export const useRemoveFromWishlist = () => useWishlistMutation((productId) => wishlistService.remove(productId));
