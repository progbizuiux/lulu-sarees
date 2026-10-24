"use client";
import { usePathname } from "next/navigation";
import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";
// Required by Lenis: unpins html/body height and makes lenis.stop() really lock scrolling.
import "lenis/dist/lenis.css";
import { canela, satoshi } from "./fonts/fonts";
import LenisProvider from "@/components/common/LenisProvider";
import { useEffect, useState } from "react";
import ScrollTop from "@/components/common/ScrollTop";
import Context from "@/context/Context";
import CartModal from "@/components/modals/CartModal";
import QuickView from "@/components/modals/QuickView";
import QuickAdd from "@/components/modals/QuickAdd";
import Compare from "@/components/modals/Compare";
import MobileMenu from "@/components/modals/MobileMenu";
import NewsLetterModal from "@/components/modals/NewsLetterModal";
import SearchModal from "@/components/modals/SearchModal";
import SizeGuide from "@/components/modals/SizeGuide";
import Wishlist from "@/components/modals/Wishlist";
import DemoModal from "@/components/modals/DemoModal";
import Categories from "@/components/modals/Categories";
import AccountSidebar from "@/components/modals/AccountSidebar";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if
      });
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (window.scrollY > 100) {
        header.classList.add("header-bg");
      } else {
        header.classList.remove("header-bg");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    setScrollDirection("up");
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // The smooth scroller keeps drifting in sub-pixel steps after the wheel stops. Ignore
      // those, or they hide the header again right after it came back (it showed twice).
      if (Math.abs(currentScrollY - lastScrollY.current) < 2) return;

      // Once the header has come back, the last bit of drift must not hide it again:
      // only a real scroll (more than 6px from where it came back) does.
      if (shownAt !== null) {
        if (Math.abs(currentScrollY - shownAt) < 6) {
          lastScrollY.current = currentScrollY;
          return;
        }
        shownAt = null;
      }

      if (currentScrollY > 250) {
        // Hidden while scrolling in either direction; the timer below brings it back
        // once scrolling stops.
        setScrollDirection("down");
      } else {
        // Below 250px
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;

      // Once scrolling has stopped, bring the header back
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        shownAt = window.scrollY;
        setScrollDirection("up");
      }, 300);
    };

    const lastScrollY = { current: window.scrollY };
    let scrollEndTimer;
    let shownAt = null; // scroll position where the header last came back

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollEndTimer);
    };
  }, [pathname]);
  useEffect(() => {
    // Close any open modal
    const bootstrap = require("bootstrap"); // dynamically import bootstrap
    const modalElements = document.querySelectorAll(".modal.show");
    modalElements.forEach((modal) => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    });

    // Close any open offcanvas
    const offcanvasElements = document.querySelectorAll(".offcanvas.show");
    offcanvasElements.forEach((offcanvas) => {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    });
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      if (scrollDirection == "up") {
        header.style.top = "0px";
      } else {
        header.style.top = "-185px";
      }
    }
    // lets sticky sections (e.g. The Festive Edit banner) step out of the header's way
    document.documentElement.classList.toggle(
      "header-visible",
      scrollDirection == "up"
    );
  }, [scrollDirection]);
  useEffect(() => {
    const WOW = require("@/utlis/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);
  return (
    <html
      lang="en"
      className={`${canela.variable} ${satoshi.variable}`}
      suppressHydrationWarning
    >
      <body className="preload-wrapper popup-loader" suppressHydrationWarning>
        <LenisProvider>
          <Context>
            <div id="wrapper">{children}</div>
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
          </Context>
        </LenisProvider>
      </body>
    </html>
  );
}
