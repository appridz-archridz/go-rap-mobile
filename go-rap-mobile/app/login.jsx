import { router, useNavigation } from "expo-router";
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

const eyeOpen = require("../assets/images/location.png");
const eyeClosed = require("../assets/images/location.png");

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    router.push("/search-ride");
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/location.png")} />
        <Text style={styles.appName}>Go-Rap</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.inputContainer}>
          <Image
            style={styles.icon}
            source={require("../assets/images/location.png")}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            style={styles.icon}
            source={require("../assets/images/location.png")}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Image
              style={styles.eyeIcon}
              source={showPassword ? eyeClosed : eyeOpen}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            style={styles.socialIcon}
            source={require("../assets/images/location.png")}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Dont have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;

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
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: "#0057D9",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0057D9",
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
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
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    height: 24,
    width: 24,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#0057D9",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#0057D9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#0057D9",
    fontSize: 14,
    fontWeight: "600",
  },
});
