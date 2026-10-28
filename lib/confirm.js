// The site's own "Are you sure?" box, used instead of the browser's confirm() (which shows
// "localhost:3000 says" and can't be styled). <ConfirmDialog /> shows it; it is mounted once, in
// QueryProvider next to <Toaster />.
//
// @example
// if (await confirmAction({ title: "Clear your cart?", confirmLabel: "Clear cart" })) clearCart.mutate();

const listeners = new Set();

/**
 * Opens the confirm box and resolves true (confirmed) or false (cancelled / closed).
 * @param {{title: string, message?: string, confirmLabel?: string, cancelLabel?: string}} options
 * @returns {Promise<boolean>}
 */
export function confirmAction({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel" }) {
  return new Promise((resolve) => {
    // nothing mounted to show it (shouldn't happen): don't do the destructive action
    if (!listeners.size) return resolve(false);
    listeners.forEach((listener) => listener({ title, message, confirmLabel, cancelLabel, resolve }));
  });
}

export function subscribeToConfirms(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
