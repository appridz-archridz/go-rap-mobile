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
import { getRidesByUser } from "../services/ride-service";

const UserRidesScreen = () => {
  const userId = useSelector((state) => state.auth.userId);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRidesByUser(userId);
      setRides(response.data.data || []);
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError("Failed to load your rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEditRide = (rideId) => {
    router.push({
      pathname: "/create-ride",
      params: { rideId: rideId },
    });
  };

  const handleDeleteRide = (rideId) => {
    Alert.alert("Delete Ride", "Are you sure you want to delete this ride?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            // Call your delete service here
            // await deleteRideService(rideId);
            Alert.alert("Success", "Ride deleted successfully");
            handleRefresh();
          } catch (error) {
            Alert.alert("Error", "Failed to delete ride. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  useEffect(() => {
    fetchRides();
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const createRide = () => {
    router.push("/create-ride");
  };

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981";
      case "completed":
        return "#6b7280";
      case "cancelled":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#d1fae5";
      case "completed":
        return "#e5e7eb";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#dbeafe";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
        <Text style={styles.headerSubtitle}>Manage your created rides</Text>
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007bff"]}
          />
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="car" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No rides created yet</Text>
              <Text style={styles.emptySubtext}>
                Start by adding a new ride
              </Text>
            </View>
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
                  {item.status?.toUpperCase() || "ACTIVE"}
                </Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.locationRow}>
                <View style={styles.dotGreen} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {formatLocation(item.source)}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.locationRow}>
                <View style={styles.dotRed} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {formatLocation(item.destination)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <FontAwesome name="calendar" size={14} color="#6b7280" />
                <Text style={styles.detailText}>
                  {formatDate(item.createdDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="clock-o" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{item.rideTime}</Text>
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditRide(item.id)}
                accessibilityLabel="Edit ride"
              >
                <FontAwesome name="edit" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteRide(item.id)}
                accessibilityLabel="Delete ride"
              >
                <FontAwesome name="trash" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={createRide}>
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
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
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
  listContainer: { padding: 16, paddingBottom: 100 },
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
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
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default UserRidesScreen;