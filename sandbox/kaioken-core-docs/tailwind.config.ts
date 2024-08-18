import plugin, { type Config } from "tailwindcss"
import plugins from 'tailwindcss/plugin'

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}"],
  theme: {
    colors: {
      grey: {
        700: '#1e1e1e',
        900: '#151313'
      },
      red: '#ea495e',
      black: '#000',
      white: '#FFF',
    },
    fontFamily: {
      cabin: ["'Cabin Variable'", 'sans-serif']
    },
    animation: {
      "background-shine": "background-shine 2s linear infinite"
    },
    keyframes: {
      "background-shine": {
        "from": {
          backgroundPosition: "0 0"
        },
        "to": {
          backgroundPosition: "-200% 0"
        }
      }
    }
  },
  plugins: [
    plugins(({ addUtilities }) => {
      addUtilities({
        '.bg-glass': {
          'background': `rgba( 0, 0, 0, 0.05 )`,
          'backdrop-filter': 'blur( 20px )',
          '-webkit-backdrop-filter': 'blur( 20px )',
          'border': '1px solid rgba( 255, 255, 255, 0.18 )',
        },
        '.bg-glass-red': {
          'background': `rgba( 25, 18, 18, 0.8 )`,
          'backdrop-filter': 'blur( 20px )',
          '-webkit-backdrop-filter': 'blur( 20px )',
          'border': '1px solid rgba( 255, 255, 255, 0.18 )',
        },
        '.bg-metalic': {
          background: `linear-gradient(
            45deg,
            #999 20%,
            #ccc 30%,
            #ddd 50%,
            #ccc 70%,
            #fff 80%,
            #999 95%
          )`
        },
        '.text-metalic': {
          background: `linear-gradient(
            45deg,
            #999 5%,
            #fff 10%,
            #ccc 30%,
            #ddd 50%,
            #ccc 70%,
            #fff 80%,
            #999 95%
          )`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        }
      })
    })
  ],
} satisfies Config
