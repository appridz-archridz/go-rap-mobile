import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Snackbar, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AuthService } from "../../components/services/authService";
import { uploadMedia } from "../../components/services/cloudinary";
import { useLoader } from "../../components/ui/Loader";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { theme, typography } from "../../constants/theme";
import { inputField } from "../../global-css";
import { logout, update } from "../../redux/authSlice";
import { HelperService } from "../../services/helper-service";

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "R-A-P",
    email: "ridz@gmail.com",
    phone: "+91 9XXXXXXXX",
  });
  const [cameraFacing, setCameraFacing] = useState("front");
  const [showCamera, setShowCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [localPreviewUri, setLocalPreviewUri] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  const { showLoader, hideLoader } = useLoader();
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const selector = useSelector((state) => state.auth);
  const cameraRef = useRef(null);

  const handleEditProfile = () => setIsEditable(true);
  const handleResetPassword = () => router.push("/reset-password");

  const handleLogout = () => {
    dispatch(logout());
    AsyncStorage.removeItem("token");
    HelperService.removeToken();
    setIsSnackbarVisible(true);
    snackbar.show("success", "Logged out successfully");
    router.replace("/login");
  };

  useEffect(() => {
    setUser({ ...selector, name: selector.userName });
  }, [selector]);

  const updateProfile = async () => {
    try {
      let uploadedUrl = capturedImage || selector.profilePic;

      if (localPreviewUri) {
        try {
          showLoader("Uploading profile image...");
          const response = await uploadMedia(localPreviewUri, "image/jpeg");
          uploadedUrl =
            response?.secure_url || response?.url || response?.data?.secure_url || uploadedUrl;
        } catch (_err) {
          snackbar.show("error", "Image upload failed. Try again.");
          return;
        } finally {
          hideLoader();
        }
      }

      const payload = {
        id: selector.userId,
        ...(user.name && { userName: user.name }),
        ...(user.email && { email: user.email }),
        ...(user.phone && { phoneNumber: user.phone }),
        ...(uploadedUrl && { profilePic: uploadedUrl }),
      };

      const updateProfileDetails = {
        userName: payload.userName || selector.userName,
        email: payload.email || selector.email,
        phone: payload.phoneNumber || selector.phone,
        profilePic: uploadedUrl || selector.profilePic,
      };

      await AuthService.updateProfile(payload);
      dispatch(update(updateProfileDetails));
      setCapturedImage(uploadedUrl);
      setLocalPreviewUri(null);
      setPreviewUri(null);
      setUser({ ...payload, phone: payload.phoneNumber, name: payload.userName });
      setIsEditable(false);
      snackbar.show("success", "Profile updated!");
    } catch (_error) {
      snackbar.show("error", "Error while updating profile");
    }
  };

  const openCamera = async () => {
    showLoader("Opening camera...");
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setShowCamera(true);
    } else {
      hideLoader();
      Alert.alert("Permission Denied", "Camera permission is required");
    }
  };

  const takePicture = async () => {
    try {
      showLoader("Capturing...");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo?.uri) {
        setPreviewUri(photo.uri);
        setLocalPreviewUri(photo.uri);
      } else {
        Alert.alert("Capture failed", "Please try again.");
      }
    } catch (_error) {
      Alert.alert("Error", "Could not take picture");
    } finally {
      hideLoader();
    }
  };

  const confirmPreview = () => {
    setPreviewUri(null);
    setShowCamera(false);
  };

  const cancelPreview = () => {
    setPreviewUri(null);
    setLocalPreviewUri(null);
    setShowCamera(false);
  };

  const menuSections = [
    {
      id: "account",
      title: "Account",
      items: [
        {
          id: 1,
          title: "Edit profile",
          subtitle: "Keep your name and photo updated",
          icon: "person-outline",
          onPress: handleEditProfile,
        },
        {
          id: 2,
          title: "Reset password",
          subtitle: "Update your account credentials",
          icon: "lock-closed-outline",
          onPress: handleResetPassword,
        },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      items: [
        {
          id: 5,
          title: "Vehicles",
          subtitle: "Manage your saved vehicles",
          icon: "car-sport-outline",
          onPress: () => router.push("/user-vehicles"),
        },
      ],
    },
  ];

  const displayedProfileUri =
    localPreviewUri ||
    capturedImage ||
    selector.profilePic ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <View style={styles.headerGlow} />
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: displayedProfileUri }} style={styles.profileImage} />
            {isEditable ? (
              <TouchableOpacity style={styles.editImageButton} onPress={openCamera} activeOpacity={0.85}>
                <Ionicons name="camera" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            ) : null}
          </View>

          {isEditable ? (
            <TextInput
              style={styles.nameInput}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="words"
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          ) : (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </>
          )}

          <View style={styles.actionRow}>
            {isEditable ? (
              <TouchableOpacity style={styles.secondaryAction} onPress={() => setIsEditable(false)} activeOpacity={0.85}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={isEditable ? updateProfile : handleEditProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>{isEditable ? "Save changes" : "Edit profile"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activityNoticeWrap}>
          <TouchableOpacity style={styles.activityNotice} onPress={() => router.push("/activity")} activeOpacity={0.85}>
            <View style={styles.activityNoticeIcon}>
              <Ionicons name="reader-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.activityNoticeBody}>
              <Text style={styles.activityNoticeTitle}>My Activity moved here</Text>
              <Text style={styles.activityNoticeText}>Use the My Activity tab for Offered Rides and Requested Rides.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {menuSections.map((section) => (
          <View key={section.id} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.85}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  {index !== section.items.length - 1 ? <View style={styles.menuDivider} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          {previewUri ? (
            <>
              <Image source={{ uri: previewUri }} style={{ width: "100%", height: "80%" }} />
              <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 16 }}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.error, paddingHorizontal: 24 }]}
                  onPress={cancelPreview}
                >
                  <Text style={{ color: theme.colors.white, fontWeight: "700" }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.primary, paddingHorizontal: 24 }]}
                  onPress={confirmPreview}
                >
                  <Text style={{ color: theme.colors.white, fontWeight: "700" }}>Use Photo</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing={cameraFacing}
                ratio="16:9"
                onCameraReady={hideLoader}
              />

              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => {
                    hideLoader();
                    setShowCamera(false);
                  }}
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
                  onPress={() => setCameraFacing((f) => (f === "front" ? "back" : "front"))}
                >
                  <Ionicons name="camera-reverse" size={28} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      <Snackbar visible={isSnackbarVisible} onDismiss={() => setIsSnackbarVisible(false)} duration={3000} style={styles.snackbar}>
        Logged out successfully!
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingBottom: theme.spacing.xxxl,
  },
  headerCard: {
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -36,
    right: -24,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#FFE1CC",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.lg,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  nameInput: {
    ...inputField,
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  userName: {
    ...typography.headingLg,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    ...typography.bodyMd,
  },
  userPhone: {
    ...typography.bodyMd,
    marginBottom: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  primaryAction: {
    minHeight: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  primaryActionText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  secondaryAction: {
    minHeight: 44,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: theme.colors.textSecondary,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
  },
  activityNoticeWrap: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  activityNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.skyBlue,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  activityNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  activityNoticeBody: {
    flex: 1,
  },
  activityNoticeTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  activityNoticeText: {
    marginTop: theme.spacing.xs,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  sectionWrap: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    position: "relative",
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  menuSubtitle: {
    marginTop: theme.spacing.xs,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  menuDivider: {
    position: "absolute",
    left: 70,
    right: theme.spacing.lg,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.error,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  versionText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
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
  snackbar: {
    backgroundColor: theme.colors.primary,
  },
});
