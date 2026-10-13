import Image from "next/image";
import Link from "next/link";

// Reusable two-up banner: image cards side by side (stacked on small screens),
// each with a small label, a large title and an outlined button, centred.
// items: [{ imgSrc, alt, subheading, title, btnText, btnHref }]
// Use "\n" in title to force a line break.
export default function BannerPair({
  items,
  parentClass = "flat-spacing-2 pb_0",
}) {
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="banner-pair">
          {items.map((item, index) => (
            <div
              key={index}
              className="banner-pair-item wow fadeInUp"
              data-wow-delay={`${index * 0.1}s`}
            >
              <Image
                src={item.imgSrc}
                alt={item.alt || "banner"}
                width={1400}
                height={940}
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
