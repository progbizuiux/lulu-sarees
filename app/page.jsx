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
import ShopByVideo from "@/components/homes/home-1/ShopByVideo";
import CustomerStories from "@/components/homes/home-1/CustomerStories";
import MostSelling from "@/components/homes/home-1/MostSelling";

export default function HomePage() {
  return (
    <div className="home-fullwidth">
      <LuluHeader />
      <Hero />
      <div className="home-categories">
        <ShopCategories2
          items={homeCategories}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 15 },
            568: { slidesPerView: 3, spaceBetween: 20 },
            968: { slidesPerView: 4, spaceBetween: 20 },
            1224: { slidesPerView: 5, spaceBetween: 20 },
            1400: { slidesPerView: 6, spaceBetween: 20 },
          }}
        />
      </div>
      <ExploreCollections />
      <OccasionStyle />
      <FestiveEdit />
      <MadeForMoments />
      <ShopByVideo />
      <CustomerStories />
      <MostSelling />
      <FollowGallery
        handle="@lulu_sarees"
        items={[
          { imgSrc: "/images/home/insta.png", alt: "Couple in gold and ivory festive wear" },
          { imgSrc: "/images/home/insta2.png", alt: "Friends in festive menswear" },
          { imgSrc: "/images/home/insta3.png", alt: "Group celebrating in festive wear" },
          { imgSrc: "/images/home/insta4.png", alt: "Couple in cream and lilac" },
          { imgSrc: "/images/home/insta5.png", alt: "Two women with a dish of flower petals" },
          { imgSrc: "/images/home/insta6.png", alt: "Two women in pastel lehengas" },
        ]}
      />
      <Features />
      <Footer1 dark />
    </div>
  );
}
