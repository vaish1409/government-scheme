/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF8F2',
        ink: '#1E2A28',
        teal: {
          DEFAULT: '#0F6B5C',
          dark: '#0B5245',
          light: '#E4F1EE',
        },
        marigold: {
          DEFAULT: '#F0A93A',
          dark: '#D6912A',
          light: '#FDF1DD',
        },
        coral: {
          DEFAULT: '#E8604C',
          light: '#FBE7E3',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 107, 92, 0.10)',
        card: '0 2px 12px rgba(30, 42, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
