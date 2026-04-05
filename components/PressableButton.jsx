import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";

const PressableButton = ({ customStyles, text, onPress, rightArrow = false, disabled = false }) => {
  const isOutlined = customStyles?.variant === "outlined";

  const styles = StyleSheet.create({
    button: {
      minHeight: customStyles?.height || 52,
      backgroundColor: isOutlined
        ? theme.colors.white
        : customStyles?.bgColor || theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: customStyles?.borderRadius || theme.borderRadius.full,
      borderWidth: isOutlined ? 1.5 : 0,
      borderColor: customStyles?.borderColor || theme.colors.primary,
      opacity: disabled ? 0.55 : 1,
      ...(isOutlined ? {} : theme.shadows.button),
    },
    text: {
      fontFamily: "work-sans-bold",
      color: customStyles?.color || (isOutlined ? theme.colors.primary : theme.colors.white),
      fontSize: customStyles?.fontSize || theme.fontSizes.lg,
      textAlign: "center",
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    arrow: {
      width: 18,
      height: 18,
      tintColor: customStyles?.color || (isOutlined ? theme.colors.primary : theme.colors.white),
    },
  });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85} disabled={disabled}>
      <View style={styles.center}>
        <Text style={styles.text}>{text}</Text>
        {rightArrow ? (
          <Image source={require("../assets/images/right-arrow.png")} style={styles.arrow} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default PressableButton;
