/* The live Lenis instance, held where non-provider code can reach it.
 *
 * Anything that covers the page (a modal, a side panel) has to pause the smooth
 * scroller, not only set `overflow: hidden`: Lenis drives the scroll position
 * itself from wheel events, so with only a CSS lock the page keeps moving behind
 * the overlay. `lenis.stop()` is the supported way to freeze it.
 *
 * A module singleton rather than a React context: the instance never changes for
 * the life of the app, nothing renders from it, and a context would re-render the
 * tree to hand down a value that is only read inside event handlers.
 * LenisProvider registers the instance on create and clears it on destroy.
 */

let instance = null;

// Owners that currently want the page frozen (an open modal, an open side panel...).
// The page scrolls again only when the last one lets go.
const locks = new Set();

export function setLenis(lenis) {
  instance = lenis;
  // an overlay opened before the instance existed (or while it was re-created)
  if (lenis && locks.size) lenis.stop();
}

/** The instance, or null before the provider has mounted (SSR included) and when smooth scrolling is off. */
export function getLenis() {
  return instance;
}

export function lockScroll(owner) {
  locks.add(owner);
  instance?.stop();
}

export function unlockScroll(owner) {
  locks.delete(owner);
  if (!locks.size) instance?.start();
}

/** Safety net: forget every lock and resume (used after a route change with no overlay left open). */
export function resetScrollLocks() {
  locks.clear();
  instance?.start();
}

export function hasScrollLocks() {
  return locks.size > 0;
}
