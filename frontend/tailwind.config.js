/** @type {import('tailwindcss').Config} */
module.exports = {
  // TODO: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "aura-red": "#C41E3A",
        "aura-orange": "#E67E22",
        "aura-yellow": "#F4C430",
        "aura-green": "#2D8A5E",
        "aura-blue": "#2563EB",
        "aura-purple": "#7C3AED",
        "aura-black": "#1C1917",
        "aura-white": "#FFFFFF",
        /** App canvas behind cards */
        "aura-page": "#F4F6F5",
        /** Elevated surfaces */
        "aura-surface": "#FFFFFF",
        "aura-surface-muted": "#FAFBFA",
        /** Hairline borders */
        "aura-border": "#E7E5E4",
        "aura-border-strong": "#D6D3D1",
        // Standard grays for UI
        "aura-gray-50": "#FAFAF9",
        "aura-gray-100": "#F5F5F4",
        "aura-gray-200": "#E7E5E4",
        "aura-gray-300": "#D6D3D1",
        "aura-gray-400": "#A8A29E",
        "aura-gray-500": "#78716C",
        "aura-gray-600": "#57534E",
        "aura-gray-700": "#44403C",
        // Light tints for backgrounds
        "aura-red-light": "#FFF5F5",
        "aura-red-tint": "#FFE4E6",
        "aura-green-light": "#ECFDF5",
        "aura-green-tint": "#A7F3D0",
      },
      fontFamily: {
        "regular": "Poppins_400Regular",
        "semibold": "Poppins_600SemiBold",
        "bold": "Poppins_700Bold",
      },
    },
  },
  plugins: [],
};
