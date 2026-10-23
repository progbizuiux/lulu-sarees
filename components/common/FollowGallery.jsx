import Image from "next/image";

// Reusable "Follow us" gallery: a heading with the social handle above a row
// of tall photo tiles, alternate tiles offset downward. items: [{ imgSrc, alt, href? }]
export default function FollowGallery({
  subheading = "Follow Us",
  handle,
  handleHref = "https://www.instagram.com/",
  items,
  parentClass = "flat-spacing",
}) {
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="follow-head text-center wow fadeInUp">
          <p className="follow-sub">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <defs>
                <linearGradient id="follow-ig" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#feda75" />
                  <stop offset="0.35" stopColor="#fa7e1e" />
                  <stop offset="0.6" stopColor="#d62976" />
                  <stop offset="1" stopColor="#4f5bd5" />
                </linearGradient>
              </defs>
              <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#follow-ig)" />
              <circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" strokeWidth="1.8" />
              <circle cx="17.6" cy="6.4" r="1.2" fill="#fff" />
            </svg>
            {subheading}
          </p>
          <a
            href={handleHref}
            target="_blank"
            rel="noopener noreferrer"
            className="follow-handle"
          >
            {handle}
          </a>
        </div>
        <div className="follow-grid">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href || handleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="follow-item wow fadeInUp"
              aria-label={`Open ${handle} on Instagram`}
            >
              <Image
                src={item.imgSrc}
                alt={item.alt || "gallery-image"}
                width={520}
                height={1368}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
