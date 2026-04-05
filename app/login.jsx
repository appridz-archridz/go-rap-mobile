import { Ionicons } from "@expo/vector-icons";
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
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import PressableButton from "../components/PressableButton";
import { AuthService } from "../components/services/authService";
import { theme, typography } from "../constants/theme";
import { login, logout } from "../redux/authSlice";
import { useSnackbar } from "./../components/ui/SnackbarProvider";

const eyeOpen = require("../assets/images/eye-open.png");
const eyeClosed = require("../assets/images/eye-closed.png");

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const Snackbar = useSnackbar();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.logout) {
      dispatch(logout());
    }
  }, [dispatch, params?.logout]);

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

  const getDeviceInfo = () => ({
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
  });

  const validate = () => {
    let allValid = true;

    Object.keys(form).forEach((field) => {
      validateField(field, form[field]);
      if (!form[field] || errors[field]) {
        allValid = false;
      }
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
          token,
          userId: data.data.id,
          userName: data.data.userName,
          email: data.data.email,
          phone: data.data.phoneNumber,
          deviceName: getDeviceInfo().modelName,
          profilePic: data.data.profilePic,
          refreshToken: data.data.refreshToken,
        };

        dispatch(login(stateData));
        Snackbar.show("success", "Log in succesfull");
        router.push("/search-ride");
      } else {
        Snackbar.show("error", data.message || "Login failed. Try again.");
      }
    } catch (error) {
      if (error.response) {
        Snackbar.show("error", error.response.data.message || "Login failed. Try again.");
      } else if (error.request) {
        Snackbar.show("error", "Network error: server not reachable");
      } else {
        Snackbar.show("error", error.message || "Login failed. Try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.keyboardContainer} enableOnAndroid extraScrollHeight={50}>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoBadge}>
              <Image
                source={require("../assets/images/gorap-logo-bg-white.png")}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to continue booking and managing your rides.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputShell}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email address"
                  placeholderTextColor={theme.colors.textMuted}
                  value={form.email}
                  onChangeText={(text) => {
                    setForm({ ...form, email: text });
                    validateField("email", text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputShell}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.textMuted}
                  value={form.password}
                  onChangeText={(text) => {
                    setForm({ ...form, password: text });
                    validateField("password", text);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.85}>
                  <Image style={styles.eyeIcon} source={showPassword ? eyeClosed : eyeOpen} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => router.push("/forgot-password")} activeOpacity={0.85}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PressableButton disabled={!form.email || !form.password} onPress={handleLogin} text="Log in" />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")} activeOpacity={0.85}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  hero: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  logoBadge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 76,
    height: 76,
  },
  title: {
    ...typography.headingLg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
  label: {
    ...typography.label,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    marginBottom: theme.spacing.lg,
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
  textInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  eyeButton: {
    paddingLeft: theme.spacing.sm,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.textMuted,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    fontFamily: "work-sans-medium",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
  signupText: {
    ...typography.bodyMd,
  },
  signupLink: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
  },
});
