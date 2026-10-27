"use client";
import dynamic from "next/dynamic";

// The site's popups (cart drawer, search, quick view, menus…) aren't needed for the first paint.
// They load right after the page becomes interactive, which keeps their code and the demo product
// data out of every page's first download and out of the HTML.
const lazy = (load) => dynamic(load, { ssr: false });

const CartModal = lazy(() => import("@/components/modals/CartModal"));
const QuickView = lazy(() => import("@/components/modals/QuickView"));
const QuickAdd = lazy(() => import("@/components/modals/QuickAdd"));
const Compare = lazy(() => import("@/components/modals/Compare"));
const MobileMenu = lazy(() => import("@/components/modals/MobileMenu"));
const NewsLetterModal = lazy(() => import("@/components/modals/NewsLetterModal"));
const SearchModal = lazy(() => import("@/components/modals/SearchModal"));
const SizeGuide = lazy(() => import("@/components/modals/SizeGuide"));
const Wishlist = lazy(() => import("@/components/modals/Wishlist"));
const DemoModal = lazy(() => import("@/components/modals/DemoModal"));
const Categories = lazy(() => import("@/components/modals/Categories"));
const AccountSidebar = lazy(() => import("@/components/modals/AccountSidebar"));

export default function LazyModals() {
  return (
    <>
      <CartModal />
      <QuickView />
      <QuickAdd />
      <Compare />
      <MobileMenu />
      <NewsLetterModal />
      <SearchModal />
      <SizeGuide />
      <Wishlist />
      <DemoModal />
      <Categories />
      <AccountSidebar />
    </>
  );
}
