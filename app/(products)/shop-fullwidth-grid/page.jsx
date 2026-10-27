import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Products10 from "@/components/products/Products10";
import { loadShopList, shopBanner, shopHeading, shopMetadata } from "@/lib/shop/server";
import Link from "next/link";
import React from "react";

const PATH = "/shop-fullwidth-grid";

export async function generateMetadata({ searchParams }) {
  return shopMetadata(await searchParams, { title: "Sarees", path: PATH });
}

export default async function ShopFullwidthGridPage({ searchParams }) {
  const params = await searchParams;
  // Products for this URL, loaded on the server so the HTML already contains them.
  const initialList = await loadShopList(params);
  const heading = shopHeading(params, "Sarees");
  const banner = shopBanner(params, { path: PATH, fallback: "sarees" });

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
      <Products10 initialList={initialList} />
      <Footer1 />
    </>
  );
}
