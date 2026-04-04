import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const activityCards = [
  {
    id: "offered-rides",
    title: "Offered Rides",
    subtitle: "Review and manage rides you created as a driver.",
    icon: "car-sport-outline",
    accent: theme.colors.primary,
    background: theme.colors.surface,
    onPress: () => router.push("/UserRidesScreen"),
  },
  {
    id: "requested-rides",
    title: "Requested Rides",
    subtitle: "Track requests you posted as a passenger.",
    icon: "time-outline",
    accent: theme.colors.accent,
    background: theme.colors.skyBlue,
    onPress: () => router.push("/my-requested-ride"),
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>My Activity</Text>
          <Text style={styles.title}>Trips and requests</Text>
          <Text style={styles.subtitle}>
            Everything you posted personally lives here, separate from the public ride marketplace.
          </Text>
        </View>

        {activityCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: card.background }]}
            onPress={card.onPress}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.white }]}> 
              <Ionicons name={card.icon} size={22} color={card.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Use Find Ride, Offer Ride, and Ride Requests tabs for marketplace actions. Use My Activity for your own records.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
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
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: theme.spacing.xs,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    flex: 1,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
