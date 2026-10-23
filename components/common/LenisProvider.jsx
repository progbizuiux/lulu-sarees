"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  getLenis,
  hasScrollLocks,
  lockScroll,
  resetScrollLocks,
  setLenis,
  unlockScroll,
} from "@/utlis/lenis";

/* The route scroll reset has to land before the browser paints the new page, or
   the first frame shows at the old page's offset. useLayoutEffect runs there; it
   does not exist on the server and React warns if it is called during SSR, so use
   useEffect for that pass only. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Bootstrap popups and side panels that cover the page (they scroll on their own).
const OVERLAY_SELECTOR = ".modal, .offcanvas";
const OVERLAY_EVENTS = ["modal", "offcanvas"];

export default function LenisProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  /* Start every route at the top.
   *
   * Lenis owns the window scroll position: each frame it eases the window toward
   * its own target. Next scrolls the window to the top when a page mounts, but
   * Lenis only adopts an outside scroll while it is idle, and it is rarely idle
   * the moment a link is clicked, so it would keep easing toward the OLD page's
   * target and drag the new page back down. stop() then start() is the public way
   * to cancel that in-flight ease (the same reset `scrollTo` skips when the target
   * is unchanged). Skip it while an overlay holds Lenis stopped on purpose.
   *
   * A URL that names a target (#section) is asking for that element, not the top. */
  useIsomorphicLayoutEffect(() => {
    if (window.location.hash) return;

    // no overlay actually left open: drop any lock a missed `hidden` event left behind
    if (hasScrollLocks() && !document.querySelector(".modal.show, .offcanvas.show")) {
      resetScrollLocks();
    }

    const lenis = getLenis();
    if (lenis) {
      if (!lenis.isStopped) {
        lenis.stop();
        lenis.start();
      }
      lenis.resize(); // measure the new page, not the old one
      lenis.scrollTo(0, { immediate: true, force: true });
    }

    // Unconditional and last: covers the first render (before the instance exists) and
    // the case where Lenis is already at 0 and its scrollTo is a no-op. `instant`, because
    // the site's CSS sets `scroll-behavior: smooth` on <html>.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    // People who ask their system for less motion keep plain native scrolling.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;

    const create = () => {
      lenis = new Lenis({
        // lerp, not duration/easing: Lenis runs one animator or the other. A lerp has no
        // end time, it eases toward a moving target each frame, so new wheel ticks blend
        // into the motion already under way instead of restarting a fixed tween. Same
        // value as the Fortune Tours site.
        lerp: 0.055,
        // No GSAP ticker on this site, so Lenis runs its own requestAnimationFrame loop
        // (and stops it on destroy).
        autoRaf: true,
        // Touch keeps the phone's own momentum scrolling (syncTouch stays false).
        // Cancels the in-flight ease when an internal link to another path is clicked.
        stopInertiaOnNavigate: true,
        // Anchors stay OFF: this site uses href="#search" / "#shoppingCart" / "#mobileMenu"
        // to open Bootstrap popups, and Lenis would try to scroll to those ids.
        anchors: false,
        // Anything inside a popup or side panel scrolls natively.
        prevent: (node) => !!node.closest?.(OVERLAY_SELECTOR),
      });
      setLenis(lenis);
    };

    const destroy = () => {
      if (!lenis) return;
      setLenis(null);
      lenis.destroy();
      lenis = null;
    };

    const syncWithPreference = () => {
      if (reduceMotion.matches) destroy();
      else if (!lenis) create();
    };
    syncWithPreference();
    reduceMotion.addEventListener("change", syncWithPreference);

    // Freeze the page under Bootstrap popups / side panels, release it when the last one closes.
    // "shown" (not "show"): a popup whose opening is cancelled never leaves a lock behind.
    const onShown = (e) => lockScroll(e.target);
    const onHidden = (e) => unlockScroll(e.target);
    OVERLAY_EVENTS.forEach((name) => {
      document.addEventListener(`shown.bs.${name}`, onShown);
      document.addEventListener(`hidden.bs.${name}`, onHidden);
    });

    return () => {
      OVERLAY_EVENTS.forEach((name) => {
        document.removeEventListener(`shown.bs.${name}`, onShown);
        document.removeEventListener(`hidden.bs.${name}`, onHidden);
      });
      reduceMotion.removeEventListener("change", syncWithPreference);
      destroy();
    };
  }, []);

  return children;
}
