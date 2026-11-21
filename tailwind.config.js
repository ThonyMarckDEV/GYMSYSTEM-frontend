/** @type {import('tailwindcss').Config} */
module.exports = {
  // Modo oscuro con la clase `dark` en <html> (ver src/utilities/Tema y src/styles/oscuro.css)
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFC700', // Amarillo pato
          hover: '#E6B300',   // Amarillo pato oscuro (Hover)
          light: '#FFF3C4',   // Amarillo pálido (Fondos suaves)
        },
        secondary: {
          DEFAULT: '#0A0A0A', // Negro profundo
          text: '#18181b',    // Zinc-900 (Texto legible)
          muted: '#71717a',   // Zinc-500 (Textos secundarios)
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        // Sombras sobrias (se usan en modales, avisos y paneles de todo el sistema)
        elegant: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -6px rgba(15,23,42,0.12)',
        'elegant-gold': '0 0 0 1px rgba(15,23,42,0.06), 0 24px 48px -12px rgba(15,23,42,0.25)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
      }
    }
  },
  plugins: [],
}