export const Theme = {
  colors: {
    primary: '#C85C38',      // Terracota Litoraleño
    primaryHover: '#B24D2C', // Terracota oscuro para hover
    secondary: '#2E6F40',    // Verde natural / Espinillo
    secondaryHover: '#235732',
    accent: '#DFB15B',       // Dorado suave / Sol correntino
    accentLight: '#F5E6C4',  // Dorado ultra claro
    background: '#F8F6F0',   // Arena (Warm Sand Light)
    surface: '#FFFDF9',      // Marfil (Warm Ivory White)
    surfaceDark: '#EDE8DF',  // Arena Oscuro (for borders and section dividers)
    text: '#3E3A33',         // Marrón neutro oscuro (High contrast text)
    textSecondary: '#6E675F',// Marrón claro (Secondary text)
    textLight: '#A3998E',    // Light gray/brown for captions
    cardBg: '#FFFDF9',       // Card background
    border: '#E8E2D5',       // Border line color
    correct: '#2E6F40',      // Quiz success
    incorrect: '#C85C38',    // Quiz error
    white: '#FFFFFF',
    shadow: '#4E483F',
    
    // Dark Editorial Palette (Warm obsidian & dark charcoal, avoiding pure blacks)
    dark: {
      background: '#181513',   // Warm obsidian
      surface: '#24201D',      // Warm charcoal
      surfaceElevated: '#302B27', // Elevated cards in dark mode
      border: '#3D3631',       // Warm subtle border
      text: '#F7F4EF',         // Warm ivory text
      textSecondary: '#B8B0A6',// Warm muted text
      textLight: '#8A8278',    // Caption text
      primary: '#D66843',      // Vibrant Terracota for dark mode
      secondary: '#3B8B52',    // Vibrant green for dark mode
      accent: '#E5BD6B',       // Warm Gold
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  roundness: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 26,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#3E3A33',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#3E3A33',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 4,
    },
    lg: {
      shadowColor: '#3E3A33',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 8,
    },
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 26,
      xxxl: 34,
      hero: 42,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      black: '800' as const,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1.2,
      caps: 1.8,
    }
  },
};

export default Theme;
