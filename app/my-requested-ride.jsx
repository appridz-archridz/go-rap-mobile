import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { requestRideService } from "../services/request-ride-service";

const MyRequestRides = () => {
  const selector = useSelector((state) => state.auth);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [payload, setPayload] = useState({
    pageNumber: 0,
    pageSize: 15,
    userId: selector.userId,
  });

  const getUserRides = async (isLoadMore = false) => {
    if (loading || (!isLoadMore && refreshing)) return;
    if (isLoadMore && !hasMore) return;

    isLoadMore ? setLoading(true) : setRefreshing(true);
    setError(null);

    try {
      const response = await requestRideService.getUsersRides(payload);
      const newRides = response.data || [];

      if (isLoadMore) {
        setRides((prev) => [...prev, ...newRides]);
      } else {
        setRides(newRides);
      }

      setHasMore(newRides.length === payload.pageSize);
    } catch (error) {
      console.error("Error fetching user rides:", error);
      setError("Failed to load your rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPayload((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
    }
  };

  const handleRefresh = () => {
    setPayload((prev) => ({ ...prev, pageNumber: 0 }));
    setHasMore(true);
  };

  const handleEdit = (rideId) => {
   router.push(`/request-ride?id=${rideId}`);

  };

  const handleCancel = (rideId) => {
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
             const responnse=await requestRideService.cancelRide(rideId);
             if(responnse.data.statusCode==="200 OK"){
            Alert.alert("Success", "Ride cancelled successfully");
             }
         
            handleRefresh();
          } catch (error) {
            Alert.alert("Error", "Failed to cancel ride. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  useEffect(() => {
    if (selector.userId) {
      getUserRides(payload.pageNumber > 0);
    }
  }, [payload, selector.userId]);

  const formatLocation = (location) => {
    return location.split(",")[0].trim();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#6b7280";
      default:
        return "#3b82f6";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#d1fae5";
      case "cancelled":
        return "#fee2e2";
      case "completed":
        return "#e5e7eb";
      default:
        return "#dbeafe";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requested Rides</Text>
        <Text style={styles.headerSubtitle}>Manage your ride requests</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007bff"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="inbox" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No rides found</Text>
              <Text style={styles.emptySubtext}>
                Your requested rides will appear here
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && rides.length > 0 ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loadingFooter}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBgColor(item.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.rideStatus?.toUpperCase() || "ACTIVE"}
                </Text>
              </View>
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
                <Text style={styles.detailText}>
                  {formatDate(item.rideDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="clock-o" size={14} color="#6b7280" />
                <Text style={styles.detailText}>
                  {formatTime(item.rideTime)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="road" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{item.distanceKm} km</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.infoChip}>
                <FontAwesome name="users" size={12} color="#1e40af" />
                <Text style={styles.infoText}>
                  {item.numberOfPassengers} Passengers
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Fare</Text>
                <Text style={styles.priceText}>₹{item.offeredPrice}</Text>
              </View>
            </View>

            {(!item.rideStatus ||
              item.rideStatus?.toLowerCase() !== "cancelled") && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(item.rideId)}
                  accessibilityLabel="Edit ride"
                >
                  <FontAwesome name="edit" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancel(item.rideId)}
                  accessibilityLabel="Cancel ride"
                >
                  <FontAwesome name="times-circle" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {refreshing && rides.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#666" },
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
  listContainer: { padding: 16, paddingBottom: 32 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
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
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  routeContainer: { marginBottom: 16 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 12,
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#d1d5db",
    marginLeft: 5,
    marginVertical: 4,
  },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    flexWrap: "wrap",
  },
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
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
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
  editButton: {
    backgroundColor: "#007bff",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});

export default MyRequestRides;
