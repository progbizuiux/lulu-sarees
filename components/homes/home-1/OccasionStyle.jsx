import React from "react";
import Image from "next/image";
import Link from "next/link";

// The card artwork already contains its title, tagline and "View products" button.
// (The file names have a space, so it is written as %20 in the URL.)
const occasions = [
  {
    label: "Ethnic Wear",
    imgSrc: "/images/home/occassion-img%204.png",
    href: "/shop-default-grid",
  },
  {
    label: "Everyday Style",
    imgSrc: "/images/home/occassion-img%203.png",
    href: "/shop-default-grid",
  },
  {
    label: "Festive Wear",
    imgSrc: "/images/home/occassion-img%202.png",
    href: "/shop-default-grid",
  },
  {
    label: "Western Wear",
    imgSrc: "/images/home/occassion-img%201.png",
    href: "/shop-default-grid",
  },
];

export default function OccasionStyle() {
  return (
    <section className="occasion" aria-labelledby="occasion-title">
      <div className="occasion__head">
        <h2 className="occasion__title" id="occasion-title">
          Find Your Occasion Style
        </h2>
        <p className="occasion__subtitle">
          Explore curated looks for every moment, from festive celebrations to
          effortless everyday elegance.
        </p>
      </div>

      <div className="occasion__grid">
        {occasions.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="occ"
            aria-label={`${item.label} – view products`}
          >
            <Image
              className="occ__img"
              src={item.imgSrc}
              alt={item.label}
              width={1720}
              height={2380}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
