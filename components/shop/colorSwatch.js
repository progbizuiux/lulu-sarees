import { colors } from "@/data/productFilterOptions";

const SWATCH_CLASSES = Object.fromEntries(colors.map((color) => [color.name.toLowerCase(), color.className]));

/**
 * How to draw a colour dot: the template's class for known colour names, otherwise the
 * backend's hex code (or the colour name itself, which CSS understands for basic colours).
 */
export function colorSwatch({ name, hex }) {
  const className = SWATCH_CLASSES[String(name).toLowerCase()];
  if (className) return { className, style: undefined };
  return { className: "line-black", style: { backgroundColor: hex || String(name).toLowerCase() } };
}
