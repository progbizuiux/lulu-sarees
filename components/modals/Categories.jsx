import React from "react";
import Link from "next/link";
import { luluMenu } from "@/data/luluMenu";

// "Categories" panel of the mobile bottom toolbar. Same categories and links as the header menu
// (data/luluMenu.js). It used to list the template's demo categories, all linking to "#".
export default function Categories() {
  return (
    <div
      className="offcanvas offcanvas-start canvas-filter canvas-categories"
      id="shopCategories"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <span className="icon-left icon-filter" />
          <h5>Categories</h5>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body">
          {luluMenu.map((item, i) => {
            // dropdown switched off for this item in the menu: show it as a plain link
            if (item.hideDropdown) {
              return (
                <div className="wd-facet-categories" key={item.label}>
                  <Link href={item.href} className="facet-title">
                    <span className="title">{item.label}</span>
                  </Link>
                </div>
              );
            }
            const listId = `shopCategories-${i}`;
            const links = item.columns.flatMap((col) => col.links);
            return (
              <div className="wd-facet-categories" key={item.label}>
                <div
                  role="button"
                  className="facet-title collapsed"
                  data-bs-target={`#${listId}`}
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls={listId}
                >
                  <span className="title">{item.label}</span>
                  <span className="icon icon-arrow-down" />
                </div>
                <div id={listId} className="collapse">
                  <ul className="facet-body">
                    {/* the item itself, as the first link of its list (same as the mobile menu) */}
                    <li>
                      <Link href={item.href} className="item link">
                        <span className="title-sub text-caption-1 text-secondary">
                          All {item.label}
                        </span>
                      </Link>
                    </li>
                    {links.map((link) => (
                      <li key={link.label + link.href}>
                        <Link href={link.href} className="item link">
                          <span className="title-sub text-caption-1 text-secondary">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
