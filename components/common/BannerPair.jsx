"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// How much taller than its card each photo is, above and below, as a fraction
// of the card height. This is the room the photo has to move while scrolling.
const SLACK = 0.5;

// Reusable two-up banner: image cards side by side (stacked on small screens),
// each with a small label, a large title and an outlined button, centred.
// The photo inside each card moves slower than the page (scroll parallax) while
// the text stays fixed to the card.
// items: [{ imgSrc, alt, subheading, title, btnText, btnHref, objectPosition? }]
// Use "\n" in title to force a line break.
export default function BannerPair({
  items,
  parentClass = "flat-spacing-2 pb_0",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...root.querySelectorAll(".banner-pair-item")]
      .map((card) => ({ card, img: card.querySelector("img"), current: 0, target: 0, ready: false }))
      .filter((it) => it.img);
    let frame = 0;
    let last = 0;

    // where each photo should be for the card's current place on the screen
    const measure = () => {
      const vh = window.innerHeight;
      items.forEach((it) => {
        const rect = it.card.getBoundingClientRect();
        // -1 when the card is far above the screen centre, +1 when far below
        const progress = (rect.top + rect.height / 2 - vh / 2) / ((vh + rect.height) / 2);
        const ratio = Math.max(-1, Math.min(1, progress));
        it.target = -ratio * SLACK * rect.height;
        if (!it.ready) {
          it.current = it.target; // no glide on first paint
          it.ready = true;
        }
      });
    };

    // glide each photo toward its target a little every frame
    const tick = (now) => {
      const dt = Math.min(64, last ? now - last : 16);
      last = now;
      const ease = 1 - Math.exp(-dt / 45);
      let moving = false;
      items.forEach((it) => {
        const diff = it.target - it.current;
        if (Math.abs(diff) > 0.1) {
          it.current += diff * ease;
          moving = true;
        } else {
          it.current = it.target;
        }
        it.img.style.transform = `translate3d(0, ${it.current.toFixed(2)}px, 0)`;
      });
      if (moving) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        last = 0;
      }
    };

    const onScroll = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    measure();
    items.forEach((it) => {
      it.img.style.transform = `translate3d(0, ${it.current.toFixed(2)}px, 0)`;
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="banner-pair" ref={rootRef}>
          {items.map((item, index) => (
            <div
              key={index}
              className="banner-pair-item wow fadeInUp"
              data-wow-delay={`${index * 0.1}s`}
            >
              <Image
                src={item.imgSrc}
                alt={item.alt || "banner"}
                width={2000}
                height={1340}
                style={
                  item.objectPosition
                    ? { objectPosition: item.objectPosition }
                    : undefined
                }
              />
              <div className="banner-pair-content">
                {item.subheading && (
                  <p className="banner-pair-sub">{item.subheading}</p>
                )}
                <h2 className="banner-pair-title">
                  {item.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </h2>
                <Link
                  href={item.btnHref || "/shop-collection"}
                  className="banner-pair-btn"
                >
                  {item.btnText || "Shop Now"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
