export const Theme = {
  colors: {
    primary: '#C85C38',      // Terracota
    secondary: '#2E6F40',    // Verde natural
    accent: '#DFB15B',       // Dorado suave
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  roundness: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#4E483F',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#4E483F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#4E483F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
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
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};

export default Theme;
