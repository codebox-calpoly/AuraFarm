/**
 * Helper to access Tailwind config colors in TypeScript/React Native components
 * This bridges the gap between CommonJS tailwind.config.js and ES6 modules
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require('../tailwind.config.js');

export const tailwindColors = tailwindConfig.theme.extend.colors;
