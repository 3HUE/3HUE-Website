/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0d1b2a",
        mist: "#f2f4f8",
        tide: "#0f766e",
        coral: "#f97316",
        slate: "#94a3b8"
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(15, 118, 110, 0.45)"
      }
    }
  },
  plugins: []
};
