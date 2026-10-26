import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { wishlistService } from "@/services/wishlist.service";

const sameId = (a, b) => String(a) === String(b);
const EMPTY_WISHLIST = { productIds: [], items: [] };

/** @example const { data } = useWishlist();  data.productIds.includes(product.id) */
export function useWishlist(options = {}) {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => wishlistService.get(),
    ...options,
  });
}

/**
 * Wishlist changes run one at a time, update the heart icon instantly,
 * and are undone (with a pop-up message) if the backend refuses them.
 */
function useWishlistMutation(mutationFn, applyInstantly) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["wishlist"],
    scope: { id: "wishlist" },
    meta: { errorToast: true },
    mutationFn,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist });
      const previous = queryClient.getQueryData(queryKeys.wishlist);
      queryClient.setQueryData(queryKeys.wishlist, applyInstantly(previous ?? EMPTY_WISHLIST, productId));
      return { previous };
    },
    onError: (_error, _productId, context) => {
      queryClient.setQueryData(queryKeys.wishlist, context?.previous);
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
    onSuccess: (wishlist) => {
      if (queryClient.isMutating({ mutationKey: ["wishlist"] }) > 1) return; // a newer change is coming
      if (wishlist) queryClient.setQueryData(queryKeys.wishlist, wishlist);
      else queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
}

export const useAddToWishlist = () =>
  useWishlistMutation(
    (productId) => wishlistService.add(productId),
    (wishlist, productId) =>
      wishlist.productIds.some((id) => sameId(id, productId))
        ? wishlist
        : { ...wishlist, productIds: [...wishlist.productIds, productId] }
  );

export const useRemoveFromWishlist = () =>
  useWishlistMutation(
    (productId) => wishlistService.remove(productId),
    (wishlist, productId) => ({
      productIds: wishlist.productIds.filter((id) => !sameId(id, productId)),
      items: wishlist.items.filter((item) => !sameId(item.id, productId)),
    })
  );
