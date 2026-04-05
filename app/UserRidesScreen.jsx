import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { theme } from "../constants/theme";
import { getRidesByUser } from "../services/ride-service";

const UserRidesScreen = () => {
  const userId = useSelector((state) => state.auth.userId);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRidesByUser(userId);
      setRides(response.data.data || []);
    } catch (_err) {
      setError("Failed to load your rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const handleEditRide = (rideId) => {
    router.push({
      pathname: "/create-ride",
      params: { rideId },
    });
  };

  const handleDeleteRide = (rideId) => {
    Alert.alert("Delete Ride", "Are you sure you want to delete this ride?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            Alert.alert("Success", "Ride deleted successfully");
            handleRefresh();
          } catch (_error) {
            Alert.alert("Error", "Failed to delete ride. Please try again.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const createRide = () => {
    router.push("/create-ride");
  };

  const formatLocation = (location) => location.split(",")[0].trim();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusTokens = useMemo(
    () => (status) => {
      switch ((status || "").toLowerCase()) {
        case "active":
          return { bg: "#E8FBF5", text: theme.colors.accent };
        case "completed":
          return { bg: "#F1F3F6", text: theme.colors.textSecondary };
        case "cancelled":
          return { bg: "#FFF1F1", text: theme.colors.error };
        default:
          return { bg: theme.colors.skyBlue, text: theme.colors.primary };
      }
    },
    []
  );

  const renderRide = ({ item }) => {
    const statusTokens = getStatusTokens(item.status);

    return (
      <View style={styles.rideCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusTokens.bg }]}>
            <Text style={[styles.statusText, { color: statusTokens.text }]}>
              {(item.status || "ACTIVE").toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.inlineCreateButton}
            onPress={() => handleEditRide(item.id)}
            activeOpacity={0.85}
          >
            <FontAwesome name="edit" size={14} color={theme.colors.primary} />
            <Text style={styles.inlineCreateText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeBlock}>
          <View style={styles.routeMarkerColumn}>
            <View style={[styles.routeDot, styles.routeDotStart]} />
            <View style={styles.routeLine} />
            <View style={[styles.routeDot, styles.routeDotEnd]} />
          </View>
          <View style={styles.routeTextColumn}>
            <View>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {formatLocation(item.source)}
              </Text>
            </View>
            <View style={styles.routeGap} />
            <View>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {formatLocation(item.destination)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.infoChip}>
            <FontAwesome name="calendar" size={12} color={theme.colors.primary} />
            <Text style={styles.infoChipText}>{formatDate(item.createdDate)}</Text>
          </View>
          <View style={styles.infoChip}>
            <FontAwesome name="clock-o" size={12} color={theme.colors.primary} />
            <Text style={styles.infoChipText}>{item.rideTime}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditRide(item.id)}
            activeOpacity={0.85}
          >
            <FontAwesome name="edit" size={15} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>Edit ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteRide(item.id)}
            activeOpacity={0.85}
          >
            <FontAwesome name="trash" size={15} color={theme.colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>My activity</Text>
        <Text style={styles.headerTitle}>My rides</Text>
        <Text style={styles.headerSubtitle}>Manage the rides you created as a driver.</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="car" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>No rides created yet</Text>
              <Text style={styles.emptySubtext}>Start by publishing your first ride.</Text>
            </View>
          ) : null
        }
        renderItem={renderRide}
      />

      <TouchableOpacity style={styles.fab} onPress={createRide} activeOpacity={0.85}>
        <FontAwesome name="plus" size={22} color={theme.colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  eyebrow: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xxxl,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: "#FFF3F2",
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    flex: 1,
  },
  retryButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginLeft: theme.spacing.md,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
  },
  listContainer: {
    padding: theme.spacing.xl,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E8",
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
  },
  rideCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xs,
    letterSpacing: 0.5,
  },
  inlineCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  inlineCreateText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  routeBlock: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
  },
  routeMarkerColumn: {
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
  },
  routeDotStart: {
    backgroundColor: theme.colors.accent,
  },
  routeDotEnd: {
    backgroundColor: theme.colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  routeTextColumn: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeGap: {
    height: theme.spacing.md,
  },
  locationText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.skyBlue,
  },
  infoChipText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    minHeight: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: "#FFF6F6",
    borderColor: "#F8CACA",
  },
  editButtonText: {
    color: theme.colors.primary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 58,
    height: 58,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
});

export default UserRidesScreen;
