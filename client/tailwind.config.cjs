module.exports = {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    screens: {
      // => @media (min-width: {val}) { ... }
      'min-xs': '320px',
      'min-sm': '390px',
      'min-md': '640px',
      'min-lg': '768px',
      'min-xl': '1025px',
      'min-hd': '1280px',
      'min-fhd': '1536px',

      // => @media (max-width: {val}) { ... }
      fhd: { max: '1920px' },
      hd: { max: '1535px' },
      xl: { max: '1279px' },
      lg: { max: '1024px' },
      md: { max: '767px' },
      sm: { max: '639px' },
      xs: { max: '389px' },

      // => @media (min-width: {min} && max-width: {max}) { ... }
      'just-xs': {
        min: '320px',
        max: '689px'
      },
      'just-sm': {
        min: '390px',
        max: '639px'
      },
      'just-md': {
        min: '640px',
        max: '767px'
      },
      'just-lg': {
        min: '768px',
        max: '1024px'
      },
      'just-xl': {
        min: '1025px',
        max: '1279px'
      },
      'just-hd': {
        min: '1280px',
        max: '1535px'
      },

      print: { raw: 'print' }
    },
    fontWeight: {
      thin: '100',
      hairline: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },
  plugins: []
}
