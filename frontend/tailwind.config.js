/** @type {import('tailwindcss').Config} */
module.exports = {
    // TODO: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
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
            },
            fontFamily: {
                sans: ['Poppins_400Regular', 'system-ui', 'sans-serif'],
                semibold: ['Poppins_600SemiBold', 'system-ui', 'sans-serif'],
                bold: ['Poppins_700Bold', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
