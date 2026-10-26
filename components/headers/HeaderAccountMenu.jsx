"use client";
import Link from "next/link";
import { accountLinks } from "@/data/luluMenu";
import { useUser } from "@/hooks/useAuth";
import LogoutButton from "@/components/auth/LogoutButton";

// Links that make no sense once logged in (My Account gets its own button instead).
const HIDE_WHEN_LOGGED_IN = new Set(["/my-account", "/forget-password"]);

/** The header's account dropdown: Login/Register for guests, greeting + Logout for customers. */
export default function HeaderAccountMenu() {
  const { data: user } = useUser();
  const links = user ? accountLinks.filter((link) => !HIDE_WHEN_LOGGED_IN.has(link.href)) : accountLinks;

  return (
    <div className="dropdown-account dropdown-login">
      <div className="sub-top">
        {user ? (
          <>
            <p className="text-center">Hi, {user.firstName || user.name || "there"}</p>
            <Link href="/my-account" className="tf-btn btn-reset">
              My Account
            </Link>
            <p className="text-center text-secondary-2">
              Not you? <LogoutButton className="lulu-link-button">Logout</LogoutButton>
            </p>
          </>
        ) : (
          <>
            <Link href="/login" className="tf-btn btn-reset">
              Login
            </Link>
            <p className="text-center text-secondary-2">
              Don’t have an account? <Link href="/register">Register</Link>
            </p>
          </>
        )}
      </div>
      <ul className="list-menu-item">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <div className="sub-bot">
        <span className="body-text-">Support</span>
      </div>
    </div>
  );
}
