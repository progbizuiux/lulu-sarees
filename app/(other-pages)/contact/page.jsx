import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Contact2 from "@/components/otherPages/Contact2";
import React from "react";

export const metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <iframe
        src="https://www.google.com/maps?q=Lulu+Sarees,+Thavakkara+Rd,+Thavakkara,+Kannur,+Kerala+670002&z=19&output=embed"
        width={600}
        height={450}
        style={{ border: 0, width: "100%" }}
        allowFullScreen=""
        loading="lazy"
      />
      <Contact2 />
      <Footer1 />
    </>
  );
}
