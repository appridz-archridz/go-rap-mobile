import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { updatePassword } from "../components/services/authService";
import { theme, typography } from "../constants/theme";

const eyeOpen = require("../assets/images/eye-open.png");
const eyeClosed = require("../assets/images/eye-closed.png");

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const email = params.email;
  const fromOtp = params.fromOtp === "true";
  const selector = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    let message = "";

    if (field === "newPassword") {
      if (!value) message = "New password is required";
      else if (value.length < 8) message = "Password must be at least 8 characters";
    }

    if (field === "confirmPassword") {
      if (!value) message = "Please confirm your password";
      else if (value !== newPassword) message = "Passwords do not match";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === "";
  };

  const validate = () => {
    const fields = { newPassword, confirmPassword };
    let allValid = true;

    Object.entries(fields).forEach(([field, value]) => {
      if (!validateField(field, value)) allValid = false;
    });

    return allValid;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await updatePassword(email, newPassword);
      router.push("/login");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.message || "Failed to update password. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (label, value, setter, visible, setVisible, errorKey, placeholder) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={!visible}
          value={value}
          onChangeText={(text) => {
            setter(text);
            if (errors[errorKey]) validateField(errorKey, text);
          }}
          onBlur={() => validateField(errorKey, value)}
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setVisible((prev) => !prev)} activeOpacity={0.85}>
          <Image source={visible ? eyeClosed : eyeOpen} style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>
      {errors[errorKey] ? <Text style={styles.errorText}>{errors[errorKey]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconWrap}>
          <Ionicons name="key-outline" size={38} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{fromOtp ? "Create New Password" : "Reset Password"}</Text>
        <Text style={styles.subtitle}>
          {fromOtp
            ? "Create a strong password to secure your account."
            : "Enter a new password for your account."}
        </Text>

        <View style={styles.formCard}>
          {renderPasswordField(
            "New Password",
            newPassword,
            setNewPassword,
            showNewPassword,
            setShowNewPassword,
            "newPassword",
            "Enter new password"
          )}
          {renderPasswordField(
            "Confirm Password",
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            "confirmPassword",
            "Confirm new password"
          )}
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>

        {!selector.isAuthenticated ? (
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/login")} activeOpacity={0.85}>
            <Text style={styles.linkButtonText}>Back to Login</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
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
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.textMuted,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
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
