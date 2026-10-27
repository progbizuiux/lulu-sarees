import { useEffect, useRef } from "react";

/**
 * Picks how many product columns fit the screen: at most 2 on phones, 3 on tablets, and the page's
 * own default on wider screens. It follows the window in both directions when it's resized.
 *
 * The template also showed icons here to switch between list / 2 / 3 / 4 / 5 columns.
 * Those were removed (not needed for now), so the column count is automatic. Renders nothing.
 */
export default function LayoutHandler({ activeLayout, setActiveLayout }) {
  // The page's own column count (e.g. 4), used on wide screens.
  const desktopColumns = useRef(activeLayout);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setActiveLayout(Math.min(desktopColumns.current, 2));
      else if (width < 1200) setActiveLayout(Math.min(desktopColumns.current, 3));
      else setActiveLayout(desktopColumns.current);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setActiveLayout]);

  return null;
}
