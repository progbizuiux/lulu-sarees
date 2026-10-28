"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProducts";
import { getLenis } from "@/utlis/lenis";
import Description from "./Description";
import Reviews from "./Reviews";

import Shipping from "./Shipping";
import ReturnPolicies from "./ReturnPolicies";

export default function Descriptions1({ product: productProp }) {
  const [activeTab, setActiveTab] = useState(1);
  // The page should pass the product; until it does, load it by the id in the address.
  const params = useParams();
  const { data: loadedProduct } = useProduct(params?.id, {
    enabled: !productProp && Boolean(params?.id),
  });
  const product = productProp ?? loadedProduct;

  // "Delivery & Return" next to the product opens the Shipping & Returns tab and scrolls to it.
  useEffect(() => {
    const showShipping = () => {
      setActiveTab(3);
      const tabs = document.getElementById("product-tabs");
      const lenis = getLenis(); // the site's smooth scroller, when it is on
      if (lenis) lenis.scrollTo(tabs, { offset: -20 });
      else tabs?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("show-shipping-tab", showShipping);
    return () => window.removeEventListener("show-shipping-tab", showShipping);
  }, []);

  return (
    <section className="" id="product-tabs">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-1">
              <ul className="widget-menu-tab">
                <li
                  className={`item-title ${activeTab == 1 ? "active" : ""} `}
                  onClick={() => setActiveTab(1)}
                >
                  <span className="inner">Description</span>
                </li>
                <li
                  className={`item-title ${activeTab == 2 ? "active" : ""} `}
                  onClick={() => setActiveTab(2)}
                >
                  <span className="inner">Customer Reviews</span>
                </li>
                <li
                  className={`item-title ${activeTab == 3 ? "active" : ""} `}
                  onClick={() => setActiveTab(3)}
                >
                  <span className="inner">Shipping &amp; Returns</span>
                </li>
                <li
                  className={`item-title ${activeTab == 4 ? "active" : ""} `}
                  onClick={() => setActiveTab(4)}
                >
                  <span className="inner">Return Policies</span>
                </li>
              </ul>
              <div className="widget-content-tab">
                <div
                  className={`widget-content-inner ${
                    activeTab == 1 ? "active" : ""
                  } `}
                >
                  <div className="tab-description">
                    <Description product={product} />
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    activeTab == 2 ? "active" : ""
                  } `}
                >
                  <div className="tab-reviews write-cancel-review-wrap">
                    <Reviews />
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    activeTab == 3 ? "active" : ""
                  } `}
                >
                  <div className="tab-shipping">
                    <Shipping />
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    activeTab == 4 ? "active" : ""
                  } `}
                >
                  <div className="tab-policies">
                    <ReturnPolicies />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
