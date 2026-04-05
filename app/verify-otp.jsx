import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { forgotPassword, verifyOtp } from "../components/services/authService";
import { theme, typography } from "../constants/theme";

export default function VerifyOtp() {
  const params = useLocalSearchParams();
  const email = params.email;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otpString);
      router.push({
        pathname: "/reset-password",
        params: { email, fromOtp: "true" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setResendTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={38} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{"\n"}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      <View style={styles.otpInputContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit ? styles.otpInputFilled : null,
              error ? styles.otpInputError : null,
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOtp} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>Resend code in {resendTimer}s</Text>
        )}
      </View>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Text style={styles.linkButtonText}>Change Email</Text>
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
    marginBottom: theme.spacing.xxl,
  },
  emailText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: "center",
    fontSize: theme.fontSizes.xxl,
    fontFamily: "work-sans-bold",
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.white,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  otpInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
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
  resendContainer: {
    marginTop: theme.spacing.xl,
    alignItems: "center",
  },
  resendText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
  },
  timerText: {
    color: theme.colors.textMuted,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
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
