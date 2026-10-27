import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRedirectParam } from "@/lib/auth/redirect";
import { queryKeys } from "@/lib/query/keys";
import { authService } from "@/services/auth.service";

/**
 * The logged-in user, or null for guests.
 * @example const { data: user, isLoading } = useUser();  const isLoggedIn = Boolean(user);
 */
export function useUser(options = {}) {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// After logging in or out, the cart and wishlist change (guest cart merges into the account).
function useRefreshUserData() {
  const queryClient = useQueryClient();
  return (user) => {
    queryClient.setQueryData(queryKeys.user, user ?? null);
    queryClient.removeQueries({ queryKey: queryKeys.orders.all });
    queryClient.removeQueries({ queryKey: queryKeys.addresses });
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    queryClient.invalidateQueries({ queryKey: queryKeys.checkout.all });
  };
}

/**
 * For login/register pages: once a user is logged in (already, or just now), send them on
 * to ?redirect= (if it's one of our pages) or to My Account.
 */
export function useRedirectIfLoggedIn() {
  const router = useRouter();
  const { data: user } = useUser();

  useEffect(() => {
    if (user) router.replace(getRedirectParam());
  }, [user, router]);

  return user;
}

/**
 * Form errors come back as `error.fieldErrors` (e.g. { email: "..." }); the general message as `error.message`.
 * @example login.mutate({ email, password });
 */
export function useLogin() {
  const refresh = useRefreshUserData();
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: refresh,
  });
}

export function useRegister() {
  const refresh = useRefreshUserData();
  return useMutation({
    mutationFn: (details) => authService.register(details),
    onSuccess: refresh,
  });
}

/** Clears the user locally even if the logout request fails, so the customer is never stuck logged in. */
export function useLogout() {
  const refresh = useRefreshUserData();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => refresh(null),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload) => authService.forgotPassword(payload),
  });
}
