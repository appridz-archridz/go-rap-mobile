import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import { olaService } from "../services/thirdPartyApis";
import { requestRideService } from "../services/request-ride-service";
import { theme } from "../constants/theme";

const RequestRideForm = ({ navigation }) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [destError, setDestError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const selector = useSelector((state) => state.auth);
  const sourceDebounceRef = useRef(null);
  const destinationDebounceRef = useRef(null);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    return () => {
      if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
      if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchRideDetails = async () => {
      try {
        setIsEditMode(true);
        const ride = await requestRideService.getRideById(id);

        setSource(ride.startLocation);
        setDestination(ride.endLocation);
        setSelectedSource({
          description: ride.startLocation,
          geometry: {
            location: { lat: ride.startLatitude, lng: ride.startLongitude },
          },
        });
        setSelectedDestination({
          description: ride.endLocation,
          geometry: {
            location: { lat: ride.endLatitude, lng: ride.endLongitude },
          },
        });
        setRideDate(new Date(ride.rideDate));
        setRideTime(new Date(`${ride.rideDate}T${ride.rideTime}`));
        setPassengers(ride.numberOfPassengers);
        setFare(ride.offeredPrice.toString());
        setNotes(ride.notes || "");
        setSelectedRoute(ride.polyline || null);
      } catch (_error) {
        showModal("Failed to load ride details", "error");
      }
    };

    fetchRideDetails();
  }, [id]);

  const showModal = (message, type = "success") => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 3000);
  };

  const handleSourceChange = (text) => {
    setSource(text);
    setSelectedSource(null);
    setSourceError(false);

    if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);

    sourceDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        setSourceLoading(true);
        try {
          const results = await olaService.search(text);
          setSourceSuggestions(results);
          setShowSourceSuggestions(true);
          setSourceError(false);
        } catch (_error) {
          setSourceSuggestions([]);
          setShowSourceSuggestions(false);
          setSourceError(true);
        } finally {
          setSourceLoading(false);
        }
      } else {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      }
    }, 300);
  };

  const handleDestinationChange = (text) => {
    setDestination(text);
    setSelectedDestination(null);
    setDestError(false);

    if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current);

    destinationDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        setDestLoading(true);
        try {
          const results = await olaService.search(text);
          setDestSuggestions(results);
          setShowDestSuggestions(true);
          setDestError(false);
        } catch (_error) {
          setDestSuggestions([]);
          setShowDestSuggestions(false);
          setDestError(true);
        } finally {
          setDestLoading(false);
        }
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
    }, 300);
  };

  const selectSource = (location) => {
    const displayText =
      typeof location === "string"
        ? location
        : location.description || location.structured_formatting?.main_text || "";

    setSource(displayText);
    setSelectedSource(location);
    setSourceSuggestions([]);
    setShowSourceSuggestions(false);
    Keyboard.dismiss();
  };

  const selectDestination = (location) => {
    const displayText =
      typeof location === "string"
        ? location
        : location.description || location.structured_formatting?.main_text || "";

    setDestination(displayText);
    setSelectedDestination(location);
    setDestSuggestions([]);
    setShowDestSuggestions(false);
    Keyboard.dismiss();
  };

  const validateDateTime = () => {
    const now = new Date();
    const selectedDateTime = new Date(rideDate);
    selectedDateTime.setHours(rideTime.getHours(), rideTime.getMinutes(), 0, 0);

    if (selectedDateTime < now) {
      showModal("Please select a future date and time", "error");
      return false;
    }
    return true;
  };

  const fetchRoutes = async () => {
    if (!selectedSource || !selectedDestination) {
      Alert.alert("Error", "Please select both source and destination");
      return;
    }

    try {
      const from = selectedSource.geometry.location;
      const to = selectedDestination.geometry.location;
      const res = await olaService.getRoute(from, to);

      if (!res || res.length === 0) {
        throw new Error("No routes found");
      }

      setRoutes(res);

      if (res[0]?.overview_polyline) {
        setSelectedRoute(res[0].overview_polyline);
      }

      return res;
    } catch (error) {
      Alert.alert("Error", "Failed to fetch routes");
      throw error;
    }
  };

  const handleSubmitRequest = async () => {
    if (!source || !destination || !passengers || !fare) {
      showModal("Please fill all required fields", "error");
      return;
    }

    if (!selectedSource || !selectedDestination) {
      showModal("Please select source and destination from suggestions", "error");
      return;
    }

    if (!validateDateTime()) return;

    try {
      let fetchedRoutes = routes;

      if (!isEditMode || !selectedRoute) {
        fetchedRoutes = await fetchRoutes();
      }

      if (!fetchedRoutes || !fetchedRoutes[0]) {
        if (!isEditMode || !selectedRoute) {
          showModal("Unable to fetch route information", "error");
          return;
        }
      }

      const firstLeg = fetchedRoutes?.[0]?.legs?.[0];
      const distanceKm = firstLeg?.distance ? (firstLeg.distance / 1000).toFixed(2) : null;
      const durationMinutes = firstLeg?.duration ? Math.round(firstLeg.duration / 60) : null;

      const payload = {
        startLocation: selectedSource.description,
        startLatitude: selectedSource.geometry.location.lat,
        startLongitude: selectedSource.geometry.location.lng,
        endLocation: selectedDestination.description,
        endLatitude: selectedDestination.geometry.location.lat,
        endLongitude: selectedDestination.geometry.location.lng,
        rideDate: rideDate.toISOString().split("T")[0],
        rideTime: rideTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        offeredPrice: parseFloat(fare),
        numberOfPassengers: passengers,
        polyline: selectedRoute,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        duration: durationMinutes,
      };

      if (notes) payload.notes = notes;

      if (isEditMode && id) {
        await requestRideService.updateRide(id, payload);
        showModal("Ride request updated successfully!", "success");
        router.push("/my-requested-ride");
      } else {
        await requestRideService.saveRequestRide(selector.userId, payload);
        showModal("Ride request submitted successfully!", "success");
        router.push("/my-requested-ride");
      }

      if (!isEditMode) {
        setSource("");
        setDestination("");
        setSelectedSource(null);
        setSelectedDestination(null);
        setRideDate(new Date());
        setRideTime(new Date());
        setPassengers(1);
        setFare("");
        setNotes("");
        setRoutes(null);
        setSelectedRoute(null);
      }

      setTimeout(() => {
        if (navigation) {
          navigation.goBack();
        }
      }, 2000);
    } catch (error) {
      showModal(
        `Failed to ${isEditMode ? "update" : "submit"} request: ${
          error.message || "Please try again"
        }`,
        "error"
      );
    }
  };

  const renderSuggestion = (item, type) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => (type === "source" ? selectSource(item) : selectDestination(item))}
      activeOpacity={0.85}
    >
      <Text style={styles.suggestionMain} numberOfLines={2}>
        {item.description || item.structured_formatting?.main_text || item}
      </Text>
      {item.structured_formatting?.secondary_text ? (
        <Text style={styles.suggestionSecondary} numberOfLines={1}>
          {item.structured_formatting.secondary_text}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderField = ({
    label,
    value,
    onChange,
    placeholder,
    loading,
    onClear,
    iconName,
    showSuggestions,
    suggestions,
    type,
    errorText,
  }) => (
    <View style={[styles.fieldGroup, showSuggestions ? styles.fieldGroupExpanded : null]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <View style={styles.routeMarkerColumn}>
          <View
            style={[
              styles.routeDot,
              type === "source" ? styles.routeDotStart : styles.routeDotEnd,
            ]}
          />
        </View>
        <FontAwesome name={iconName} size={16} color={theme.colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChange}
        />
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : value?.length > 0 ? (
          <TouchableOpacity onPress={onClear}>
            <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {showSuggestions && suggestions?.length > 0 ? (
        <ScrollView
          style={styles.dropdown}
          nestedScrollEnabled
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {suggestions.map((item, index) => (
            <View key={item.place_id || index}>{renderSuggestion(item, type)}</View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{isEditMode ? "Update your plan" : "Passenger request"}</Text>
        <Text style={styles.title}>{isEditMode ? "Edit ride request" : "Request a ride"}</Text>
        <Text style={styles.subtitle}>
          Share your route, preferred time, and expected fare in a few simple steps.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Trip details</Text>
          <Text style={styles.heroText}>
            Riders nearby can view your request and contact you if it matches their route.
          </Text>
        </View>

        {renderField({
          label: "Source *",
          value: source,
          onChange: handleSourceChange,
          placeholder: "Enter pickup point",
          loading: sourceLoading,
          onClear: () => {
            setSource("");
            setShowSourceSuggestions(false);
            setSelectedSource(null);
          },
          iconName: "circle-o",
          showSuggestions: showSourceSuggestions,
          suggestions: sourceSuggestions,
          type: "source",
          errorText: sourceError ? "Unable to fetch suggestions. Please try again." : "",
        })}

        {renderField({
          label: "Destination *",
          value: destination,
          onChange: handleDestinationChange,
          placeholder: "Enter destination",
          loading: destLoading,
          onClear: () => {
            setDestination("");
            setShowDestSuggestions(false);
            setSelectedDestination(null);
          },
          iconName: "map-marker",
          showSuggestions: showDestSuggestions,
          suggestions: destSuggestions,
          type: "destination",
          errorText: destError ? "Unable to fetch suggestions. Please try again." : "",
        })}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Travel time</Text>
          <View style={styles.chipsRow}>
            <TouchableOpacity style={styles.pillField} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
              <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.pillText}>{rideDate.toDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pillField} onPress={() => setShowTimePicker(true)} activeOpacity={0.85}>
              <FontAwesome name="clock-o" size={16} color={theme.colors.primary} />
              <Text style={styles.pillText}>
                {rideTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Passenger count</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setPassengers((value) => Math.max(1, value - 1))}
              activeOpacity={0.85}
            >
              <FontAwesome name="minus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperNumber}>{passengers}</Text>
              <Text style={styles.stepperCaption}>passengers</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setPassengers((value) => value + 1)}
              activeOpacity={0.85}
            >
              <FontAwesome name="plus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Fare and notes</Text>
          <View style={styles.inputShell}>
            <Text style={styles.currency}>Rs</Text>
            <TextInput
              style={styles.input}
              placeholder="Expected fare"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
              value={fare}
              onChangeText={setFare}
            />
            {fare.length > 0 ? (
              <TouchableOpacity onPress={() => setFare("")}>
                <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requirements or preferences"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitRequest} activeOpacity={0.85}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? "Update ride request" : "Post ride request"}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker ? (
        <DateTimePicker
          value={rideDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
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

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              modalType === "error" ? styles.modalError : styles.modalSuccess,
            ]}
          >
            <FontAwesome
              name={modalType === "error" ? "exclamation-circle" : "check-circle"}
              size={22}
              color={theme.colors.white}
            />
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  heroCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.skyBlue,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  heroText: {
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
    position: "relative",
  },
  fieldGroupExpanded: {
    marginBottom: 220,
  },
  label: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  inputShell: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.card,
  },
  routeMarkerColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
  },
  routeDotStart: { backgroundColor: theme.colors.accent },
  routeDotEnd: { backgroundColor: theme.colors.primary },
  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
  },
  dropdown: {
    position: "absolute",
    top: 82,
    left: 0,
    right: 0,
    maxHeight: 210,
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
  chipsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    flexWrap: "wrap",
  },
  pillField: {
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
  pillText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  currency: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  notesInput: {
    marginTop: theme.spacing.md,
    minHeight: 112,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  footerSpace: { height: 100 },
  stickyFooter: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  submitButton: {
    minHeight: 54,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },
  submitButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 46, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  modalContent: {
    width: "100%",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  modalSuccess: { backgroundColor: theme.colors.accent },
  modalError: { backgroundColor: theme.colors.error },
  modalText: {
    flex: 1,
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.white,
  },
});

export default RequestRideForm;
