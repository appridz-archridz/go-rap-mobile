import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { inputField } from "../global-css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value) => {
    if (!value) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
    return "";
  };

  const handleSendReset = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setIsSubmitted(true);
    console.log("Reset password for:", email);
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We have sent a password reset link to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleSendReset}>
            <Text style={styles.linkButtonText}>
              Did not receive email? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin} />

      <View style={styles.forgotContainer}>
        <Text style={styles.forgotTitle}>Forgot Password?</Text>
        <Text style={styles.forgotSubtitle}>
          No worries! Enter your email address and we will send you a reset link.
        </Text>

        {/* Email input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={inputField}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(validateEmail(text));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Buttons */}
        <TouchableOpacity style={styles.button} onPress={handleSendReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleBackToLogin}>
          <Text style={styles.linkButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 1, padding: 8 },
  forgotContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  forgotTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  forgotSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: { width: "100%" },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 6,
    alignSelf: "flex-start",
    marginLeft: 6,
  },
  button: {
    height: 52,
    backgroundColor: "#2094F3FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  linkButton: { marginTop: 16 },
  linkButtonText: { color: "#0057D9", fontSize: 14, fontWeight: "600" },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emailText: { fontWeight: "600", color: "#0057D9" },
});
