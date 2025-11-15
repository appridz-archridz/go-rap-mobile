import * as Device from "expo-device";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import PressableButton from "../components/PressableButton";
import { AuthService } from "../components/services/authService";
import { inputField } from "../global-css";
import { login } from "../redux/authSlice";
import { useSnackbar } from './../components/ui/SnackbarProvider';

const eyeOpen = require("../assets/images/eye-open.png");
const eyeClosed = require("../assets/images/eye-closed.png");
const googleIcon = require("../assets/images/google.png");

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const { isAuthenticated, email } = useSelector((state) => state.auth);
  const [IsSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const Snackbar = useSnackbar();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.logout) {
      dispatch(logout());
    }

    if (isAuthenticated && !params?.logout) {

      router.replace("/search-ride");
    }
  }, [isAuthenticated])

  const validateField = (field, value) => {
    let message = "";

    if (field === "email") {
      if (!value) message = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) message = "Enter a valid email address";
    }

    if (field === "password") {
      if (!value) message = "Password is required";
      else if (value.length < 8) message = "Password must be at least 8 characters";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const getDeviceInfo = () => {
    const deviceInfo = {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      modelId: Device.modelId,
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceName: Device.deviceName,
      designName: Device.designName,
      productName: Device.productName,
      deviceType: Device.deviceType,
      isDevice: Device.isDevice,
    };

    return deviceInfo;
  };


  const validate = () => {
    let allValid = true;

    Object.keys(form).forEach((field) => {
      validateField(field, form[field]);
      if (errors[field]) allValid = false;
    });

    return allValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const payLoad = {
      usernameOrEmail: form.email,
      password: form.password,
    };

    try {
      const { data } = await AuthService.login(payLoad);
      const token = data.data?.token;

      if (data.statusCode === "200 OK") {

        const stateData = {
          token: token,
          userId: data.data.id,
          userName: data.data.userName,
          email: data.data.email,
          phone: data.data.phoneNumber,
          deviceName: getDeviceInfo().modelName,
          profilePic: data.data.profilePic
        }
        dispatch(login(stateData));
        setIsSnackbarVisible(true);
        Snackbar.show('success', "Log in succesfull");
        console.log('Login successfull!!!');
        router.push('/search-ride');

      } else {
        console.log("Login failed:", data.message);
        Snackbar.show('error', data.message || "Login failed. Try again.");
      }
    } catch (error) {
      if (error.response) {
        console.log("Server error:", error.response.data.message);
        Snackbar.show('error', error.response.data.message || "Login failed. Try again.");
      } else if (error.request) {
        console.log("Network error: server not reachable");
        Snackbar.show('error', "Network error: server not reachable");
      } else {
        console.log("Unexpected error:", error.message);
        Snackbar.show('error', error.message || "Login failed. Try again.");
      }
    }
  };

  const handleSignUp = () => router.push("/signup");
  const handleForgotPassword = () => router.push("/forgot-password");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/gorap-location-animation.gif')} resizeMode="contain" />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={inputField}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={form.email}
                onChangeText={(text) => {
                  setForm({ ...form, email: text });
                  validateField("email", text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={{ ...inputField, paddingRight: 44 }}
                placeholder="Password"
                placeholderTextColor="#999"
                value={form.password}
                onChangeText={(text) => {
                  setForm({ ...form, password: text });
                  validateField("password", text);
                }}
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

            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* reset password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  router.push("/forgot-password");
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  router.push("/reset-password");
                }}
              >
                <Text style={styles.forgotPasswordText}>Reset Password?</Text>
              </TouchableOpacity>
            </View>


            {/* Login Button */}
            <PressableButton disabled={!form.email || !form.password} onPress={handleLogin} text="Log in" />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Login */}
            <TouchableOpacity style={styles.socialButton}>
              <Image style={styles.socialIcon} source={googleIcon} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Snackbar */}
          {/* <View>
          <Snackbar
            visible={IsSnackbarVisible}
            onDismiss={() => setIsSnackbarVisible(false)}
            duration={3000}
            style={styles.snackbar}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="check-circle" size={25} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.snackbarText}>  </Text>
            </View>
          </Snackbar>
        </View> */}
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView >
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 90, height: 90, marginBottom: 10, tintColor: "#0057D9" },
  appName: { fontSize: 30, fontWeight: "700", color: "#0057D9" },
  formContainer: { width: "100%" },
  title: { fontSize: 24, fontWeight: "700", color: "#000", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#666", textAlign: "center", marginBottom: 30 },
  inputWrapper: {
    marginBottom: 18,
    position: "relative", // allows absolute positioning inside
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }], // center vertically (since icon is ~22px tall)
    padding: 4,
  },
  eyeIcon: {
    height: 22,
    width: 22,
    tintColor: "#666",
  }, bottomText: { color: "gray", fontSize: 12, marginTop: 4, marginLeft: 4 },
  forgotPasswordButton: { alignSelf: "flex-end", marginBottom: 20 },
  forgotPasswordText: { color: "#0057D9", fontSize: 14, fontWeight: "600" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dividerText: { color: "#999", paddingHorizontal: 12, fontSize: 14 },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 22,
  },
  socialIcon: { width: 22, height: 22, marginRight: 10 },
  socialButtonText: { color: "#000", fontSize: 15, fontWeight: "500" },
  signupContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  signupText: { color: "#666", fontSize: 14 },
  signupLink: { color: "#0057D9", fontSize: 14, fontWeight: "600" },
  errorText: { color: "red", fontSize: 12, marginTop: 4, marginLeft: 4 },
});
