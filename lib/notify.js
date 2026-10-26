// Tiny pop-up message system. Call notify() from anywhere; <Toaster /> shows the messages.

const listeners = new Set();
let nextId = 1;

/**
 * @param {string} message
 * @param {{type?: "error"|"success"|"info", duration?: number}} [options]
 */
export function notify(message, { type = "info", duration = 4000 } = {}) {
  if (!message) return;
  const toast = { id: nextId++, message, type, duration };
  listeners.forEach((listener) => listener(toast));
}

export const notifyError = (message) => notify(message, { type: "error", duration: 5000 });

export function subscribeToNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
