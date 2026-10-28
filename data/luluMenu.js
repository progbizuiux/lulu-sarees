// Navbar menu for the Lulu header (components/headers/LuluNav.jsx).
//
// Every category link opens a shop listing page with `?category=<slug>` added. The listing pages
// do not filter by category yet (products have no categories), so for now each link shows the
// same products; the slug is already in the address for when filtering is built.
// `hideDropdown: true` on an item keeps its content here but shows the item as a plain link.
// To change a link: edit its label here (the slug is made from it) or give it an explicit `href`.

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// helpers: a category link on a given listing page, and a direct page link
const cat = (listing) => (label) => ({
  label,
  href: `${listing}?category=${slug(label)}`,
});
const page = (label, href) => ({ label, href });

const grid = cat("/shop-default-grid");
const fullWidth = cat("/shop-fullwidth-grid");
const collection = cat("/shop-collection");
const women = cat("/shop-categories-top-02");

export const luluMenu = [
  {
    label: "Sarees",
    href: "/shop-fullwidth-grid",
    columns: [
      {
        heading: "By Fabric",
        links: [
          "Silk Sarees",
          "Kasavu / Kerala Sarees",
          "Cotton Sarees",
          "Tissue Sarees",
          "Banarasi Sarees",
          "Kanchipuram Silk",
        ].map(fullWidth),
      },
    ],
  },
  {
    label: "Collections",
    href: "/shop-collection",
    // Dropdown switched off for now (COLLECTIONS stays a plain link). Remove this line to show it again.
    hideDropdown: true,
    columns: [
      {
        links: [
          "This Week",
          "New Sarees",
          "New Kurtis & Sets",
          "New Menswear",
          "New Kidswear",
        ].map(collection),
      },
    ],
  },
  {
    label: "Wedding",
    href: "/shop-default-grid",
    // Dropdown switched off for now (WEDDING stays a plain link). Remove this line to show it again.
    hideDropdown: true,
    columns: [
      {
        heading: "Bridal",
        links: [
          "Bridal Sarees",
          "Bridal Lehengas",
          "Groom Wear",
          "Wedding Guest Wear",
          "Kids' Wedding Wear",
        ].map(grid),
      },
      {
        heading: "Wedding Stories",
        links: [
          page("Wedding Stories", "/blog-default"),
          page("Bridal Style Journal", "/blog-list"),
          page("Real Brides", "/blog-grid"),
          page("A Kerala Wedding", "/blog-detail/1"),
          page("Choosing Your Bridal Saree", "/blog-detail-02/2"),
        ],
      },
    ],
  },
  {
    label: "Festive",
    href: "/shop-default-grid",
    columns: [
      {
        links: [
          "Onam Collection",
          "Vishu",
          "Eid Collection",
          "Diwali",
          "Christmas",
          "Festive Kurta Sets",
        ].map(grid),
      },
    ],
  },
  {
    label: "Ready to Wear",
    href: "/shop-default-grid",
    columns: [
      {
        links: [
          "Kurtis & Kurta Sets",
          "Lehengas",
          "Co-ord Sets",
          "Pre-stitched Sarees",
          "Salwar Sets",
          "Western Wear",
        ].map(grid),
      },
    ],
  },
  {
    label: "Men",
    href: "/shop-default-grid",
    columns: [
      {
        links: [
          "Mundus & Dhotis",
          "Kurtas",
          "Shirts",
          "Sherwanis",
          "Ethnic Sets",
          "Western Wear",
        ].map((label) => ({
          label,
          href: `/shop-default-grid?category=men-${slug(label)}`,
        })),
      },
    ],
  },
  {
    label: "Women",
    href: "/shop-categories-top-02",
    columns: [
      {
        links: [
          "Sarees",
          "Kurtis",
          "Lehengas",
          "Western Wear",
          "Nightwear",
          "Cosmetics",
        ].map((label) => ({
          label,
          href: `/shop-categories-top-02?category=women-${slug(label)}`,
        })),
      },
    ],
  },
  {
    label: "Kids",
    href: "/shop-default-grid",
    columns: [
      {
        links: [
          "Girls' Wear",
          "Boys' Wear",
          "Festive Wear",
          "Ethnic Sets",
          "Western Wear",
        ].map((label) => ({
          label,
          href: `/shop-default-grid?category=kids-${slug(label)}`,
        })),
      },
    ],
  },
];

// Pages listed under the account icon (they used to be in the "My Pages" menu).
export const accountLinks = [
  page("My Account", "/my-account"),
  page("Order Tracking", "/order-tracking"),
  page("Wish List", "/wish-list"),
  page("Shopping Cart", "/shopping-cart"),
  page("Search Results", "/search-result"),
  page("Forgot Password", "/forget-password"),
];
