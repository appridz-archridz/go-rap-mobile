import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { clearButton, inputField, inputWithCross } from "../../global-css";
import { RideService } from "../../services/ride-service";
import { olaService } from "../../services/thirdPartyApis";
import { useSelector } from "react-redux";
import { router } from "expo-router";

const CreateRideScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [slots, setSlots] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const sourceDebounceRef = useRef(null);
  const destinationDebounceRef = useRef(null);

  const selector = useSelector((state) => state.auth);

  // Handle source input change
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
        } catch { }
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
        } catch { }
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    }, 300);
  };

  useEffect(() => {
    if (selectedSource && selectedDestination) {
      fetchRoutes();
    }
  }, [selectedSource, selectedDestination]);

  const fetchRoutes = async () => {

    if (!selectedSource || !selectedDestination) {
      Alert.alert("Error", "Please select both source and destination");
      return;
    }
    try {
      const res = await olaService.getRoute(selectedSource.geometry.location, selectedDestination.geometry.location);
      setRoutes(res || []);
      setSelectedRoute(res[0]);

    } catch {
      Alert.alert("Error", "Failed to fetch routes");
    } finally {
    }
  };

  const handleCreateRide = async () => {

    if (!selectedSource || !selectedDestination || !rideDate || !rideTime || !selectedRoute) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    try {

      const payload = {
        startPoint: selectedSource.description,
        startLatitude: selectedSource.geometry.location.lat,
        startLongitude: selectedSource.geometry.location.lng,

        destinationPoint: selectedDestination.description,
        destinationLatitude: selectedDestination.geometry.location.lat,
        destinationLongitude: selectedDestination.geometry.location.lng,

        rideDate: rideDate.toISOString().split("T")[0], // yyyy-MM-dd
        rideTime: rideTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), // HH:mm

        availableSeats: slots || 1,
        polyline: selectedRoute.overview_polyline,

        viaPoints: [], // if applicable
      };

      const { data } = await RideService.createRide(selector.userId, payload);

      if (data.success) {
        Alert.alert("Success", "Ride created successfully!");
        router.push("/search-ride");
      } 
      else Alert.alert("Error", data.message || "Something went wrong");
    } catch (error) {
      console.log('error is ', error?.response?.data);

      Alert.alert("Error", "Failed to create ride");
    } finally {
      setLoading(false);
    }
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
    >
      <Text style={styles.suggestionMain}>{item.structured_formatting?.main_text || item.description}</Text>
      {item.structured_formatting?.secondary_text && (
        <Text style={styles.suggestionSecondary}>{item.structured_formatting.secondary_text}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Ride</Text>

          {/* from */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Source</Text>
            <View style={inputWithCross}>
              <TextInput
                style={inputField}
                placeholder="Enter Source"
                value={source}
                onChangeText={handleSourceChange}
              />
              {source.length > 0 && (
                <TouchableOpacity onPress={() => { setSource(""); setSelectedSource(null); setShowSourceSuggestions(false); }} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {showSourceSuggestions && (
              <ScrollView style={styles.dropdown}>
                {sourceSuggestions.map((item, i) => (
                  <View key={item.place_id || i.toString()}>
                    {renderSuggestion(item, "source")}
                  </View>
                ))}
              </ScrollView>
            )}

          </View>

          {/* Destination */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Destination</Text>
            <View style={inputWithCross}>
              <TextInput
                style={inputField}
                placeholder="Enter Destination"
                value={destination}
                onChangeText={handleDestinationChange}
              />
              {destination.length > 0 && (
                <TouchableOpacity onPress={() => { setDestination(""); setSelectedDestination(null); setShowDestinationSuggestions(false); }} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {showDestinationSuggestions && (
              <ScrollView style={styles.dropdown}>
                {destinationSuggestions.map((item, i) => (
                  <View key={item.place_id || i.toString()}>
                    {renderSuggestion(item, "destination")}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Ride Date */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Ride Date</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{rideDate.toDateString()}</Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          {/* Ride Time */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Ride Time</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.dateText}>{rideTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              <FontAwesome name="clock-o" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          {/* Slots */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Available Slots</Text>
            <View style={styles.slotContainer}>
              <TouchableOpacity onPress={() => setSlots(prev => Math.max(1, prev - 1))} style={styles.iconBtn}>
                <FontAwesome name="minus" size={25} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.slotText, { fontSize: 18, fontWeight: "bold", color: "#000" }]}>
                {slots}
              </Text>
              <TouchableOpacity onPress={() => setSlots(prev => prev + 1)} style={styles.iconBtn}>
                <FontAwesome name="plus" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Get Routes */}
          {/* <TouchableOpacity style={styles.fetchBtn} onPress={fetchRoutes} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fetchText}>Get Available Routes</Text>}
          </TouchableOpacity> */}

          {/* Route List */}
          {/* <FlatList
            data={routes}
            keyExtractor={item => item.id.toString()}
            scrollEnabled
            nestedScrollEnabled
            style={{ maxHeight: 250, marginTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.routeCard, selectedRoute?.id === item.id && styles.selectedRoute]}
                onPress={() => setSelectedRoute(item)}
              >
                <Text style={styles.routeTitle}>{item.name}</Text>
                <Text style={styles.routeInfo}>{item.distance} km • {item.duration} mins</Text>
              </TouchableOpacity>
            )}
          /> */}

          {/* Create Ride */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateRide} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Ride</Text>}
          </TouchableOpacity>

          {/* Date/Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={rideDate}
              mode="date"
              display="default"
              onChange={(e, selected) => {
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
              onChange={(e, selected) => {
                setShowTimePicker(false);
                if (selected) setRideTime(selected);
              }}
            />
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateRideScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "bold", color: "#003366", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 5 },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    // backgroundColor: "#fff",
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
  },
  iconBtn: { backgroundColor: "#2c73beff", padding: 8, borderRadius: 100, height: 40, width: 40, alignItems: "center", justifyContent: "center" },
  slotText: { fontSize: 16, fontWeight: "600", color: "#000", marginHorizontal: 12 },
  fetchBtn: { backgroundColor: "#0051a8", borderRadius: 10, paddingVertical: 12, marginTop: 10, alignItems: "center" },
  fetchText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  routeCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, borderWidth: 1, borderColor: "#ddd", marginBottom: 10 },
  selectedRoute: { borderColor: "#0051a8", borderWidth: 2 },
  routeTitle: { fontSize: 16, fontWeight: "600", color: "#003366" },
  routeInfo: { fontSize: 13, color: "#555", marginTop: 4 },
  submitBtn: { backgroundColor: "#0051a8", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 15, marginBottom: 25 },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 300,
  },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  suggestionMain: { fontSize: 14, fontWeight: "600", color: "#333" },
  suggestionSecondary: { fontSize: 12, color: "#666", marginTop: 2 },
});
