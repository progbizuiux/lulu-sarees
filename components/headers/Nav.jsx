"use client";
import React from "react";
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
export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      {" "}
      <li
        className={`menu-item ${
          isActiveGroup(sareesLinks, pathname) ? "active" : ""
        } `}
      >
        <a href="#" className="item-link">
          Sarees
        </a>
        <SareesDropdown />
      </li>
      <li
        className={`menu-item ${
          isActiveGroup(collectionsLinks, pathname) ? "active" : ""
        } `}
      >
        <a href="#" className="item-link">
          Collections
        </a>
        <CollectionsDropdown />
      </li>
      <li
        className={`menu-item position-relative ${
          isActiveGroup(journalLinks, pathname) ? "active" : ""
        } `}
      >
        <a href="#" className="item-link">
          Style Journal
        </a>
        <JournalDropdown />
      </li>
      <li
        className={`menu-item position-relative ${
          isActiveGroup(storeLinks, pathname) ? "active" : ""
        } `}
      >
        <a href="#" className="item-link">
          Our Store
        </a>
        <StoreDropdown />
      </li>
    </>
  );
}
