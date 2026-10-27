"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Browser-only page behaviour that used to live in app/layout.js (moved here so the layout can be a
 * server component with site-wide metadata):
 * - loads Bootstrap's JavaScript (modals, offcanvas, dropdowns)
 * - header background after scrolling, and the header that hides while scrolling
 * - closes any open popup when the page changes
 * - the template's scroll animations (WOW.js)
 * Renders nothing.
 */
export default function ClientEffects() {
  const pathname = usePathname();
  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.esm");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (!header) return;
      if (window.scrollY > 100) header.classList.add("header-bg");
      else header.classList.remove("header-bg");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setScrollDirection("up");
    const lastScrollY = { current: window.scrollY };
    let scrollEndTimer;
    let shownAt = null; // scroll position where the header last came back

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

      // Hidden while scrolling in either direction; the timer below brings it back once scrolling stops.
      setScrollDirection("down");
      lastScrollY.current = currentScrollY;

      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        shownAt = window.scrollY;
        setScrollDirection("up");
      }, 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollEndTimer);
    };
  }, [pathname]);

  // Close any open modal or offcanvas when the page changes.
  useEffect(() => {
    const bootstrap = require("bootstrap");
    document.querySelectorAll(".modal.show").forEach((modal) => {
      bootstrap.Modal.getInstance(modal)?.hide();
    });
    document.querySelectorAll(".offcanvas.show").forEach((offcanvas) => {
      bootstrap.Offcanvas.getInstance(offcanvas)?.hide();
    });
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) header.style.top = scrollDirection == "up" ? "0px" : "-185px";
    // lets sticky sections (e.g. The Festive Edit banner) step out of the header's way
    document.documentElement.classList.toggle("header-visible", scrollDirection == "up");
  }, [scrollDirection]);

  useEffect(() => {
    const WOW = require("@/utlis/wow");
    new WOW.default({ mobile: false, live: false }).init();
  }, [pathname]);

  return null;
}
