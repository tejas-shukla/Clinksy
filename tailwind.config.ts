import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Doorstep brand palette — modern editorial monochrome (B&O-inspired)
        // with a single warm accent reserved for key emphasis moments.
        ink: {
          DEFAULT: "#0A0A0A", // near-black for primary text & UI
          50: "#F4F4F2",
          100: "#E6E6E3",
          200: "#C8C8C3",
          300: "#9B9B95",
          400: "#6E6E68",
          500: "#3D3D39",
          600: "#1F1F1D",
          700: "#141413",
          800: "#0A0A0A",
          900: "#000000",
        },
        bone: {
          DEFAULT: "#FAFAF7", // warm off-white background
          50: "#FFFFFF",
          100: "#FAFAF7",
          200: "#F2F2EE",
          300: "#E6E6E1",
        },
        // Used SPARINGLY for emphasis only:
        // headline highlight, the key on the door, eyebrows.
        accent: {
          DEFAULT: "#C5644A", // warm terracotta
          50: "#FAEDE7",
          100: "#F4D7CB",
          400: "#C5644A",
          500: "#A24D34",
        },
      },
      fontFamily: {
        // Wired up via next/font in layout.tsx
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      letterSpacing: {
        tightish: "-0.012em",
        tight2: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
