import Image from "next/image";
import Link from "next/link";

// Reusable blog row: a header (title + view-all link) over a row of cards
// (wide image, small label, title). posts: [{ id, imgSrc, alt, date, title }]
export default function BlogStrip({
  title = "Latest Blogs",
  viewAllHref = "/blog-default",
  viewAllLabel = "View All",
  posts,
  limit = 3,
  parentClass = "flat-spacing pt-0",
}) {
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="blog-strip-head wow fadeInUp">
          <h3 className="blog-strip-title">{title}</h3>
          {viewAllHref && (
            <Link href={viewAllHref} className="blog-strip-viewall">
              {viewAllLabel}
              <i className="icon icon-arrRight" />
            </Link>
          )}
        </div>
        <div className="blog-strip-grid">
          {posts.slice(0, limit).map((post, index) => (
            <Link
              key={post.id ?? index}
              href={`/blog-detail/${post.id}`}
              className="blog-strip-card wow fadeInUp"
              data-wow-delay={`${index * 0.1}s`}
            >
              <div className="blog-strip-img">
                <Image
                  src={post.imgSrc}
                  alt={post.alt || post.title}
                  width={615}
                  height={461}
                />
              </div>
              <p className="blog-strip-tag">{post.date}</p>
              <h6 className="blog-strip-name">{post.title}</h6>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
