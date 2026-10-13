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
          <p className="follow-sub">{subheading}</p>
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
