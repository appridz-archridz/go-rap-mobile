export const theme = {
  colors: {
    primary: "#FF6B35",
    secondary: "#FFD166",
    accent: "#06D6A0",
    background: "#FFFFFF",
    surface: "#FFF8F0",
    surfaceAlt: "#FFF0F5",
    skyBlue: "#E8F4FD",
    border: "#F0E6E6",
    textPrimary: "#1A1A2E",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    error: "#EF4444",
    white: "#FFFFFF",
    black: "#000000",
  },
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  shadows: {
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    button: {
      shadowColor: "#FF6B35",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 3,
    },
  },
};

export const typography = {
  headingXl: {
    fontSize: theme.fontSizes.xxxl,
    fontFamily: "work-sans-bold",
    color: theme.colors.textPrimary,
  },
  headingLg: {
    fontSize: theme.fontSizes.xxl,
    fontFamily: "work-sans-bold",
    color: theme.colors.textPrimary,
  },
  headingMd: {
    fontSize: theme.fontSizes.xl,
    fontFamily: "work-sans-bold",
    color: theme.colors.textPrimary,
  },
  bodyMd: {
    fontSize: theme.fontSizes.md,
    fontFamily: "work-sans-regular",
    color: theme.colors.textSecondary,
  },
  bodySm: {
    fontSize: theme.fontSizes.sm,
    fontFamily: "work-sans-regular",
    color: theme.colors.textSecondary,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontFamily: "work-sans-medium",
    color: theme.colors.textSecondary,
  },
};
