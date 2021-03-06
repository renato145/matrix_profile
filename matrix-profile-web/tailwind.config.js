module.exports = {
  // mode: 'jit',
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      backgroundColor: ["active", "disabled"],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
