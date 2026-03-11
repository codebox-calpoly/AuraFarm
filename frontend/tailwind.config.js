/** @type {import('tailwindcss').Config} */
module.exports = {
  // TODO: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "aura-red": "#CC0A19",
        "aura-orange": "#F38E08",
        "aura-yellow": "#FFD609",
        "aura-green": "#4FB948",
        "aura-blue": "#2B09FF",
        "aura-purple": "#B709FF",
        "aura-black": "#383737",
        "aura-white": "#FFFFFF",
        // Standard grays for UI
        "aura-gray-50": "#F9FAFB",
        "aura-gray-100": "#F3F4F6",
        "aura-gray-200": "#E5E7EB",
        "aura-gray-300": "#D1D5DB",
        "aura-gray-400": "#9CA3AF",
        "aura-gray-500": "#6B7280",
        "aura-gray-600": "#4B5563",
        "aura-gray-700": "#374151",
        // Light tints for backgrounds
        "aura-red-light": "#FFF5F5",
        "aura-red-tint": "#FFF1F1",
        "aura-green-light": "#F0FFF4",
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
