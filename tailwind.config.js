/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Source of truth lives in lib/theme.ts — these mirror it for utility classes.
        background: "#FFFFFF",
        backgroundSecondary: "#F2F2F7",
        paper: "#FFFFFF",
        card: "#FFFFFF",
        separator: "rgba(60, 60, 67, 0.18)",
        label: "#000000",
        labelSecondary: "rgba(60, 60, 67, 0.60)",
        labelTertiary: "rgba(60, 60, 67, 0.30)",
        heading: "#1F3A68",
        primary: "#FFCC00",
        primaryText: "#000000",
        success: "#34C759",
        error: "#FF3B30",
        flame: "#FF9500",
        highlight: "#AF52DE",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: {
        input: "12px",
        button: "14px",
        card: "16px",
        sheet: "20px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
      },
    },
  },
  plugins: [],
};
