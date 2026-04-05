import { Routes } from "@/components/RoutesModal";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { olaService } from "../../services/thirdPartyApis";
import { getRideById, RideService } from "../../services/ride-service";
import { getUserVehicles } from "../../services/vehicle-service";
import { theme } from "../../constants/theme";

const CreateRideScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [slots, setSlots] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [isCreatingRide, setIsCreatingRide] = useState(false);
  const [pageTitle, setPageTitle] = useState("Create Ride");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const sourceDebounceRef = useRef(null);
  const destinationDebounceRef = useRef(null);
  const selector = useSelector((state) => state.auth);
  const [rideId] = useState(useLocalSearchParams()?.rideId || null);

  const fetchRideDetails = useCallback(async () => {
    try {
      const res = await getRideById(rideId);
      const ride = res.data?.data;
      if (!ride) return;

      setSource(ride.startPoint || "");
      setDestination(ride.destinationPoint || "");
      setSelectedSource({
        description: ride.startPoint,
        geometry: { location: { lat: ride.startLatitude, lng: ride.startLongitude } },
      });
      setSelectedDestination({
        description: ride.destinationPoint,
        geometry: { location: { lat: ride.destinationLatitude, lng: ride.destinationLongitude } },
      });

      const dateValue = new Date(ride.rideDate);
      if (!Number.isNaN(dateValue.getTime())) setRideDate(dateValue);

      const [hr, min, sec] = ride.rideTime.split(":").map((n) => parseInt(n, 10));
      const timeValue = new Date();
      timeValue.setHours(hr, min, sec || 0);
      setRideTime(new Date(timeValue));

      setSlots(ride.availableSeats || 1);

      const matchedVehicle = vehicles.find((vehicle) => vehicle.id === ride.vehicleId);
      if (matchedVehicle) {
        setSelectedVehicle(matchedVehicle);
      } else {
        setSelectedVehicle({
          id: ride.vehicleId,
          vehicleType: ride.vehicleType,
          vehicleNumber: ride.vehicleNumber,
        });
      }

      if (ride.polyline) {
        setSelectedRoute(ride.polyline);
      }
    } catch (error) {
      console.error("Error fetching ride details:", error);
    }
  }, [rideId, vehicles]);

  const fetchUserVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const { data } = await getUserVehicles(selector.userId);

      if (data.data.length > 0) {
        setVehicles(data.data);
        if (selectedVehicle?.id) {
          const matched = data.data.find((vehicle) => String(vehicle.id) === String(selectedVehicle.id));
          setSelectedVehicle(matched || data.data[0]);
        } else {
          setSelectedVehicle(data.data[0]);
        }
      } else {
        Alert.alert(
          "No Vehicle Found",
          "You need to add at least one vehicle to create a ride. Would you like to add a vehicle now?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Add Vehicle", onPress: () => router.push("/vehicle-information") },
          ]
        );
      }
    } catch (_error) {
      Alert.alert(
        "Error",
        "Failed to fetch your vehicles. Please try again or add a vehicle.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Vehicle", onPress: () => router.push("/vehicle-information") },
        ]
      );
    } finally {
      setLoadingVehicles(false);
    }
  }, [selectedVehicle?.id, selector.userId]);

  useEffect(() => {
    fetchUserVehicles();
  }, [fetchUserVehicles]);

  useEffect(() => {
    if (rideId) {
      setPageTitle("Update Ride");
      fetchRideDetails();
    }
  }, [fetchRideDetails, rideId]);

  const handleSourceChange = (text) => {
    setSource(text);
    setSelectedSource(null);
    if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
    sourceDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setSourceSuggestions(results);
          setShowSourceSuggestions(true);
        } catch {}
      } else {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      }
    }, 300);
  };

  const handleDestinationChange = (text) => {
    setDestination(text);
    setSelectedDestination(null);
    if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current);
    destinationDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setDestinationSuggestions(results);
          setShowDestinationSuggestions(true);
        } catch {}
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    }, 300);
  };

  const fetchRoutes = async () => {
    if (!selectedVehicle) {
      Alert.alert("Error", "Please select a vehicle");
      return;
    }

    if (!selectedSource || !selectedDestination) {
      Alert.alert("Error", "Please select both source and destination");
      return;
    }

    try {
      const from = selectedSource.geometry.location || selectedSource;
      const to = selectedDestination.geometry.location || selectedDestination;
      const res = await olaService.getRoute(from, to);
      Routes.show({
        encodedRoute: res[0].overview_polyline,
        from,
        to,
        onConfirm: (coords) => {
          setSelectedRoute(coords);
          Routes.hide();
        },
      });
    } catch {
      Alert.alert("Error", "Failed to fetch routes");
    }
  };

  useEffect(() => {
    if (selectedRoute) handleCreateRide();
  }, [selectedRoute]);

  const createPayload = useCallback(() => ({
    startPoint: selectedSource.description,
    startLatitude: selectedSource.geometry.location.lat,
    startLongitude: selectedSource.geometry.location.lng,
    destinationPoint: selectedDestination.description,
    destinationLatitude: selectedDestination.geometry.location.lat,
    destinationLongitude: selectedDestination.geometry.location.lng,
    rideDate: rideDate.toISOString().split("T")[0],
    rideTime: rideTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    availableSeats: slots || 1,
    polyline: selectedRoute,
    vehicleId: selectedVehicle.id,
    vehicleType: selectedVehicle.vehicleType || "Car",
  }), [rideDate, rideTime, selectedDestination, selectedRoute, selectedSource, selectedVehicle, slots]);

  const createRide = useCallback(async () => {
    try {
      const payload = createPayload();
      const { data } = await RideService.createRide(selector.userId, payload);
      if (data.statusCode === 201) {
        Alert.alert("Success", "Ride created successfully!");
        router.push("/search-ride");
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to { pageTitle } ");
    } finally {
      setLoading(false);
    }
  }, [createPayload, selector.userId]);

  const updateRide = useCallback(async () => {
    try {
      const payload = createPayload();
      const { data } = await RideService.updateRide(rideId, payload);
      if (data.statusCode === 200) {
        Alert.alert("Success", "Ride Updated successfully!");
        router.push("/search-ride");
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to  { pageTitle } ");
    } finally {
      setLoading(false);
    }
  }, [createPayload, rideId]);

  useEffect(() => {
    if (selectedRoute && isCreatingRide && selectedSource && selectedDestination) {
      if (rideId) updateRide();
      else createRide();
    }
  }, [createRide, isCreatingRide, rideId, selectedDestination, selectedRoute, selectedSource, updateRide]);

  const handleCreateRide = async () => {
    setIsCreatingRide(true);
  };

  const renderSuggestion = (item, type) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (type === "source") {
          setSelectedSource(item);
          setSource(item.description);
          setSourceSuggestions([]);
          setShowSourceSuggestions(false);
        } else {
          setSelectedDestination(item);
          setDestination(item.description);
          setDestinationSuggestions([]);
          setShowDestinationSuggestions(false);
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

  if (loadingVehicles) {
    return (
      <SafeAreaView style={styles.loaderScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Loading vehicles...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.headerCard}>
              <Text style={styles.eyebrow}>Driver trip setup</Text>
              <Text style={styles.title}>{pageTitle}</Text>
              <Text style={styles.subtitle}>
                Choose a vehicle, add the route, and publish seats for riders nearby.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Vehicle</Text>
                <TouchableOpacity onPress={() => router.push("/vehicle-information?returnTo=create-ride")} activeOpacity={0.85}>
                  <Text style={styles.addLink}>+ Add vehicle</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleRow}>
                {vehicles.map((vehicle) => {
                  const selected = String(selectedVehicle?.id) === String(vehicle.id);
                  return (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={[styles.vehicleCard, selected ? styles.vehicleCardActive : null]}
                      onPress={() => setSelectedVehicle(vehicle)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.vehicleIconWrap, selected ? styles.vehicleIconWrapActive : null]}>
                        <FontAwesome
                          name={vehicle.vehicleType?.toLowerCase() === "bike" ? "motorcycle" : "car"}
                          size={18}
                          color={selected ? theme.colors.primary : theme.colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.vehicleType}>{vehicle.vehicleType || "Vehicle"}</Text>
                      <Text style={styles.vehicleNumber}>{vehicle.vehicleNumber}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[styles.sectionCard, showSourceSuggestions || showDestinationSuggestions ? styles.expandedSection : null]}>
              <Text style={styles.sectionLabel}>Route</Text>
              <View style={styles.inputShell}>
                <View style={styles.routeColumn}>
                  <View style={[styles.routeDot, styles.routeDotStart]} />
                  <View style={styles.routeStem} />
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                </View>
                <View style={styles.routeInputColumn}>
                  <View>
                    <TextInput
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.input}
                      placeholder="Enter source"
                      value={source}
                      onChangeText={handleSourceChange}
                    />
                    {source.length > 0 ? (
                      <TouchableOpacity
                        onPress={() => {
                          setSource("");
                          setSelectedSource(null);
                          setShowSourceSuggestions(false);
                        }}
                        style={styles.clearButton}
                      >
                        <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={styles.inputDivider} />
                  <View>
                    <TextInput
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.input}
                      placeholder="Enter destination"
                      value={destination}
                      onChangeText={handleDestinationChange}
                    />
                    {destination.length > 0 ? (
                      <TouchableOpacity
                        onPress={() => {
                          setDestination("");
                          setSelectedDestination(null);
                          setShowDestinationSuggestions(false);
                        }}
                        style={styles.clearButton}
                      >
                        <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              {showSourceSuggestions ? (
                <ScrollView style={styles.dropdown} nestedScrollEnabled>
                  {sourceSuggestions.map((item, index) => (
                    <View key={item.place_id || index}>{renderSuggestion(item, "source")}</View>
                  ))}
                </ScrollView>
              ) : null}

              {showDestinationSuggestions ? (
                <ScrollView style={styles.dropdownBottom} nestedScrollEnabled>
                  {destinationSuggestions.map((item, index) => (
                    <View key={item.place_id || index}>{renderSuggestion(item, "destination")}</View>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Schedule</Text>
              <View style={styles.scheduleRow}>
                <TouchableOpacity style={styles.chip} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
                  <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.chipText}>{rideDate.toDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => setShowTimePicker(true)} activeOpacity={0.85}>
                  <FontAwesome name="clock-o" size={16} color={theme.colors.primary} />
                  <Text style={styles.chipText}>
                    {rideTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Available seats</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepperButton} onPress={() => setSlots((prev) => Math.max(1, prev - 1))} activeOpacity={0.85}>
                  <FontAwesome name="minus" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <View style={styles.stepperValue}>
                  <Text style={styles.stepperNumber}>{slots}</Text>
                  <Text style={styles.stepperCaption}>seats</Text>
                </View>
                <TouchableOpacity style={styles.stepperButton} onPress={() => setSlots((prev) => prev + 1)} activeOpacity={0.85}>
                  <FontAwesome name="plus" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.routeHint}>
              <FontAwesome name="map-o" size={16} color={theme.colors.primary} />
              <Text style={styles.routeHintText}>
                After tapping publish, you can confirm the route preview before the ride goes live.
              </Text>
            </View>

            <View style={styles.bottomPad} />

            {showDatePicker ? (
              <DateTimePicker
                value={rideDate}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setRideDate(selected);
                }}
              />
            ) : null}

            {showTimePicker ? (
              <DateTimePicker
                value={rideTime}
                mode="time"
                display="default"
                onChange={(event, selected) => {
                  setShowTimePicker(false);
                  if (selected) setRideTime(selected);
                }}
              />
            ) : null}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.submitBtn} onPress={fetchRoutes} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>{pageTitle}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  loaderScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  loaderText: {
    marginTop: theme.spacing.md,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
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
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  expandedSection: { marginBottom: 240 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addLink: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  vehicleRow: { gap: theme.spacing.md },
  vehicleCard: {
    width: 136,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  vehicleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#FFF3E8",
  },
  vehicleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  vehicleIconWrapActive: { backgroundColor: theme.colors.white },
  vehicleType: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  vehicleNumber: {
    marginTop: theme.spacing.xs,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  inputShell: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
  },
  routeColumn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
  },
  routeDotStart: { backgroundColor: theme.colors.accent },
  routeDotEnd: { backgroundColor: theme.colors.primary },
  routeStem: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  routeInputColumn: { flex: 1 },
  input: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingRight: 40,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  inputDivider: { height: 1, backgroundColor: theme.colors.border },
  clearButton: {
    position: "absolute",
    right: theme.spacing.lg,
    top: 16,
  },
  dropdown: {
    position: "absolute",
    top: 112,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    maxHeight: 180,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    zIndex: 40,
    ...theme.shadows.card,
  },
  dropdownBottom: {
    position: "absolute",
    top: 166,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    maxHeight: 180,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    zIndex: 40,
    ...theme.shadows.card,
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionMain: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  suggestionSecondary: {
    marginTop: 2,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  scheduleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { alignItems: "center" },
  stepperNumber: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.textPrimary,
  },
  stepperCaption: {
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  routeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.skyBlue,
  },
  routeHintText: {
    flex: 1,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bottomPad: { height: 96 },
  stickyFooter: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  submitBtn: {
    minHeight: 54,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },
  submitText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.white,
  },
});

export default CreateRideScreen;
