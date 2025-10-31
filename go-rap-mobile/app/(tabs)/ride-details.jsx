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
import { getRideById } from "../../services/ride-service";

export default function RideDetailsScreen() {
  const params = useLocalSearchParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchRideDetails();
  }, []);

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
  }, [rideDetails]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await getRideById(params.id);
      setRideDetails(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch ride details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
          <FontAwesome name="arrow-left" size={20} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Driver Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {rideDetails.profilePic ? (
                  <Image
                    source={{ uri: rideDetails.profilePic }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <FontAwesome name="user" size={40} color="#0051a8" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.driverName}>{rideDetails.userName}</Text>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={14} color="#ffc107" />
                  <FontAwesome name="star" size={14} color="#ffc107" />
                  <FontAwesome name="star" size={14} color="#ffc107" />
                  <FontAwesome name="star" size={14} color="#ffc107" />
                  <FontAwesome name="star-half-o" size={14} color="#ffc107" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <FontAwesome name="phone" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                <FontAwesome name="comment" size={18} color="#0051a8" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="map-marker" size={20} color="#0051a8" />
              <Text style={styles.sectionTitle}>Route Information</Text>
            </View>
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <View style={styles.pointDot} />
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>From</Text>
                  <Text style={styles.pointText}>{rideDetails.startPoint}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.pointDot, styles.destinationDot]} />
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>To</Text>
                  <Text style={styles.pointText}>{rideDetails.destinationPoint}</Text>
                </View>
              </View>
            </View>
            {rideDetails.distanceKm && (
              <View style={styles.distanceCard}>
                <FontAwesome name="road" size={16} color="#0051a8" />
                <Text style={styles.distanceText}>
                  Total Distance: {rideDetails.distanceKm} km
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
              <Text style={styles.sectionTitle}>Schedule</Text>
            </View>
            <View style={styles.scheduleGrid}>
              <View style={styles.scheduleCard}>
                <FontAwesome name="calendar-o" size={24} color="#0051a8" />
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>{rideDetails.rideDate}</Text>
              </View>
              <View style={styles.scheduleCard}>
                <FontAwesome name="clock-o" size={24} color="#0051a8" />
                <Text style={styles.scheduleLabel}>Time</Text>
                <Text style={styles.scheduleValue}>{rideDetails.rideTime}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="phone" size={20} color="#0051a8" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            <View style={styles.contactCard}>
              <FontAwesome name="phone" size={18} color="#555" />
              <Text style={styles.contactText}>{rideDetails.phoneNumber}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.bookButton}>
              <FontAwesome name="check-circle" size={20} color="#fff" />
              <Text style={styles.bookButtonText}>Book This Ride</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <FontAwesome name="share-alt" size={18} color="#0051a8" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 20,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerBackButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  content: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#0051a8",
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e8f2ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0051a8",
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  driverName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003366",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0051a8",
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e8f2ff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0051a8",
  },
  messageButtonText: {
    color: "#0051a8",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
  routeContainer: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pointDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0051a8",
    marginTop: 2,
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: "#ff6b6b",
  },
  pointInfo: {
    flex: 1,
    gap: 4,
  },
  pointLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  pointText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: "#d0d0d0",
    marginLeft: 7,
    marginVertical: 4,
  },
  distanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0f7ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d0e4ff",
  },
  distanceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0051a8",
  },
  scheduleGrid: {
    flexDirection: "row",
    gap: 12,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: "#f0f7ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d0e4ff",
  },
  scheduleLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#003366",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0051a8",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#0051a8",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0051a8",
  },
  shareButtonText: {
    color: "#0051a8",
    fontSize: 17,
    fontWeight: "700",
  },
  backButton: {
    backgroundColor: "#0051a8",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});