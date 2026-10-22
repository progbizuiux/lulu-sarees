"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CollectionsDropdown,
  JournalDropdown,
  SareesDropdown,
  StoreDropdown,
  collectionsLinks,
  isActiveGroup,
  journalLinks,
  sareesLinks,
  storeLinks,
} from "./NavDropdowns";

// The existing hover dropdowns (same menus as the old header).
const dropdowns = {
  sarees: { Dropdown: SareesDropdown, links: sareesLinks },
  collections: { Dropdown: CollectionsDropdown, links: collectionsLinks },
  journal: { Dropdown: JournalDropdown, links: journalLinks, small: true },
  store: { Dropdown: StoreDropdown, links: storeLinks, small: true },
};

// TODO: point each link at its own collection page once those pages exist.
// `dropdown` picks which of the dropdowns above opens on hover (null = plain link).
const navLinks = [
  { label: "Sarees", href: "/shop-default-grid", dropdown: "sarees" },
  { label: "New Arrivals", href: "/shop-default-grid", dropdown: "collections" },
  { label: "Wedding", href: "/shop-default-grid", dropdown: "journal" },
  { label: "Festive", href: "/shop-default-grid", dropdown: "store" },
  { label: "Ready to Wear", href: "/shop-default-grid", dropdown: null },
  { label: "Men", href: "/shop-default-grid", dropdown: null },
  { label: "Women", href: "/shop-default-grid", dropdown: null },
  { label: "Kids", href: "/shop-default-grid", dropdown: null },
];

export default function LuluNav() {
  const pathname = usePathname();
  return (
    <ul className="box-nav-ul">
      {navLinks.map((link) => {
        const menu = link.dropdown ? dropdowns[link.dropdown] : null;
        const active = menu && isActiveGroup(menu.links, pathname);
        return (
          <li
            key={link.label}
            className={`menu-item ${menu?.small ? "position-relative" : ""} ${
              active ? "active" : ""
            }`}
          >
            <Link href={link.href}>{link.label}</Link>
            {menu && <menu.Dropdown />}
          </li>
        );
      })}
    </ul>
  );
}
