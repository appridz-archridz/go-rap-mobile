import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { requestRideService } from "../../services/request-ride-service";

const ExploreRequestRide = () => {
  const [search, setSearch] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [payload, setPayload] = useState({ pageNumber: 0, pageSize: 15, search: "" });

  const handleSearch = (text) => {
    setSearch(text);
    setPayload({ pageNumber: 0, pageSize: 15, search: text });
    setRides([]);
    setHasMore(true);
  };

  const handleWhatsApp = (phoneNumber, userName, startLocation, endLocation) => {
    const message = `Hi ${userName}, I'm interested in your ride from ${startLocation} to ${endLocation}.`;
    const url = `whatsapp://send?phone=+91${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "WhatsApp is not installed on this device");
        }
      })
      .catch((err) => Alert.alert("Error", "Failed to open WhatsApp"));
  };

  const handlePhoneCall = (phoneNumber) => {
    const url = `tel:+91${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to make phone calls on this device");
        }
      })
      .catch((err) => Alert.alert("Error", "Failed to initiate call"));
  };

  const getRequestRide = async (isLoadMore = false) => {
    if (loading || (!isLoadMore && refreshing)) return;
    if (isLoadMore && !hasMore) return;

    isLoadMore ? setLoading(true) : setRefreshing(true);
    setError(null);

    try {
      const response = await requestRideService.getRequestRide(payload);
      const newRides = response.data || [];
      
      if (isLoadMore) {
        setRides(prev => [...prev, ...newRides]);
      } else {
        setRides(newRides);
      }
      
      setHasMore(newRides.length === payload.pageSize);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setError("Failed to load rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPayload(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
    }
  };

  const handleRefresh = () => {
    setPayload(prev => ({ ...prev, pageNumber: 0 }));
    setHasMore(true);
  };

  useEffect(() => {
    getRequestRide(payload.pageNumber > 0);
  }, [payload]);

  const handleNavigate = () => {
    router.push("/request-ride");
  };

  const formatLocation = (location) => {
    // Extract main location name before the first comma
    return location.split(',')[0].trim();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Rides</Text>
      </View>
      <Text style={styles.headerSubtitle}>Find a ride</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Search City, Area or Landmark"
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
          accessibilityLabel="Search rides"
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rides}
        keyExtractor={(item) => item.rideId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007bff"]} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>
              {search ? "No rides match your search." : "No rides available."}
            </Text>
          ) : null
        }
        ListFooterComponent={
          loading && rides.length > 0 ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loadingFooter} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <View style={styles.userNameContainer}>
              <FontAwesome name="user-circle" size={16} color="#007bff" />
              <Text style={styles.userName}>{item.userName}</Text>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.locationRow}>
                <View style={styles.dotGreen} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {formatLocation(item.startLocation)}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.locationRow}>
                <View style={styles.dotRed} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {formatLocation(item.endLocation)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <FontAwesome name="calendar" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{formatDate(item.rideDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="clock-o" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{formatTime(item.rideTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="road" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{item.distanceKm} km</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.infoChip}>
                <FontAwesome name="users" size={12} color="#1e40af" />
                <Text style={styles.infoText}>{item.numberOfPassengers} Passengers</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Fare</Text>
                <Text style={styles.priceText}>₹{item.offeredPrice}</Text>
              </View>
            </View>

            <View style={styles.contactButtonsContainer}>
              <TouchableOpacity
                style={[styles.contactButton, styles.whatsappButton]}
                onPress={() =>
                  handleWhatsApp(
                    item.phoneNumber,
                    item.userName,
                    formatLocation(item.startLocation),
                    formatLocation(item.endLocation)
                  )
                }
                accessibilityLabel="Contact via WhatsApp"
              >
                <FontAwesome name="whatsapp" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, styles.phoneButton]}
                onPress={() => handlePhoneCall(item.phoneNumber)}
                accessibilityLabel="Call rider"
              >
                <FontAwesome name="phone" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {refreshing && rides.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNavigate}
        accessibilityLabel="Request a ride"
      >
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { 
    padding: 20, 
    paddingTop: 10, 
    backgroundColor: "#fff", 
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1a1a1a", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 4, paddingHorizontal: 20, backgroundColor: "#fff", paddingBottom: 10 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputField: {
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: { padding: 16, paddingBottom: 100 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007bff",
  },
  routeContainer: { marginBottom: 16 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#10b981" },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#ef4444" },
  locationText: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginLeft: 12, flex: 1 },
  routeLine: { width: 2, height: 24, backgroundColor: "#d1d5db", marginLeft: 5, marginVertical: 4 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  detailsContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16, flexWrap: "wrap" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 14, color: "#4b5563", fontWeight: "500" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  infoText: { fontSize: 13, color: "#1e40af", fontWeight: "600" },
  priceContainer: { alignItems: "flex-end" },
  priceLabel: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
  priceText: { fontSize: 24, fontWeight: "bold", color: "#10b981" },
  contactButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  phoneButton: {
    backgroundColor: "#007bff",
  },
  contactButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ExploreRequestRide;