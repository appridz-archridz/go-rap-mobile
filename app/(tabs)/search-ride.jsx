import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme, typography } from "../../constants/theme";
import { olaService } from "../../services/thirdPartyApis";

export default function SearchRideScreen() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromDebounceRef = useRef(null);
  const toDebounceRef = useRef(null);

  const handleFromChange = (text) => {
    setFromQuery(text);
    setSelectedFrom(null);
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    fromDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setFromSuggestions(results);
          setShowFromSuggestions(true);
        } catch (_error) {}
      } else {
        setFromSuggestions([]);
        setShowFromSuggestions(false);
      }
    }, 300);
  };

  const handleToChange = (text) => {
    setToQuery(text);
    setSelectedTo(null);
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    toDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setToSuggestions(results);
          setShowToSuggestions(true);
        } catch (_error) {}
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
    }, 300);
  };

  const handleSearchRide = () => {
    if (!selectedFrom?.geometry?.location || !selectedTo?.geometry?.location) {
      return;
    }

    const searchData = {
      sourceLatitude: selectedFrom.geometry.location.lat.toString(),
      sourceLongitude: selectedFrom.geometry.location.lng.toString(),
      destinationLatitude: selectedTo.geometry.location.lat.toString(),
      destinationLongitude: selectedTo.geometry.location.lng.toString(),
      fromDescription: fromQuery,
      toDescription: toQuery,
    };

    router.push({
      pathname: "/ride-results",
      params: searchData,
    });
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (fromSuggestions.includes(item)) {
          setSelectedFrom(item);
          setFromQuery(item.description);
          setFromSuggestions([]);
          setShowFromSuggestions(false);
        } else {
          setSelectedTo(item);
          setToQuery(item.description);
          setToSuggestions([]);
          setShowToSuggestions(false);
        }
      }}
      activeOpacity={0.85}
    >
      <Text style={styles.suggestionMain}>
        {item.structured_formatting?.main_text || item.description}
      </Text>
      {item.structured_formatting?.secondary_text ? (
        <Text style={styles.suggestionSecondary}>
          {item.structured_formatting.secondary_text}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Search rides</Text>
          <Text style={styles.title}>Find a route that already works for you</Text>
          <Text style={styles.subtitle}>Search by pickup and destination to explore nearby ride options.</Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.routeRail}>
            <View style={styles.sourceDot} />
            <View style={styles.railLine} />
            <View style={styles.destinationDot} />
          </View>

          <View style={styles.fields}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>From</Text>
              <View style={styles.inputShell}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter starting location"
                  placeholderTextColor={theme.colors.textMuted}
                  value={fromQuery}
                  onChangeText={handleFromChange}
                />
                {fromQuery.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFromQuery("");
                      setSelectedFrom(null);
                      setShowFromSuggestions(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
              {showFromSuggestions ? (
                <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="handled">
                  {fromSuggestions.map((item, i) => (
                    <View key={item.place_id || i.toString()}>{renderSuggestion({ item })}</View>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>To</Text>
              <View style={styles.inputShell}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter destination"
                  placeholderTextColor={theme.colors.textMuted}
                  value={toQuery}
                  onChangeText={handleToChange}
                />
                {toQuery.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setToQuery("");
                      setSelectedTo(null);
                      setShowToSuggestions(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
              {showToSuggestions ? (
                <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="handled">
                  {toSuggestions.map((item, i) => (
                    <View key={item.place_id || i.toString()}>{renderSuggestion({ item })}</View>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.tipChip}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.tipChipText}>Today</Text>
          </View>
          <View style={styles.tipChip}>
            <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.tipChipText}>Best for daily commute</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedFrom || !selectedTo) && styles.submitButtonDisabled,
          ]}
          onPress={handleSearchRide}
          disabled={!selectedFrom || !selectedTo}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>Search Rides</Text>
        </TouchableOpacity>

        <View style={styles.recentSection}>
          <View style={styles.recentIcon}>
            <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentTitle}>Tip</Text>
            <Text style={styles.recentPlaceholder}>
              Search using landmarks or locality names for more accurate suggestions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    ...typography.label,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...typography.headingLg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    lineHeight: 22,
  },
  searchCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  routeRail: {
    alignItems: "center",
    paddingTop: 34,
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
  railLine: {
    width: 2,
    flex: 1,
    minHeight: 66,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  fields: {
    flex: 1,
    gap: theme.spacing.md,
  },
  fieldBlock: {
    position: "relative",
  },
  label: {
    ...typography.label,
    marginBottom: theme.spacing.sm,
  },
  inputShell: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  dropdown: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    maxHeight: 180,
    ...theme.shadows.card,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionMain: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  suggestionSecondary: {
    marginTop: theme.spacing.xs,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  chipRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tipChipText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: "#F8B39B",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.white,
  },
  recentSection: {
    marginTop: theme.spacing.xxl,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.skyBlue,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  recentPlaceholder: {
    ...typography.bodyMd,
    lineHeight: 22,
  },
});
