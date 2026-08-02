import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: "#00ff66",
        gold: "#d4af37",
        background: "#080808",
        surface: "#111111",
        "surface-border": "rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
