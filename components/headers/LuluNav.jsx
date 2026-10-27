"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { luluMenu } from "@/data/luluMenu";

// The page part of a link (without ?category=...)
const pathOf = (href) => href.split("?")[0];

// Items with two or more columns open as a full-width mega menu; single-column ones as a small list.
function Dropdown({ item }) {
  const mega = item.columns.length > 1;
  const renderLinks = (links) =>
    // No "active" highlight on these links: many of them open the same page with a different
    // ?category=, so the whole list used to stay highlighted after visiting any one of them.
    links.map((link) => (
      <li key={link.label + link.href} className="menu-item-li">
        <Link href={link.href} className="menu-link-text">
          {link.label}
        </Link>
      </li>
    ));

  if (!mega) {
    return (
      <div className="sub-menu submenu-default">
        <ul className="menu-list">{renderLinks(item.columns[0].links)}</ul>
      </div>
    );
  }
  return (
    <div className="sub-menu mega-menu">
      <div className="container">
        <div className="row">
          {item.columns.map((col) => (
            <div className="col-lg-3" key={col.heading}>
              <div className="mega-menu-item">
                <div className="menu-heading">{col.heading}</div>
                <ul className="menu-list">{renderLinks(col.links)}</ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LuluNav() {
  const pathname = usePathname();
  return (
    <ul className="box-nav-ul">
      {luluMenu.map((item) => {
        const hasDropdown = !item.hideDropdown;
        const active = hasDropdown && item.columns.some((col) =>
          col.links.some((link) => pathOf(link.href) === pathname)
        );
        const mega = item.columns.length > 1;
        return (
          <li
            key={item.label}
            className={`menu-item ${mega || !hasDropdown ? "" : "position-relative"} ${
              active ? "active" : ""
            }`}
          >
            <Link href={item.href}>{item.label}</Link>
            {hasDropdown && <Dropdown item={item} />}
          </li>
        );
      })}
    </ul>
  );
}
