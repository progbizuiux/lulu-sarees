import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import FestiveEdit from "@/components/homes/home-1/FestiveEdit";
import MadeForMoments from "@/components/homes/home-1/MadeForMoments";
import ShopCategories2 from "@/components/products/ShopCategories2";
import { homeCategories } from "@/data/collections";
import ExploreCollections from "@/components/homes/home-1/ExploreCollections";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import OccasionStyle from "@/components/homes/home-1/OccasionStyle";
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
      <LuluHeader />
      <Hero />
      <div className="home-standard-width">
        <ShopCategories2 items={homeCategories} />
      </div>
      <ExploreCollections />
      <OccasionStyle />
      <FestiveEdit />
      <MadeForMoments />
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
