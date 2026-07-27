/**
 * Native mirror of the web theme tokens in `app/globals.css`.
 *
 * React Native has no CSS variables, so the palette is duplicated here rather than
 * imported. Keep the two in sync by hand — same warm editorial light ground and deep
 * espresso dark ground, same semantic names, so a value can be traced across platforms.
 */
export interface Palette {
  background: string;
  surface: string;
  card: string;
  border: string;
  foreground: string;
  muted: string;
  accent: string;
}

const light: Palette = {
  background: "#F6F3EE",
  surface: "#EFEAE2",
  card: "#FFFFFF",
  border: "#DED6CA",
  foreground: "#26211C",
  muted: "#6F675E",
  accent: "#8C6E4A",
};

const dark: Palette = {
  background: "#1A1613",
  surface: "#211C18",
  card: "#262019",
  border: "#3A322A",
  foreground: "#F2ECE4",
  muted: "#A99C8D",
  accent: "#C79E6B",
};

export const palette = (scheme: "light" | "dark" | null | undefined): Palette =>
  scheme === "dark" ? dark : light;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16 } as const;
