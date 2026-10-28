import React from "react";
import Image from "next/image";
import Link from "next/link";
import CartLength from "../common/CartLength";
import WishlistLength from "../common/WishlistLength";
import LuluNav from "./LuluNav";
import HeaderAccountMenu from "./HeaderAccountMenu";

export default function LuluHeader() {
  return (
    <header id="lulu-header" className="lulu-header">
      <div className="lulu-header__inner">
        <div className="lulu-header__left">
          <a
            href="#mobileMenu"
            className="lulu-header__burger"
            data-bs-toggle="offcanvas"
            aria-controls="mobileMenu"
            aria-label="Open menu"
          >
            <i className="icon icon-categories" />
          </a>
          <Link href="/" className="lulu-header__logo" aria-label="Lulu Sarees">
            <Image
              src="/images/logo/lulu-logo.png"
              alt="Lulu Sarees"
              width={110}
              height={109}
              priority
            />
          </Link>
        </div>

        <nav className="lulu-header__nav" aria-label="Main">
          <LuluNav />
        </nav>

        <ul className="lulu-header__icons">
          <li>
            <a
              href="#search"
              data-bs-toggle="modal"
              className="lulu-header__icon"
              aria-label="Search"
            >
              <Image src="/images/icons/search.png" alt="" width={24} height={24} />
            </a>
          </li>
          <li className="nav-account">
            {/* The account menu still opens on hover (CSS); clicking the icon opens My Account
                (it used to link to "#"). */}
            <Link href="/my-account" className="lulu-header__icon nav-icon-item" aria-label="Account">
              <Image src="/images/icons/user.png" alt="" width={20} height={19} />
              <Image
                className="lulu-header__chevron"
                src="/images/icons/chevron-down.png"
                alt=""
                width={11}
                height={6}
              />
            </Link>
            <HeaderAccountMenu />
          </li>
          <li>
            <Link href="/wish-list" className="lulu-header__icon" aria-label="Wishlist">
              <Image src="/images/icons/heart.png" alt="" width={21} height={18} />
              <span className="lulu-header__count">
                <WishlistLength />
              </span>
            </Link>
          </li>
          <li>
            <a
              href="#shoppingCart"
              data-bs-toggle="modal"
              className="lulu-header__icon lulu-header__bag"
              aria-label="Cart"
            >
              {/* The exported bag icon is the body only; the handle is drawn in CSS. */}
              <span className="lulu-header__bag-handle" />
              <Image src="/images/icons/bag.png" alt="" width={21} height={14} />
              <span className="lulu-header__count">
                <CartLength />
              </span>
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
