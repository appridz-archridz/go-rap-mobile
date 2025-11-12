import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRideById } from "../services/ride-service";

export default function RideDetailsScreen() {
  const params = useLocalSearchParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Extract id once to prevent re-renders
  const rideId = params.id;

  useEffect(() => {
    console.log("inside results page:", { id: rideId });
    console.log("params : ", { id: rideId });

    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        const response = await getRideById(rideId);
        setRideDetails(response.data.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch ride details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]); // Only depend on rideId, not the entire params object

  useEffect(() => {
    if (rideDetails) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [rideDetails, fadeAnim, slideAnim]); // Add all dependencies

  const handleCall = () => {
    if (rideDetails?.phoneNumber) {
      Linking.openURL(`tel:${rideDetails.phoneNumber}`);
    }
  };

  const handleMessage = () => {
    if (rideDetails?.phoneNumber) {
      Linking.openURL(`sms:${rideDetails.phoneNumber}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0051a8" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>Ride not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Profile Section */}
          <View style={styles.card}>
            <View style={styles.profileRow}>
              {rideDetails.profilePic ? (
                <Image source={{ uri: rideDetails.profilePic }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <FontAwesome name="user" size={36} color="#0051a8" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{rideDetails.userName}</Text>
                <Text style={styles.subText}>Driver</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCall}>
                <FontAwesome name="phone" size={16} color="#fff" />
                <Text style={styles.primaryText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleMessage}>
                <FontAwesome name="comment" size={16} color="#0051a8" />
                <Text style={styles.secondaryText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Info */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Route</Text>
            <View style={styles.routeItem}>
              <FontAwesome name="circle" size={10} color="#0051a8" />
              <Text style={styles.routeText}>{rideDetails.startPoint}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <FontAwesome name="map-marker" size={14} color="#ff6b6b" />
              <Text style={styles.routeText}>{rideDetails.destinationPoint}</Text>
            </View>
            {rideDetails.distanceKm && (
              <Text style={styles.mutedText}>Distance: {rideDetails.distanceKm} km</Text>
            )}
          </View>

          {/* Schedule */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Schedule</Text>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.mutedText}>Date</Text>
                <Text style={styles.valueText}>{rideDetails.rideDate}</Text>
              </View>
              <View>
                <Text style={styles.mutedText}>Time</Text>
                <Text style={styles.valueText}>{rideDetails.rideTime}</Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Contact</Text>
            <View style={styles.row}>
              <FontAwesome name="phone" size={16} color="#0051a8" />
              <TouchableOpacity onPress={handleCall}>
                <Text style={styles.valueText}>{rideDetails.phoneNumber}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    gap: 16,
  },
  content: { gap: 16 },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#0051a8",
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e8f1ff",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#002d5c",
  },
  subText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0051a8",
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0051a8",
    // paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f5f9ff",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryText: {
    color: "#0051a8",
    fontSize: 15,
    fontWeight: "600",
  },

  // Route
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 10,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  routeLine: {
    height: 20,
    width: 2,
    backgroundColor: "#e0e0e0",
    marginLeft: 6,
  },
  routeText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  mutedText: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  // Schedule
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  valueText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#002d5c",
  },

  // Contact
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
});
