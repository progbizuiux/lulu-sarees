import React from "react";
import Image from "next/image";
import Link from "next/link";
import { luluMenu } from "@/data/luluMenu";

// "Our wedding collections" opens the header menu's Wedding listing (it used to open the template's
// /shop-collection page, whose categories go nowhere).
const weddingHref =
  luluMenu.find((item) => item.label === "Wedding")?.href ?? "/shop-default-grid";

// Left: the bride with the "Moments of mangalya" lettering (part of the image). Right: the groom.
export default function MadeForMoments() {
  return (
    <section className="mm" aria-labelledby="mm-title">
      <div className="mm__inner">
        <div className="mm__hero">
          <Image
            className="mm__hero-img"
            src="/images/home/moments-bride.png"
            alt="Moments of mangalya"
            width={1378}
            height={1239}
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
              src="/images/home/moments-groom.png"
              alt="Wedding moments"
              width={1352}
              height={1374}
              sizes="(min-width: 992px) 30vw, 100vw"
            />
          </div>
          <Link href={weddingHref} className="mm__link">
            Our wedding collections
          </Link>
        </div>
      </div>
    </section>
  );
}
