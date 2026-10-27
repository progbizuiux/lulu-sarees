"use client";
import { useLogout } from "@/hooks/useAuth";

/**
 * Logs out through the backend (which clears the auth cookies).
 * Extra props (e.g. data-bs-dismiss="offcanvas") are passed to the button.
 */
export default function LogoutButton({ className = "", children = "Logout", ...props }) {
  const logout = useLogout();

  return (
    <button
      type="button"
      className={className}
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      aria-busy={logout.isPending}
      {...props}
    >
      {children}
    </button>
  );
}
