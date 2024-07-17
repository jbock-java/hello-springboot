/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
		extend: {
      colors: {
        "kirsch": "#dfbd6d",
        "esch": "#ecddbb",
        "asch": "#a78a48",
      }
    },
  },
  plugins: [],
}

