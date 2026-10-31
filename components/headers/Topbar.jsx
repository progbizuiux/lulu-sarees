import React from "react";
import Link from "next/link";
export default function Topbar() {
  return (
    <div className="tf-topbar bg-main">
      <div className="container">
        <div className="tf-topbar_wrap d-flex align-items-center justify-content-center justify-content-xl-between">
          <ul className="topbar-left">
            <li>
              <a className="text-caption-1 text-white" href="tel:315-666-6688">
                315-666-6688
              </a>
            </li>
            <li>
              <a className="text-caption-1 text-white" href="#">
                kannurlulusarees@gmail.com
              </a>
            </li>
            <li>
              <Link
                className="text-caption-1 text-white text-decoration-underline"
                href={`/store-list`}
              >
                Our Store
              </Link>
            </li>
          </ul>
          <div className="topbar-right d-none d-xl-block">
          </div>
        </div>
      </div>
    </div>
  );
}
