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
import { requestRideService } from "../services/request-ride-service";
import { theme } from "../constants/theme";

const MyRequestRides = () => {
  const selector = useSelector((state) => state.auth);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [payload, setPayload] = useState({
    pageNumber: 0,
    pageSize: 15,
    userId: selector.userId,
  });

  const getUserRides = useCallback(async (isLoadMore = false) => {
    if (loading || (!isLoadMore && refreshing)) return;
    if (isLoadMore && !hasMore) return;

    if (isLoadMore) setLoading(true);
    else setRefreshing(true);
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
    } catch (_fetchError) {
      setError("Failed to load your rides. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hasMore, loading, payload, refreshing]);

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
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            const responnse = await requestRideService.cancelRide(rideId);
            if (responnse.data.statusCode === "200 OK") {
              Alert.alert("Success", "Ride cancelled successfully");
            }
            handleRefresh();
          } catch (_cancelError) {
            Alert.alert("Error", "Failed to cancel ride. Please try again.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (selector.userId) {
      getUserRides(payload.pageNumber > 0);
    }
  }, [getUserRides, payload, selector.userId]);

  const formatLocation = (location) => location.split(",")[0].trim();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => timeString.substring(0, 5);

  const getStatusTokens = (status) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":
      case "active":
        return { bg: "#E8FBF5", text: theme.colors.accent };
      case "cancelled":
        return { bg: "#FFF1F1", text: theme.colors.error };
      case "pending":
        return { bg: "#FFF7DA", text: "#B98100" };
      default:
        return { bg: theme.colors.skyBlue, text: theme.colors.primary };
    }
  };

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filteredRides = useMemo(() => {
    if (activeFilter === "all") return rides;
    return rides.filter((ride) => {
      const status = (ride.rideStatus || ride.status || "").toLowerCase();
      if (activeFilter === "confirmed") return status === "confirmed" || status === "active";
      return status === activeFilter;
    });
  }, [activeFilter, rides]);

  const renderRide = ({ item }) => {
    const status = item.rideStatus || item.status || "Pending";
    const statusTokens = getStatusTokens(status);

    return (
      <View style={styles.rideCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusTokens.bg }]}>
            <Text style={[styles.statusText, { color: statusTokens.text }]}>
              {status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.priceText}>Rs {item.offeredPrice}</Text>
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
                {formatLocation(item.startLocation)}
              </Text>
            </View>
            <View style={styles.routeGap} />
            <View>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {formatLocation(item.endLocation)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.infoChip}>
            <FontAwesome name="calendar" size={12} color={theme.colors.primary} />
            <Text style={styles.infoChipText}>{formatDate(item.rideDate)}</Text>
          </View>
          <View style={styles.infoChip}>
            <FontAwesome name="clock-o" size={12} color={theme.colors.primary} />
            <Text style={styles.infoChipText}>{formatTime(item.rideTime)}</Text>
          </View>
          <View style={styles.infoChip}>
            <FontAwesome name="users" size={12} color={theme.colors.primary} />
            <Text style={styles.infoChipText}>{item.numberOfPassengers} seats</Text>
          </View>
        </View>

        {(!item.rideStatus || item.rideStatus?.toLowerCase() !== "cancelled") ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(item.rideId)}
              activeOpacity={0.85}
            >
              <FontAwesome name="edit" size={15} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(item.rideId)}
              activeOpacity={0.85}
            >
              <FontAwesome name="times-circle" size={15} color={theme.colors.error} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>My activity</Text>
        <Text style={styles.title}>Requested rides</Text>
        <Text style={styles.subtitle}>Track, edit, or cancel the ride requests you have posted.</Text>
      </View>

      <ScrollTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} tabs={filterTabs} />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} activeOpacity={0.85}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.rideId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={renderRide}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="inbox" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No rides found</Text>
              <Text style={styles.emptyText}>
                Your requested rides will appear here. Pull down to refresh when needed.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && rides.length > 0 ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.footerLoader} />
          ) : null
        }
      />

      {refreshing && rides.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const ScrollTabs = ({ activeFilter, setActiveFilter, tabs }) => (
  <View style={styles.tabsWrap}>
    {tabs.map((tab) => {
      const active = activeFilter === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabChip, active ? styles.tabChipActive : null]}
          onPress={() => setActiveFilter(tab.key)}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabChipText, active ? styles.tabChipTextActive : null]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
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
  title: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xxxl,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  tabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  tabChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  tabChipTextActive: {
    color: theme.colors.white,
  },
  errorBanner: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "#FFF3F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    flex: 1,
    marginRight: theme.spacing.md,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
  },
  retryText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  rideCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  priceText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
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
  routeDotStart: { backgroundColor: theme.colors.accent },
  routeDotEnd: { backgroundColor: theme.colors.primary },
  routeLine: {
    flex: 1,
    width: 2,
    minHeight: 24,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  routeTextColumn: { flex: 1 },
  routeLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeGap: { height: theme.spacing.md },
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
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
  },
  editButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  cancelButton: {
    borderColor: "#F8CACA",
    backgroundColor: "#FFF6F6",
  },
  editButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  cancelButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
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
  emptyTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
  },
  emptyText: {
    marginTop: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
  footerLoader: { paddingVertical: theme.spacing.xl },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
});

export default MyRequestRides;
