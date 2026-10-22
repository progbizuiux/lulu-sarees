import localFont from "next/font/local";

// Heading font: Canela Light.
// NOTE: this is the TRIAL file, for development only. Before going live, buy the
// licensed Canela from commercialtype.com and replace the file below (same folder).
// If the licensed file has a different name or extension, only `src` needs updating.
// The weight range tells the browser this one file serves every weight, so headings
// never get a synthetic faux-bold.
export const canela = localFont({
  src: "./Canela-Light-Trial.otf",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-heading",
  fallback: ["Georgia", "serif"],
});

// Body font: Satoshi (variable, Fontshare Free Font License, commercial use allowed).
export const satoshi = localFont({
  src: "./Satoshi-Variable.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  variable: "--font-body",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
