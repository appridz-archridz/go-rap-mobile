import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { deleteVehicle, getUserVehicles } from "../services/vehicle-service";
import { theme } from "../constants/theme";

export default function ManageVehiclesScreen() {
  const selector = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const animateFAB = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  const fetchVehicles = useCallback(async () => {
    try {
      const { data } = await getUserVehicles(selector.userId);
      const list = data?.data || [];
      setVehicles(list);
    } catch (_error) {
    } finally {
      setLoading(false);
      fadeIn();
      animateFAB();
    }
  }, [animateFAB, fadeIn, selector.userId]);

  const handleDeleteVehicle = (vehicleId) => {
    Alert.alert("Delete Vehicle", "Are you sure you want to delete this vehicle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVehicle(vehicleId);
            setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
          } catch (_error) {
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [fetchVehicles])
  );

  const getVehicleIcon = (type) => {
    const icons = {
      Car: "car-sport",
      Bike: "bicycle",
      Motorcycle: "bicycle",
      Truck: "bus",
      Van: "car",
      Scooter: "bicycle",
    };
    return icons[type] || "car";
  };

  const renderCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.vehicleMeta}>
            <View style={styles.iconWrap}>
              <Ionicons name={getVehicleIcon(item.vehicleType)} size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.vehicleType}>{item.vehicleType}</Text>
              <Text style={styles.vehicleSubtitle}>Vehicle #{index + 1}</Text>
            </View>
          </View>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{item.vehicleNumber}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>DL Number</Text>
            <Text style={styles.infoValue}>{item.dlNumber}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>DL Expiry</Text>
            <Text style={styles.infoValue}>{item.dlExpiry}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusChip}>
            <Ionicons name="document-text-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.statusChipText}>Docs added</Text>
          </View>
          <View style={styles.statusChip}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.accent} />
            <Text style={styles.statusChipText}>Ready to use</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "vehicle-information",
                params: { vehicleId: item.id },
              })
            }
            activeOpacity={0.85}
            style={[styles.actionButton, styles.editButton]}
          >
            <Ionicons name="pencil" size={16} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>View / Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteVehicle(item.id)}
            activeOpacity={0.85}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash" size={16} color={theme.colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Loading vehicles...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>My garage</Text>
        <Text style={styles.title}>Your vehicles</Text>
        <Text style={styles.subtitle}>
          {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} registered
        </Text>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="car-sport-outline" size={34} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No vehicles yet</Text>
          <Text style={styles.emptyText}>
            Add your first vehicle to start creating rides and managing documents.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Animated.View
        style={[
          styles.fabWrap,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.push("/vehicle-information")} activeOpacity={0.85} style={styles.fab}>
          <Ionicons name="add" size={30} color={theme.colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  loaderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loaderText: {
    marginTop: theme.spacing.md,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
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
  listContent: {
    padding: theme.spacing.xl,
    paddingBottom: 110,
  },
  card: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardAccent: {
    width: 6,
    backgroundColor: theme.colors.primary,
  },
  cardBody: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  vehicleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleType: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  vehicleSubtitle: {
    marginTop: 2,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  numberBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary,
  },
  numberBadgeText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoChip: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  infoLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.skyBlue,
  },
  statusChipText: {
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
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  editButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  deleteButton: {
    borderColor: "#F8CACA",
    backgroundColor: "#FFF6F6",
  },
  editButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  deleteButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 76,
    height: 76,
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
  fabWrap: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },
});
