import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { inputField } from "../../global-css";
import { logout, update } from "../../redux/authSlice";
import { HelperService } from "../../services/helper-service";

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "R-A-P",
    email: "ridz@gmail.com",
    phone: "+91 9XXXXXXXX",
    ridesCreated: 15,
    ridesJoined: 8,
    rating: 4.8,
  });
  const [cameraFacing, setCameraFacing] = useState("front");
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

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
  }, []);

  const updateProfile = async () => {
    try {
      const payload = {
        id: selector.userId,
        ...(user.name && { userName: user.name }),
        ...(user.email && { email: user.email }),
        ...(user.phone && { phoneNumber: user.phone }),
        ...(capturedImage && { profilePic: capturedImage }),
      };
      await AuthService.updateProfile(payload);

      const updateProfileDetails = {
        userName: payload.userName || selector.userName,
        email: payload.email || selector.email,
        phone: payload.phoneNumber || selector.phone,
        profilePic: capturedImage || selector.profilePic,
      };

      dispatch(update(updateProfileDetails));
      setUser({ ...payload, phone: payload.phoneNumber, name: payload.userName });
      setIsEditable(false);
      snackbar.show("success", "Profile updated!");
    } catch (error) {
      console.log('erro while updating user details: ', error);
      snackbar.show("error", "Error while updating profile");
    }
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setShowCamera(true);
    } else {
      Alert.alert("Permission Denied", "Camera permission is required");
    }
  };

  const takePicture = async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const file = {
        uri: photo.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const response = await uploadMedia(file.uri, file.type);

      if (response?.secure_url) {
        setCapturedImage(response.url);
      } else {
        Alert.alert("Image upload failed", "Please try again.");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setShowCamera(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "My Rides",
      subtitle: "View your created and joined rides",
      icon: "car-outline",
      onPress: () => router.push("/UserRidesScreen"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  selector.profilePic ||
                  capturedImage ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
              }}
              style={styles.profileImage}
            />
            {isEditable && (
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={openCamera}
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {isEditable ? (
            <TextInput
              style={inputField}
              placeholder="Full Name"
              placeholderTextColor="gray"
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

          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignContent: "center", alignItems: "center", gap: 10 }}>

            {isEditable &&
              <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditable(false)}>
                <Text style={styles.editProfileText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            }

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={isEditable ? updateProfile : handleEditProfile}
            >
              <Text style={styles.editProfileText}>
                {isEditable ? "Update" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.ridesCreated}</Text>
            <Text style={styles.statLabel}>Rides Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.ridesJoined}</Text>
            <Text style={styles.statLabel}>Rides Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statNumber}>{user.rating}</Text>
              <Ionicons name="star" size={16} color="#FFD700" />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color="#007AFF" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.resetPasswordButton}
          onPress={handleResetPassword}
        >
          <FontAwesome name="lock" size={22} color="#007AFF" />
          <Text style={styles.resetPasswordText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            ref={cameraRef}
            facing={cameraFacing}
            ratio="16:9"
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: "#007AFF" }]}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: "#34C759" }]}
              onPress={() =>
                setCameraFacing(cameraFacing === "front" ? "back" : "front")
              }
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Logged out successfully!
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContainer: { paddingVertical: 24 },
  profileSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  profileImageContainer: { position: "relative", marginBottom: 16 },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 4 },
  userEmail: { fontSize: 15, color: "#666" },
  userPhone: { fontSize: 15, color: "#666", marginBottom: 12 },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9F3FF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  editProfileText: {
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "#E5E5E7" },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#007AFF" },
  statLabel: { fontSize: 12, color: "#666" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E9F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  menuSubtitle: { fontSize: 13, color: "#666" },
  resetPasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginBottom: 12,
  },
  resetPasswordText: {
    marginLeft: 8,
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
    marginBottom: 12,
  },
  logoutText: {
    marginLeft: 8,
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 15,
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
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
    backgroundColor: "#007AFF",
  },
});
