import type { Config } from "tailwindcss";

export default {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      keyframes: {
        cursor: {
          "0%, 100%": { opacity: "1", height: "1em", transform: "translateY(0)" },
          "50%": { opacity: "0", height: "1em", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        cursor: "cursor 1s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    },
  },
} satisfies Config;
