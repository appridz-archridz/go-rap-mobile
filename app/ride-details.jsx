import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
import { theme, typography } from "../constants/theme";
import { getRideById } from "../services/ride-service";

export default function RideDetailsScreen() {
  const params = useLocalSearchParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rideId = params.id;

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        const response = await getRideById(rideId);
        setRideDetails(response.data.data);
      } catch (_error) {
        Alert.alert("Error", "Failed to fetch ride details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (rideId) fetchRideDetails();
  }, [rideId]);

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
  }, [rideDetails, fadeAnim, slideAnim]);

  const handleCall = () => {
    if (rideDetails?.phoneNumber) Linking.openURL(`tel:${rideDetails.phoneNumber}`);
  };

  const handleMessage = () => {
    if (rideDetails?.phoneNumber) Linking.openURL(`sms:${rideDetails.phoneNumber}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
        <Text style={styles.errorText}>Ride not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.heroCard}>
          <View style={styles.driverRow}>
            {rideDetails.profilePic ? (
              <Image source={{ uri: rideDetails.profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user" size={28} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>{rideDetails.userName}</Text>
              <Text style={styles.driverRole}>Driver · Rating coming soon</Text>
              <Text style={styles.vehicleInfo}>{rideDetails.vehicleType || "Vehicle details available on contact"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Trip Overview</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{rideDetails.startPoint}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{rideDetails.destinationPoint}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{rideDetails.rideDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{rideDetails.rideTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{rideDetails.availableSeats || "Seats unavailable"} seats available</Text>
          </View>
          {rideDetails.distanceKm ? (
            <View style={styles.infoRow}>
              <Ionicons name="map-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoText}>{rideDetails.distanceKm} km away</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Driver</Text>
          <Text style={styles.contactValue}>{rideDetails.phoneNumber}</Text>
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.primaryContact} onPress={handleCall} activeOpacity={0.85}>
              <Ionicons name="call-outline" size={16} color={theme.colors.white} />
              <Text style={styles.primaryContactText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryContact} onPress={handleMessage} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.secondaryContactText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.stickyButton} onPress={handleCall} activeOpacity={0.85}>
        <Text style={styles.stickyButtonText}>Request This Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: "#FFF3E8",
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  driverMeta: {
    flex: 1,
  },
  driverName: {
    ...typography.headingMd,
    marginBottom: theme.spacing.xs,
  },
  driverRole: {
    ...typography.bodySm,
    marginBottom: theme.spacing.xs,
  },
  vehicleInfo: {
    ...typography.bodySm,
    color: theme.colors.textPrimary,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  contactCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  contactValue: {
    ...typography.bodyMd,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  contactActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  primaryContact: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    ...theme.shadows.button,
  },
  primaryContactText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  secondaryContact: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  secondaryContactText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  stickyButton: {
    minHeight: 52,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  stickyButtonText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...typography.bodyMd,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    ...typography.headingMd,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  goBackButton: {
    minHeight: 48,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
});
