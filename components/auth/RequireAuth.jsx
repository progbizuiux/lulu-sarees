"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useAuth";
import { loginUrl } from "@/lib/auth/redirect";

/**
 * Shows its content only to logged-in users.
 * - Guests are sent to /login?redirect=<this page>, so they come back here after logging in.
 * - After logging out on a private page, the user goes to /login (no redirect back).
 *
 * This only hides pages in the browser. The real protection is the backend refusing
 * private data (401) to anyone without a valid session.
 */
export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isPending, isError, error, refetch, isFetching } = useUser();
  const hadUser = useRef(false);

  useEffect(() => {
    if (user) {
      hadUser.current = true;
      return;
    }
    if (isPending || isError) return;
    router.replace(hadUser.current ? "/login" : loginUrl(pathname + window.location.search));
  }, [user, isPending, isError, pathname, router]);

  if (user) return children;

  if (isError) {
    return (
      <div className="container text-center py-5" style={{ minHeight: "40vh" }}>
        <p className="mb-3">{error?.message ?? "We couldn't check your login. Please try again."}</p>
        <button type="button" className="tf-btn btn-fill" onClick={() => refetch()} disabled={isFetching}>
          <span className="text text-button">{isFetching ? "Trying again…" : "Try again"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading your account…</span>
      </div>
    </div>
  );
}
