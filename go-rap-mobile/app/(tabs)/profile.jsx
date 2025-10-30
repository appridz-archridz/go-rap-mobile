import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AuthService } from "../../components/services/authService";
import { uploadMedia } from "../../components/services/cloudinary";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { logout } from "../../redux/authSlice";
import { HelperService } from "../../services/helper-service";
import { inputField } from './../../global-css';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "R-A-P",
    email: "ridz@gmail.com",
    phone: "+91 9XXXXXXXX",
    ridesCreated: 15,
    ridesJoined: 8,
    rating: 4.8,
  });
  const [cameraFacing, setCameraFacing] = useState('front');
  const [isImageVerified, setIsImageVerified] = useState(false);
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const cameraRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const selector = useSelector((state) => state.auth);

  const handleEditProfile = () => {
    setIsEditable(true);
  };

  const handleResetPassword = () => {
    router.push("/reset-password");
  }

  const handleLogout = () => {
    dispatch(logout());
    AsyncStorage.removeItem("token");
    HelperService.removeToken();
    setIsSnackbarVisible(true);
    snackbar.show("success", "Logged out successfully");
    console.log('Logout succesfull!!!');

    router.replace("/login");
  };

  const updateProfile = async () => {
    try {
      const payload = {
        id: selector.userId,
        ...(user.name && { userName: user.name }),
        ...(user.email && { email: user.email }),
        ...(user.phone && { phoneNumber: user.phone }),
        ...(capturedImage && { profilePic: capturedImage })
      }
      console.log('user name', payload);
      const response = await AuthService.updateProfile(payload);
    } catch (err) {
      console.log('Error while loading');
    }
  }

  useEffect(() => {
    // AuthService.getProfileInfo().then((response) => {
    //   setUser(response.data.data);
    // }).catch((error) => {
    //   console.error(error);
    // });
  }, []);

  const openCamera = async () => {
    console.log("Begin profile.jsx -> openCamera()");
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setShowCamera(true);
    } else {
      Alert.alert("Permission Denied", "Camera permission is required");
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  const retakePicture = () => {
    setShowCamera(true);
    isImageVerified(false);
    setCapturedImage(null);
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        console.log("Camera reference not found.");
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setCapturedImage(photo.uri);
      setShowCamera(false);
      setIsImageVerified(false);

      const file = {
        uri: photo.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const response = await uploadMedia(file.uri, file.type);

      if (response?.success || response?.url) {
        setCapturedImage(response.url);
        setIsImageVerified(true);
      } else {
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error in takePicture():", error);
      alert("An error occurred while taking or uploading the picture.");
    } finally {
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "My Rides",
      subtitle: "View your created and joined rides",
      icon: "car-outline",
      onPress: () => router.push("/my-ride"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {(!showCamera && <View style={styles.profileSection}>

          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  capturedImage ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
              }}
              style={styles.profileImage}
            />
            {
              isEditable &&
              <TouchableOpacity style={styles.editImageButton} onPress={openCamera}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            }
          </View>

          {
            isEditable && (
              <TextInput
                style={inputField}
                placeholder="Full Name"
                placeholderTextColor="gray"
                autoCapitalize="words"
                value={user.name}
                onChangeText={(text) => setUser({ ...user, name: text })}
              />
            )
          }

          {
            !isEditable && (
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
              </View>
            )
          }

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            {
              isEditable &&
              <Text style={styles.editProfileText} onPress={updateProfile} >Save Changes</Text>
            }
            {
              !isEditable &&
              <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <Ionicons name="create-outline" size={20} color="#007AFF" />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </View>
            }
          </TouchableOpacity>
        </View>)}

        {/* Stats Section */}
        {(!showCamera && <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.ridesCreated || 0}</Text>
            <Text style={styles.statLabel}>Rides Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.ridesJoined || 0}</Text>
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
        </View>)}

        {/* Menu Items */}
        {(!showCamera && <View style={styles.menuContainer}>
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
        </View>)}

        {showCamera && (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={cameraFacing}
              ref={cameraRef}
              ratio="16:9"
              flashMode="on"
              autoFocus="on"
              whiteBalance="auto"
            />
            <View style={styles.cameraControls}>
              <Button
                title="Close"
                onPress={closeCamera}
                color="#FF3B30"
              >
                <Ionicons name="close" size={30} color="white" />
              </Button>

              <Button
                title="Capture"
                onPress={takePicture}
                color="#007AFF"

              >
                <Ionicons name="camera" size={30} color="white" />
              </Button>

              <Button
                title="Flip"
                onPress={
                  () =>
                    setCameraFacing(
                      cameraFacing === "front" ? "back" : "front"
                    )
                }
                color="#34C759"
              >
                <Ionicons name="refresh" size={30} color="white" />
              </Button>
            </View>
          </View>
        )}

        {/* reset password button */}
        {(!showCamera && <TouchableOpacity style={styles.resetPasswordButton} onPress={handleResetPassword}>
          <FontAwesome name="lock" size={24} color="#007AFF" />
          <Text style={styles.resetPasswordText}>Reset Password</Text>
        </TouchableOpacity>)}

        {/* Logout Button */}
        {(!showCamera && <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>)}

        {(!showCamera && <Text style={styles.versionText}>Version 1.0.0</Text>)}

        {(!showCamera && <Snackbar
          visible={isSnackbarVisible}
          onDismiss={() => setIsSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContainer: { flex: 1 },
  profileSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  profileImageContainer: { position: "relative", marginBottom: 16 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: { fontSize: 16, color: "#666", marginBottom: 16 },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editProfileText: { marginLeft: 8, color: "#007AFF", fontWeight: "500", fontSize: 16 },
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
  statDivider: { width: 1, backgroundColor: "#E5E5E7", marginVertical: 8 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#007AFF", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#666", textAlign: "center" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  menuSubtitle: { fontSize: 13, color: "#666" },
  resetPasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  resetPasswordText: {
    marginLeft: 8,
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutText: { marginLeft: 8, color: "#FF3B30", fontWeight: "600", fontSize: 16 },
  versionText: { textAlign: "center", color: "#999", fontSize: 12, marginBottom: 20 },

  cameraContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  camera: {
    width: '100%',
    aspectRatio: 9 / 18,
    borderRadius: 10,
    overflow: 'hidden',
  },

  cameraControls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
  },

  controlButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
