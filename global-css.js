import { theme } from "./constants/theme";

export const inputField = {
  width: "100%",
  borderColor: theme.colors.border,
  borderWidth: 1,
  borderRadius: theme.borderRadius.md,
  height: 48,
  fontSize: theme.fontSizes.md,
  color: theme.colors.textPrimary,
  backgroundColor: theme.colors.white,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.lg,
  paddingRight: 32,
  fontFamily: "work-sans-regular",
};

export const defaultButton = {
  minHeight: 52,
  backgroundColor: theme.colors.primary,
  paddingVertical: theme.spacing.md,
  borderRadius: theme.borderRadius.full,
  paddingHorizontal: theme.spacing.xl,
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  gap: theme.spacing.sm,
  ...theme.shadows.button,
};

export const clearButton = {
  position: "absolute",
  right: theme.spacing.md,
  top: 14,
};

export const inputWithCross = {
  position: "relative",
};
