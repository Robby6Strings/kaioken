import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./inertia/**/*.{tsx,css}'],
  theme: {
    colors: {
      'beige': {
        500: '#989088',
        100: '#F8F4F0',
      },
      'grey': {
        900: '#201F24',
        500: '#696868',
        300: '#B3B3B3',
        100: '#F2F2F2',
      },
      'green': '#277C78',
      'yellow': '#F2CDAC',
      'cyan': '#82C9D7',
      'navy': '#626070',
      'red': '#C94736',
      'purple': '#826CB0',
      'pink': '#AF81BA',
      'turquoise': '#597C7C',
      'brown': '#93674F',
      'magenta': '#934F6F',
      'blue': '#3F82B2',
      'navy-grey': '#97A0AC',
      'army-green': '#7F9161',
      'gold': '#CAB361',
      'orange': '#BE6C49',
      'white': '#FFFFFF',
    },
    fontFamily: {
      public: ['Public Sans Variable', 'sans-serif'],
    },
    spacing: {
      500: '2.5rem',
      400: '2rem',
      300: '1.5rem',
      250: '1.25rem',
      200: '1rem',
      150: '0.75rem',
      100: '0.5rem',
      50: '0.25rem',
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.text-preset-1': {
          fontFamily: theme('fontFamily.public'),
          fontSize: '2rem',
          lineHeight: '2.4rem',
        },
        '.text-preset-2': {
          fontFamily: theme('fontFamily.public'),
          fontSize: '1.25rem',
          lineHeight: '1.5rem',
        },
        '.text-preset-3': {
          fontFamily: theme('fontFamily.public'),
          fontSize: '1rem',
          lineHeight: '1.5rem',
        },
        '.text-preset-4': {
          fontFamily: theme('fontFamily.public'),
          fontSize: '0.875rem',
          lineHeight: '1.3125rem',
        },
        '.text-preset-5': {
          fontFamily: theme('fontFamily.public'),
          fontSize: '0.75rem',
          lineHeight: '1.125rem',
        },
      })
    }),
  ],
}
