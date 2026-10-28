"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { reelProducts } from "@/data/products";
import { useContextElement } from "@/context/Context";
import CartControl from "@/components/common/CartControl";
// ₹2,200 like the rest of the site (this section used to show "Rs. 2,200.00")
import { formatPrice } from "@/lib/format";

// One video per product, in the same order as reelProducts.
const videos = [
  "/images/home/video1.mp4",
  "/images/home/video2.mp4",
  "/images/home/video3.mp4",
  "/images/home/video4.mp4",
];

function VideoCard({ product, src }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const pausedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false); // first frame decoded
  const { addProductToCart } = useContextElement();

  // Play (muted, looping) while the card is on screen, pause when it leaves.
  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;
    video.muted = true;
    if (video.readyState >= 2) setReady(true);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByUser.current && !reduceMotion) {
            video.play().catch(() => {});
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausedByUser.current = false;
      video.play().catch(() => {});
    } else {
      pausedByUser.current = true;
      video.pause();
    }
  };

  return (
    <article className={`sv-card ${ready ? "is-ready" : ""}`} ref={cardRef}>
      <video
        ref={videoRef}
        className="sv-card__video"
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`sv-card__toggle ${playing ? "is-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? `Pause video: ${product.title}` : `Play video: ${product.title}`}
      >
        <span className="sv-card__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        </span>
      </button>

      <div className="sv-card__bar">
        <Link
          href={`/product-detail/${product.id}`}
          className="sv-card__thumb"
          aria-label={product.title}
        >
          <Image src={product.imgSrc} alt="" width={128} height={128} />
        </Link>
        <div className="sv-card__info">
          <Link href={`/product-detail/${product.id}`} className="sv-card__name">
            {product.title}
          </Link>
          <p className="sv-card__price">{formatPrice(product.price)}</p>
        </div>
        <CartControl productId={product.id}>
          <button
            type="button"
            className="sv-card__add"
            onClick={() => addProductToCart(product.id)}
            aria-label={`Add ${product.title} to cart`}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </CartControl>
      </div>
    </article>
  );
}

export default function ShopByVideo() {
  return (
    <section className="sv" aria-labelledby="sv-title">
      <div className="sv__head">
        <h2 className="sv__title" id="sv-title">
          See It. Love It. Shop It.
        </h2>
        <p className="sv__subtitle">
          Explore our favourite looks in motion and find the pieces that make
          them yours.
        </p>
      </div>
      <div className="sv__grid">
        {reelProducts.map((product, i) => (
          <VideoCard key={product.id} product={product} src={videos[i]} />
        ))}
      </div>
    </section>
  );
}
