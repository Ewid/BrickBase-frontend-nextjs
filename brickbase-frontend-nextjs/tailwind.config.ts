import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--text-muted)",
        border: "var(--border-color)",
        input: "var(--input-bg)",
        primary: "var(--button-primary)",
        secondary: "var(--button-secondary)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "var(--font-noto-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
