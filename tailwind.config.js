/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
      },
      spacing: {
        'card': '1.5rem',  // 24px - 卡片内边距
        'section': '1rem', // 16px - 区块间距
      },
      borderRadius: {
        'card': '1rem',    // 16px - 卡片圆角
        'button': '0.5rem', // 8px - 按钮圆角
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'primary': '0 4px 14px 0 rgba(255, 107, 157, 0.39)',
      },
    },
  },
  plugins: [],
}
