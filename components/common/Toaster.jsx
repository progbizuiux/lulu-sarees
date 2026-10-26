"use client";
import { useEffect, useState } from "react";
import { subscribeToNotifications } from "@/lib/notify";

const MAX_VISIBLE = 3;

/** Shows messages sent with notify(). Mounted once, in QueryProvider. */
export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();
    const unsubscribe = subscribeToNotifications((toast) => {
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), toast]);
      const timer = setTimeout(() => {
        timers.delete(timer);
        setToasts((list) => list.filter((item) => item.id !== toast.id));
      }, toast.duration);
      timers.add(timer);
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  const dismiss = (id) => setToasts((list) => list.filter((item) => item.id !== id));

  return (
    <div className="lulu-toaster" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`lulu-toast lulu-toast--${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span>{toast.message}</span>
          <button type="button" className="lulu-toast__close" onClick={() => dismiss(toast.id)} aria-label="Close">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
