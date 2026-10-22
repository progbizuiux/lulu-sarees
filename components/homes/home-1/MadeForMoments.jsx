import React from "react";
import Image from "next/image";
import Link from "next/link";

// TODO: replace both images with the artwork from the design
// (left: the bride with "Moments of mangalya" lettering, right: the groom).
export default function MadeForMoments() {
  return (
    <section className="mm" aria-labelledby="mm-title">
      <div className="mm__inner">
        <div className="mm__hero">
          <Image
            className="mm__hero-img"
            src="/images/banner/banner-pair-2.jpg"
            alt="Moments of mangalya"
            width={2000}
            height={1340}
            sizes="(min-width: 992px) 56vw, 100vw"
          />
        </div>

        <div className="mm__content">
          <h2 className="mm__title" id="mm-title">
            Made For Your Moments
          </h2>
          <p className="mm__eyebrow">Every bride, a beautiful story</p>
          <p className="mm__text">
            Every tradition holds a memory, and every bride has a story to
            tell. Discover the beauty of wedding moments, timeless traditions,
            and the sarees that make them unforgettable.
          </p>
          <div className="mm__figure">
            <Image
              className="mm__figure-img"
              src="/images/banner/banner-pair-1.jpg"
              alt="Wedding moments"
              width={2000}
              height={1340}
              sizes="(min-width: 992px) 30vw, 100vw"
            />
          </div>
          <Link href="/shop-collection" className="mm__link">
            Our wedding collections
          </Link>
        </div>
      </div>
    </section>
  );
}
