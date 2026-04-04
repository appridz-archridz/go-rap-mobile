import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { theme, typography } from "../constants/theme";
import { getRides } from "../services/ride-service";

export default function RideResultsScreen() {
  const params = useLocalSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Today");
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchRides = useCallback(async () => {
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
      setRides(ridesData?.data?.data || []);
    } catch (_error) {
      Alert.alert("Error", "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  }, [params.destinationLatitude, params.destinationLongitude, params.sourceLatitude, params.sourceLongitude]);

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

    fetchRides();
  }, [fadeAnim, fetchRides, slideAnim]);

  const filterChips = ["Today", "Lowest Price", "Seats"];

  const RideCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay: index * 90,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, [cardAnim, index]);

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
                  outputRange: [36, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatarCircle}>
            <FontAwesome name="car" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.cardTopContent}>
            <Text style={styles.routeTitle}>
              {item?.startPoint?.split(",")[0]} to {item?.destinationPoint?.split(",")[0]}
            </Text>
            <Text style={styles.routeSubtitle}>Shared ride with verified trip details</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{item.availableSeats} seats</Text>
          </View>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeDotColumn}>
            <View style={styles.sourceDot} />
            <View style={styles.routeLine} />
            <View style={styles.destinationDot} />
          </View>
          <View style={styles.routeTextColumn}>
            <Text style={styles.routePoint}>{item?.startPoint}</Text>
            <Text style={styles.routePoint}>{item?.destinationPoint}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaText}>{item.rideDate}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaText}>{item.rideTime}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/ride-details?id=${item.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <Text style={styles.headerSubtitle}>
          {String(params.fromDescription || "").split(",")[0]} to {String(params.toDescription || "").split(",")[0]}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {filterChips.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[styles.filterChip, activeFilter === chip ? styles.filterChipActive : null]}
            onPress={() => setActiveFilter(chip)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, activeFilter === chip ? styles.filterChipTextActive : null]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding rides for you...</Text>
        </View>
      ) : rides.length > 0 ? (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <RideCard item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="search-outline" size={38} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No rides found</Text>
          <Text style={styles.emptySubtitle}>Try a different route, date, or search again a little later.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.replace("/search-ride")} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Search Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...typography.headingLg,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMd,
  },
  filterRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.textPrimary,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
  },
  filterChipTextActive: {
    color: theme.colors.white,
  },
  listContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  rideCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  cardTopContent: {
    flex: 1,
  },
  routeTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  routeSubtitle: {
    ...typography.bodySm,
  },
  priceBadge: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  priceBadgeText: {
    color: theme.colors.textPrimary,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
  },
  routeSection: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  routeDotColumn: {
    alignItems: "center",
    paddingTop: 6,
  },
  sourceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  routeTextColumn: {
    flex: 1,
    gap: theme.spacing.md,
  },
  routePoint: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  metaText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  viewButton: {
    minHeight: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    ...theme.shadows.button,
  },
  viewButtonText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    ...typography.bodyMd,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...typography.headingMd,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    minHeight: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
  },
});
