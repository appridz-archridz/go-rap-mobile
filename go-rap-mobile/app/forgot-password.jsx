import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
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
          <Image
            style={styles.successIcon}
            // source={require("../assets/images/email-sent.png")}
          />
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We have sent a password reset link to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.loginButtonText}>Back to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleSendReset}
          >
            <Text style={styles.resendText}>Did not receive email? Resend</Text>
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
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
        <Image
          style={styles.backIcon}
          source={require("../assets/images/location.png")}
        />
      </TouchableOpacity>

      <View style={styles.forgotContainer}>
        <Image
          style={styles.forgotIcon}
          source={require("../assets/images/location.png")}
        />
        <Text style={styles.forgotTitle}>Forgot Password?</Text>
        <Text style={styles.forgotSubtitle}>
          No worries! Enter your email address and we will send you a reset
          link.
        </Text>

        <View style={styles.inputContainer}>
          <Image
            style={styles.icon}
            source={require("../assets/images/location.png")}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleSendReset}>
          <Text style={styles.loginButtonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#000",
  },
  forgotContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotIcon: {
    width: 50,
    height: 50,
    marginBottom: 24,
  },
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
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: "#0057D9",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    outlineStyle: "none",
  },
  loginButton: {
    backgroundColor: "#0057D9",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  backToLoginButton: {
    marginTop: 16,
  },
  backToLoginText: {
    color: "#0057D9",
    fontSize: 14,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    tintColor: "#4CAF50",
    marginBottom: 24,
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
  emailText: {
    fontWeight: "600",
    color: "#0057D9",
  },
  resendButton: {
    marginTop: 16,
  },
  resendText: {
    color: "#0057D9",
    fontSize: 14,
    fontWeight: "600",
  },
});
