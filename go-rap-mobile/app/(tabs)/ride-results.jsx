import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRides } from "../../services/ride-service";
import { olaService } from "../../services/thirdPartyApis";

export default function RideResultsScreen() {
  const params = useLocalSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
    const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    fetchRidesAndRoutes();
  }, []);

  const fetchRidesAndRoutes = async () => {
    setLoading(true);
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const searchDTO = {
        sourceLatitude: parseFloat(params.sourceLatitude),
        sourceLongitude: parseFloat(params.sourceLongitude),
        destinationLatitude: parseFloat(params.destinationLatitude),
        destinationLongitude: parseFloat(params.destinationLongitude),
        localDate: currentDate,
      };

      const ridesData = await getRides(searchDTO);
      setRides(ridesData.data.data);

      const origin = {
        lat: parseFloat(params.sourceLatitude),
        lng: parseFloat(params.sourceLongitude),
      };
      const destination = {
        lat: parseFloat(params.destinationLatitude),
        lng: parseFloat(params.destinationLongitude),
      };
      const routesData = await olaService.getRoute(origin, destination);
      setRoutes(routesData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch rides or route data");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/search-ride');
    });
  };

  const RideCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.rideCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.rideHeader}>
          <FontAwesome name="car" size={20} color="#0051a8" />
          <Text style={styles.rideTitle}>
            {item.startPoint} → {item.endPoint}
          </Text>
        </View>
        <View style={styles.rideDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="user" size={14} color="#555" />
            <Text style={styles.rideSubtitle}>{item.driverName}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="car" size={14} color="#555" />
            <Text style={styles.rideSubtitle}>{item.vehicleName}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="users" size={14} color="#555" />
            <Text style={styles.rideSubtitle}>{item.availableSeats} seats available</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="calendar" size={14} color="#555" />
            <Text style={styles.rideSubtitle}>
              {item.rideDate} at {item.rideTime}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/create-ride?id=${item.id}`)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
          <FontAwesome name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderRideCard = ({ item, index }) => (
    <RideCard item={item} index={index} />
  );

  const renderRouteCard = ({ item, index }) => (
    <View style={styles.routeCard}>
      <Text style={styles.routeTitle}>Route {index + 1}</Text>
      <View style={styles.routeInfo}>
        <View style={styles.routeDetail}>
          <FontAwesome name="road" size={14} color="#0051a8" />
          <Text style={styles.routeSubtitle}>
            {(item.legs?.[0]?.distance / 1000).toFixed(1)} km
          </Text>
        </View>
        <View style={styles.routeDetail}>
          <FontAwesome name="clock-o" size={14} color="#0051a8" />
          <Text style={styles.routeSubtitle}>
            {(item.legs?.[0]?.duration / 60).toFixed(0)} min
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#003366" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Available Rides</Text>
          <Text style={styles.headerSubtitle}>
            {params.fromDescription} → {params.toDescription}
          </Text>
        </View>
      </View>

      {/* Rides Section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0051a8" />
          <Text style={styles.loadingText}>Finding rides for you...</Text>
        </View>
      ) : (
        <View style={styles.ridesSection}>
          {rides.length > 0 ? (
            <>
              <Text style={styles.sectionHeader}>
                {rides.length} {rides.length === 1 ? "Ride" : "Rides"} Found
              </Text>
              <FlatList
                data={rides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => <RideCard item={item} index={index} />}
                contentContainerStyle={styles.ridesList}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.noRidesContainer}>
              <FontAwesome name="frown-o" size={60} color="#ccc" />
              <Text style={styles.noRideText}>No rides found for this route</Text>
              <Text style={styles.noRideSubtext}>
                Try searching for a different date or location
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
                <Text style={styles.retryButtonText}>Search Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  routesSection: {
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  routesList: {
    paddingHorizontal: 18,
  },
  routeCard: {
    backgroundColor: "#f0f7ff",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d0e4ff",
    width: 160,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0051a8",
    marginBottom: 8,
  },
  routeInfo: {
    gap: 6,
  },
  routeDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeSubtitle: {
    fontSize: 13,
    color: "#444",
  },
  ridesSection: {
    flex: 1,
    paddingTop: 16,
  },
  ridesList: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rideTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0051a8",
  },
  rideDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rideSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  viewButton: {
    backgroundColor: "#0051a8",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  noRidesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  noRideText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  noRideSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0051a8",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});