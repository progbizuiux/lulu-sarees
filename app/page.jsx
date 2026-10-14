import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar from "@/components/headers/Topbar";
import PatternShowcase from "@/components/common/PatternShowcase";
import Collections from "@/components/homes/home-1/Collections";
import BannerPair from "@/components/common/BannerPair";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/common/Products3";
import FollowGallery from "@/components/common/FollowGallery";
import VideoBanner from "@/components/common/VideoBanner";
import Testimonials from "@/components/common/Testimonials";

export const metadata = {
  title: "Home || Modave - Multipurpose React Nextjs eCommerce Template",
  description: "Modave - Multipurpose React Nextjs eCommerce Template",
};

export default function HomePage() {
  return (
    <div className="home-fullwidth">
      <Topbar />
      <Header1 />
      <Hero />
      <Collections />
      <BannerPair
        items={[
          {
            imgSrc: "/images/banner/banner-pair-1.jpg",
            objectPosition: "30% center",
            alt: "festive-silk-sarees",
            subheading: "Exclusive",
            title: "Festive Silk\nSaree Collection",
            btnText: "Shop Now",
            btnHref: "/shop-collection",
          },
          {
            imgSrc: "/images/banner/banner-pair-2.jpg",
            objectPosition: "85% center",
            alt: "occasion-sarees",
            subheading: "Exclusive",
            title: "Occasion Wear\nCollection",
            btnText: "Shop Now",
            btnHref: "/shop-collection",
          },
        ]}
      />
      <Products />
      <PatternShowcase
        subheading="Shop by Pattern"
        heading="Pattern that defines every occasion"
        sideImgSrc="/images/patterns/pattern-models.jpg"
        sideImgAlt="women-in-silk-sarees"
        items={[
          { imgSrc: "/images/patterns/pattern-1.jpg", title: "Zari Woven" },
          { imgSrc: "/images/patterns/pattern-2.jpg", title: "Plain Silk" },
          { imgSrc: "/images/patterns/pattern-3.jpg", title: "Ikat" },
          { imgSrc: "/images/patterns/pattern-4.jpg", title: "Block Print" },
          { imgSrc: "/images/patterns/pattern-5.jpg", title: "Zari Stripes" },
        ]}
      />
      <VideoBanner
        posterSrc="/images/banner/video-poster.jpg"
        videoSrc="/images/video/saree-film.mp4"
      />
      <Testimonials />
      <FollowGallery
        handle="@lulusarees.kannur"
        items={[
          { imgSrc: "/images/gallery/follow-1.jpg", alt: "saree-look-1" },
          { imgSrc: "/images/gallery/follow-2.jpg", alt: "saree-look-2" },
          { imgSrc: "/images/gallery/follow-3.jpg", alt: "saree-look-3" },
          { imgSrc: "/images/gallery/follow-4.jpg", alt: "saree-look-4" },
          { imgSrc: "/images/gallery/follow-5.jpg", alt: "saree-look-5" },
          { imgSrc: "/images/gallery/follow-6.jpg", alt: "saree-look-6" },
          { imgSrc: "/images/gallery/follow-7.jpg", alt: "saree-look-7" },
          { imgSrc: "/images/gallery/follow-8.jpg", alt: "saree-look-8" },
        ]}
      />
      <Features />
      <Footer1 />
    </div>
  );
}
