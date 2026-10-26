"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { onSessionExpired } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

// Retrying a 4xx (bad input, not logged in, not found) won't help. Network and server errors get 2 retries.
function shouldRetry(failureCount, error) {
  const status = error?.status ?? 0;
  if (status >= 400 && status < 500) return false;
  return failureCount < 2;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // data counts as fresh for 1 minute
        gcTime: 5 * 60 * 1000, // unused data is kept for 5 minutes
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false, // never repeat orders, payments or cart changes automatically
      },
    },
  });
}

export default function QueryProvider({ children }) {
  // One client per browser tab, created once.
  const [queryClient] = useState(makeQueryClient);

  // When the session can't be refreshed, drop everything that belongs to the logged-in user.
  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.setQueryData(queryKeys.user, null);
        queryClient.removeQueries({ queryKey: queryKeys.orders.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      }),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only shows in development; left out of production builds automatically. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
