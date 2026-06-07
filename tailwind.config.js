/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './features/**/*.{js,jsx,ts,tsx}', './shared/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F97316',   // orange — ação principal
          secondary: '#22D3EE', // cyan — destaque secundário
        },
        surface: {
          bg: '#09090B',        // fundo principal
          card: '#18181B',      // cartões
          elevated: '#27272A',  // modais, sheets
          border: '#3F3F46',    // divisórias
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          disabled: '#52525B',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
