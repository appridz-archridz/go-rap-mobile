import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService, forgotPassword } from "../components/services/authService";
import { theme, typography } from "../constants/theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      const { data } = await AuthService.isEmailExists(email);
      if (!data?.success) {
        Alert.alert("User Not Found", "Email that you entered is not found. Please try again.");
        return;
      }

      setError("");
      setLoading(true);

      try {
        await forgotPassword(email);
        router.push({
          pathname: "/verify-otp",
          params: { email },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    } catch (_err) {
      Alert.alert("User Not Found", "Email that you entered is not found. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconWrap}>
        <Ionicons name="mail-open-outline" size={38} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we&apos;ll send you a verification code to reset your password.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Email address</Text>
        <View style={styles.inputShell}>
          <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOtp} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Send Verification Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/login")} activeOpacity={0.85}>
        <Text style={styles.linkButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    alignItems: "center",
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...typography.headingLg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  label: {
    ...typography.label,
    marginBottom: theme.spacing.sm,
  },
  inputShell: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
  },
  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  buttonDisabled: {
    backgroundColor: "#F8B39B",
  },
  buttonText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
  },
  linkButton: {
    marginTop: theme.spacing.lg,
  },
  linkButtonText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
  },
});
