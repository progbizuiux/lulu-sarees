"use client";
import { useEffect, useRef, useState } from "react";
import { subscribeToConfirms } from "@/lib/confirm";

/**
 * Shows the boxes opened with confirmAction() (lib/confirm.js). Mounted once, in QueryProvider.
 * Escape, "Cancel" or a click outside the box cancels. Works on top of the cart drawer too.
 */
export default function ConfirmDialog() {
  const [request, setRequest] = useState(null);
  const rootRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(
    () =>
      subscribeToConfirms((next) =>
        setRequest((current) => {
          current?.resolve(false); // a newer question replaces an unanswered one
          return next;
        })
      ),
    []
  );

  const answer = (value) => {
    request?.resolve(value);
    setRequest(null);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!request || !root) return;

    const previousFocus = document.activeElement;
    // focus the box itself (screen readers read the question); Tab then moves to the buttons
    boxRef.current?.focus();

    // An open Bootstrap popup (the cart drawer) pulls focus back into itself whenever focus moves
    // outside it; keep focus events from reaching it while this box is open.
    const keepFocus = (event) => event.stopPropagation();
    // The page behind must not scroll (the smooth scroller listens to wheel/touch on the window).
    const blockScroll = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    root.addEventListener("focusin", keepFocus);
    root.addEventListener("wheel", blockScroll, { passive: false });
    root.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      root.removeEventListener("focusin", keepFocus);
      root.removeEventListener("wheel", blockScroll);
      root.removeEventListener("touchmove", blockScroll);
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [request]);

  if (!request) return null;

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation(); // close only this box, not the cart drawer under it
      answer(false);
      return;
    }
    if (event.key === "Tab") {
      // keep Tab moving between the two buttons
      const buttons = [...rootRef.current.querySelectorAll("button")];
      const index = buttons.indexOf(document.activeElement);
      const next = event.shiftKey ? index - 1 : index + 1;
      event.preventDefault();
      buttons[(next + buttons.length) % buttons.length]?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className="lulu-confirm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) answer(false); // click outside the box
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={boxRef}
        tabIndex={-1}
        className="lulu-confirm__box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lulu-confirm-title"
        aria-describedby={request.message ? "lulu-confirm-message" : undefined}
      >
        <h5 id="lulu-confirm-title" className="lulu-confirm__title">
          {request.title}
        </h5>
        {request.message && (
          <p id="lulu-confirm-message" className="lulu-confirm__message">
            {request.message}
          </p>
        )}
        <div className="lulu-confirm__actions">
          {/* same look as the cart drawer's "View cart" (white with a border) */}
          <button type="button" className="tf-btn btn-white has-border" onClick={() => answer(false)}>
            <span className="text">{request.cancelLabel}</span>
          </button>
          <button type="button" className="tf-btn btn-fill" onClick={() => answer(true)}>
            <span className="text">{request.confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
