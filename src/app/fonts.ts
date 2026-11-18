import { Exo_2, Mulish } from "next/font/google";

// Both carry Mongolian Ө ө Ү ү (checked against the Google Fonts cmap).
/** Techy, rounded-square headlines that echo phone shapes. */
export const display = Exo_2({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["600", "700", "800", "900"], variable: "--nf-display", display: "swap" });
export const sans = Mulish({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--nf-sans", display: "swap" });
