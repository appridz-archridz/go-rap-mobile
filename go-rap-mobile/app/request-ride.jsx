import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Keyboard,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { olaService } from "../services/thirdPartyApis";
import { requestRideService } from "../services/request-ride-service";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";

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
  const selector = useSelector((state) => state.auth);

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

  const sourceDebounceRef = useRef(null);
  const destinationDebounceRef = useRef(null);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    return () => {
      if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
      if (destinationDebounceRef.current)
        clearTimeout(destinationDebounceRef.current);
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
      } catch (error){
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
        } catch (error) {
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

    if (destinationDebounceRef.current)
      clearTimeout(destinationDebounceRef.current);

    destinationDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        setDestLoading(true);
        try {
          const results = await olaService.search(text);
          setDestSuggestions(results);
          setShowDestSuggestions(true);
          setDestError(false);
        } catch (error) {
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
        : location.description ||
          location.structured_formatting?.main_text ||
          "";

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
        : location.description ||
          location.structured_formatting?.main_text ||
          "";

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

    if (!validateDateTime()) {
      return;
    }

    try {
      let fetchedRoutes = routes;
      
      if (!isEditMode || !selectedRoute) {
        fetchedRoutes = await fetchRoutes();
      }

      if (!fetchedRoutes || !fetchedRoutes[0]) {
        if (isEditMode && selectedRoute) {
        } else {
          showModal("Unable to fetch route information", "error");
          return;
        }
      }

      const firstLeg = fetchedRoutes?.[0]?.legs?.[0];

      const distanceKm = firstLeg?.distance
        ? (firstLeg.distance / 1000).toFixed(2)
        : null;
      const durationMinutes = firstLeg?.duration
        ? Math.round(firstLeg.duration / 60)
        : null;

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

      if (notes) {
        payload.notes = notes;
      }


      let response;
      if (isEditMode && id) {
        response = await requestRideService.updateRide(id, payload);
        showModal("Ride request updated successfully!", "success");
        router.push("/my-requested-ride");
      } else {
        response = await requestRideService.saveRequestRide(
          selector.userId,
          payload
        );
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
      console.error("Submit error:", error);
      console.error("Error details:", error.message);
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
      onPress={() =>
        type === "source" ? selectSource(item) : selectDestination(item)
      }
      accessibilityLabel={`Select ${
        item.description || item.structured_formatting?.main_text || item
      }`}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionMain} numberOfLines={2} ellipsizeMode="tail">
        {item.description || item.structured_formatting?.main_text || item}
      </Text>
      {item.structured_formatting?.secondary_text && (
        <Text style={styles.suggestionSecondary} numberOfLines={1} ellipsizeMode="tail">
          {item.structured_formatting.secondary_text}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.requestFormContainer}
        contentContainerStyle={styles.requestFormContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Text style={styles.formTitle}>
          {isEditMode ? "Edit Ride Request" : "Request a Ride"}
        </Text>

        <View style={[styles.formGroup, showSourceSuggestions && styles.formGroupExpanded]}>
          <Text style={styles.label}>Source *</Text>
          <View style={styles.inputWithCross}>
            <TextInput
              style={styles.formInput}
              placeholder="Enter Source"
              placeholderTextColor="#999"
              value={source}
              onChangeText={handleSourceChange}
              accessibilityLabel="Enter source location"
            />
            {source?.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSource("");
                  setShowSourceSuggestions(false);
                  setSelectedSource(null);
                }}
                style={styles.clearButton}
                accessibilityLabel="Clear source"
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
            {sourceLoading && (
              <ActivityIndicator
                size="small"
                color="#007bff"
                style={styles.loader}
              />
            )}
          </View>

          {sourceError && (
            <Text style={styles.errorText}>
              Unable to fetch suggestions. Please try again.
            </Text>
          )}

          {showSourceSuggestions && sourceSuggestions?.length > 0 && (
            <ScrollView
              style={styles.dropdown}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={true}
            >
              {sourceSuggestions.map((item, i) => (
                <View key={item.place_id || i}>
                  {renderSuggestion(item, "source")}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.formGroup, showDestSuggestions && styles.formGroupExpanded]}>
          <Text style={styles.label}>Destination *</Text>
          <View style={styles.inputWithCross}>
            <TextInput
              style={styles.formInput}
              placeholder="Enter Destination"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={handleDestinationChange}
              accessibilityLabel="Enter destination location"
            />
            {destination?.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setDestination("");
                  setShowDestSuggestions(false);
                  setSelectedDestination(null);
                }}
                style={styles.clearButton}
                accessibilityLabel="Clear destination"
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
            {destLoading && (
              <ActivityIndicator
                size="small"
                color="#007bff"
                style={styles.loader}
              />
            )}
          </View>

          {destError && (
            <Text style={styles.errorText}>
              Unable to fetch suggestions. Please try again.
            </Text>
          )}

          {showDestSuggestions && destSuggestions?.length > 0 && (
            <ScrollView
              style={styles.dropdown}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={true}
            >
              {destSuggestions.map((item, i) => (
                <View key={item.place_id || i}>
                  {renderSuggestion(item, "destination")}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ride Date *</Text>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel={`Select ride date, currently ${rideDate.toDateString()}`}
          >
            <Text style={styles.dateText}>{rideDate.toDateString()}</Text>
            <FontAwesome name="calendar" size={20} color="#0051a8" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ride Time *</Text>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowTimePicker(true)}
            accessibilityLabel={`Select ride time, currently ${rideTime.toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}`}
          >
            <Text style={styles.dateText}>
              {rideTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <FontAwesome name="clock-o" size={20} color="#0051a8" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Passengers *</Text>
          <View style={styles.slotContainer}>
            <TouchableOpacity
              onPress={() => setPassengers((p) => Math.max(1, p - 1))}
              style={styles.iconBtn}
              accessibilityLabel="Decrease passengers"
            >
              <FontAwesome name="minus" size={20} color="#fff" />
            </TouchableOpacity>
            <Text
              style={styles.slotText}
              accessibilityLabel={`${passengers} passengers`}
            >
              {passengers}
            </Text>
            <TouchableOpacity
              onPress={() => setPassengers((p) => p + 1)}
              style={styles.iconBtn}
              accessibilityLabel="Increase passengers"
            >
              <FontAwesome name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Expected Fare (₹) *</Text>
          <View style={styles.inputWithCross}>
            <TextInput
              style={styles.formInput}
              placeholder="Enter fare amount"
              keyboardType="numeric"
              placeholderTextColor="#999"
              value={fare}
              onChangeText={setFare}
              accessibilityLabel="Enter expected fare"
            />
            {fare.length > 0 && (
              <TouchableOpacity
                onPress={() => setFare("")}
                style={styles.clearButton}
                accessibilityLabel="Clear fare"
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="Any special requirements or preferences"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
            accessibilityLabel="Enter additional notes"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitRequest}
          accessibilityLabel={
            isEditMode ? "Update ride request" : "Submit ride request"
          }
        >
          <Text style={styles.submitButtonText}>
            {isEditMode ? "Update Ride Request" : "Post Ride Request"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
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
        )}

        {showTimePicker && (
          <DateTimePicker
            value={rideTime}
            mode="time"
            display="default"
            onChange={(event, selected) => {
              setShowTimePicker(false);
              if (selected) setRideTime(selected);
            }}
          />
        )}
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              modalType === "error" ? styles.modalError : styles.modalSuccess,
            ]}
          >
            <FontAwesome
              name={
                modalType === "error" ? "exclamation-circle" : "check-circle"
              }
              size={24}
              color="#fff"
            />
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  requestFormContainer: { flex: 1, backgroundColor: "#f8fafc" },
  requestFormContent: { padding: 20, paddingBottom: 40 },
  formTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 20,
  },
  formGroup: { 
    marginBottom: 20, 
    position: "relative",
  },
  formGroupExpanded: {
    marginBottom: 220,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWithCross: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  formInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#000",
  },
  clearButton: { 
    padding: 10, 
    justifyContent: "center", 
    alignItems: "center",
  },
  loader: { marginRight: 10 },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 10,
    zIndex: 10000,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  suggestionSecondary: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dateText: { fontSize: 15, color: "#000" },
  slotContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ECEBF0",
    borderRadius: 10,
    padding: 8,
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  iconBtn: {
    backgroundColor: "#2c73beff",
    padding: 8,
    borderRadius: 100,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  slotText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: 12,
  },
  textArea: { 
    height: 100, 
    paddingTop: 12, 
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#0051a8",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },
  submitButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#10b981",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSuccess: {
    backgroundColor: "#10b981",
  },
  modalError: {
    backgroundColor: "#ef4444",
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});

export default RequestRideForm;