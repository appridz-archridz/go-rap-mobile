import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import { Camera, CameraView } from "expo-camera";
import * as Device from "expo-device";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FilePicker from "../components/FilePicker";
import PressableButton from "../components/PressableButton";
import { signUp } from "../components/services/authService";
import { uploadMedia } from "../components/services/cloudinary";
import { useLoader } from "../components/ui/Loader";
import { useSnackbar } from "../components/ui/SnackbarProvider";
import { theme, typography } from "../constants/theme";

const eyeOpen = require("../assets/images/eye-open.png");
const eyeClosed = require("../assets/images/eye-closed.png");

const SignUp2 = () => {
  const { fullName, email, phone } = useLocalSearchParams();
  const [profilePic, setProfilePic] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("front");
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const snackbar = useSnackbar();
  const cameraRef = useRef(null);

  const validateField = (field, value) => {
    let message = "";

    if (field === "profilePic" && !value) {
      message = "Please upload a profile picture";
    }

    if (field === "password") {
      if (!value) message = "Password is required";
      else if (value.length < 8) message = "Password must be at least 8 characters";
    }

    if (field === "confirmPassword") {
      if (!value) message = "Please confirm your password";
      else if (value !== password) message = "Passwords do not match";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validate = () => {
    const fieldsToValidate = { profilePic, password, confirmPassword };
    let allValid = true;

    Object.entries(fieldsToValidate).forEach(([field, value]) => {
      validateField(field, value);
      if (
        (field === "profilePic" && !value) ||
        (field === "password" && (!value || value.length < 8)) ||
        (field === "confirmPassword" && (value !== password || !value))
      ) {
        allValid = false;
      }
    });

    return allValid;
  };

  const getDeviceInfo = async () => {
    const deviceId =
      Device.osName === "iOS"
        ? await Application.getIosIdForVendorAsync()
        : Application.getAndroidId();

    return {
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
      uniqueId: deviceId,
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        userName: fullName,
        email,
        password,
        phoneNumber: phone,
        address: "",
        role: "USER",
        profilePic: profilePic?.uri,
        deviceName: (await getDeviceInfo()).uniqueId,
      };

      const { data } = await signUp(payload);

      if (data && data?.success) {
        router.push("/login");
        snackbar.show("success", data?.message || "Signup successful.");
      } else {
        snackbar.show("error", data?.message || "Signup failed. Try again.");
      }
    } catch (error) {
      snackbar.show("error", error?.response?.data?.message || "Signup failed. Try again.");
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        setShowCamera(true);
      } else {
        Alert.alert("Permission Denied", "Camera permission is required to take profile picture.");
      }
    } catch (_err) {
      Alert.alert("Error", "Unable to access camera. Please try again.");
    }
  };

  const takePicture = async () => {
    showLoader();
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setShowCamera(false);

      if (!photo?.uri) {
        Alert.alert("Capture failed", "Could not capture image. Try again.");
        return;
      }

      setIsUploading(true);
      const response = await uploadMedia(photo.uri, "image/jpeg");
      const uploadedUrl = response?.secure_url || response?.url || response?.data?.secure_url;

      if (uploadedUrl) {
        const file = { uri: uploadedUrl };
        setProfilePic(file);
        validateField("profilePic", file);
      } else {
        Alert.alert("Upload failed", "Image upload failed. Please try again.");
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to take or upload picture. Try again.");
    } finally {
      setIsUploading(false);
      setShowCamera(false);
      hideLoader();
    }
  };

  const renderProfilePreview = () => {
    const uri = profilePic?.uri;
    if (!uri) return null;

    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.previewImage} />
        <TouchableOpacity onPress={() => setProfilePic(null)} style={styles.previewClear} activeOpacity={0.85}>
          <FontAwesome name="times" size={14} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    );
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
            validateField(errorKey, text);
          }}
        />
        <TouchableOpacity onPress={() => setVisible((prev) => !prev)} activeOpacity={0.85}>
          <Image source={visible ? eyeClosed : eyeOpen} style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>Use 8 or more characters</Text>
      {errors[errorKey] ? <Text style={styles.errorText}>{errors[errorKey]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.keyboardContainer} enableOnAndroid extraScrollHeight={50}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Step 2 of 2</Text>
            <Text style={styles.heading}>Secure your account</Text>
            <Text style={styles.caption}>Add a profile photo and create a strong password to finish setting up.</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Profile Picture</Text>
              <View style={styles.mediaRow}>
                {!profilePic?.uri ? (
                  <FilePicker
                    onFileSelected={(file) => {
                      setProfilePic(file);
                      validateField("profilePic", file);
                    }}
                  />
                ) : null}
                {!profilePic?.uri ? (
                  <TouchableOpacity style={styles.cameraButton} onPress={openCamera} activeOpacity={0.85}>
                    <Ionicons name="camera-outline" size={18} color={theme.colors.white} />
                    <Text style={styles.cameraButtonText}>{isUploading ? "Uploading..." : "Camera"}</Text>
                  </TouchableOpacity>
                ) : null}
                {renderProfilePreview()}
              </View>
              {errors.profilePic ? <Text style={styles.errorText}>{errors.profilePic}</Text> : null}
            </View>

            {renderPasswordField(
              "Create Password",
              password,
              setPassword,
              showPassword,
              setShowPassword,
              "password",
              "Enter a strong password"
            )}

            {renderPasswordField(
              "Confirm Password",
              confirmPassword,
              setConfirmPassword,
              showConfirmPassword,
              setShowConfirmPassword,
              "confirmPassword",
              "Confirm your password"
            )}
          </View>

          <PressableButton text="Sign Up Now" onPress={handleSubmit} />

          <Text style={styles.confirmText}>
            By clicking &quot;Sign Up Now&quot;, you agree to our{" "}
            <Text style={styles.linkText} onPress={() => router.push("/TermsAndConditions")}>Terms & Conditions</Text> and{" "}
            <Text style={styles.linkText} onPress={() => router.push("/PrivacyPolicy")}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAwareScrollView>

      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} facing={cameraFacing} ratio="16:9" />
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.error }]}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={30} color={theme.colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={30} color={theme.colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setCameraFacing(cameraFacing === "front" ? "back" : "front")}
            >
              <Ionicons name="camera-reverse" size={28} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
  },
  eyebrow: {
    ...typography.label,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: theme.spacing.sm,
  },
  heading: {
    ...typography.headingLg,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 22,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flexWrap: "wrap",
  },
  cameraButton: {
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    ...theme.shadows.button,
  },
  cameraButtonText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
  },
  previewContainer: {
    position: "relative",
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewClear: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.error,
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
  helperText: {
    ...typography.bodySm,
  },
  confirmText: {
    ...typography.bodySm,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-medium",
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraControls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  controlButton: {
    padding: 18,
    borderRadius: 50,
  },
});
