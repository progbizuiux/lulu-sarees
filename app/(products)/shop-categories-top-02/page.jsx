import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Products1 from "@/components/products/Products1";

import ShopCategories2 from "@/components/products/ShopCategories2";
import { homeCategories } from "@/data/collections";
import { loadShopList, shopBanner, shopHeading, shopMetadata } from "@/lib/shop/server";
import Link from "next/link";
import React from "react";

const PATH = "/shop-categories-top-02";

export async function generateMetadata({ searchParams }) {
  return shopMetadata(await searchParams, { title: "Women", path: PATH });
}

export default async function ShopCategoriesTopPag2({ searchParams }) {
  const params = await searchParams;
  // Products for this URL, loaded on the server so the HTML already contains them.
  const initialList = await loadShopList(params);
  const heading = shopHeading(params, "Women");
  const banner = shopBanner(params, { path: PATH, fallback: "women" });

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <div
        className="page-title"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">{heading}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{heading}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* The same category cards as the home page (without items it showed the template's demo
          categories). The wrapper gives them the home page's card shape. */}
      <div className="home-categories">
        <ShopCategories2 items={homeCategories} />
      </div>
      <Products1 parentClass="flat-spacing pt-0" initialList={initialList} />
      <Footer1 />
    </>
  );
}
