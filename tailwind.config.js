/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './features/**/*.{js,jsx,ts,tsx}', './shared/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5A1F', // laranja — único acento da interface (CTA, ações, "você")
        },
        surface: {
          bg: '#0A0A0C',       // fundo principal
          card: '#141417',     // cartões — profundidade por tom, sem borda
          elevated: '#1E1E23', // modais, sheets, chips
          border: '#26262C',   // hairlines (inputs, divisórias)
        },
        text: {
          primary: '#F7F7F8',
          secondary: '#9C9CA6',
          disabled: '#5B5B66',
        },
        status: {
          success: '#34D399', // "ao vivo" — único verde permitido
          warning: '#FBBF24',
          error: '#F0413E',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
