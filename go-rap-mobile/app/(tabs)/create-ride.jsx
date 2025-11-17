import { Routes } from '@/components/RoutesModal';
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  View
} from "react-native";
import { useSelector } from "react-redux";
import { clearButton, inputField, inputWithCross } from "../../global-css";
import { olaService } from "../../services/thirdPartyApis";
import { RideService } from './../../services/ride-service';
import { getUserVehicles } from './../../services/vehicle-service';

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
  const [isCreatingRide, setIsCreatingRide] = useState(false);
  const [path, setPath] = useState('');
  
  // Vehicle related states
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const sourceDebounceRef = useRef(null);
  const destinationDebounceRef = useRef(null);

  const selector = useSelector((state) => state.auth);

  // Fetch user vehicles on component mount
  useEffect(() => {
    fetchUserVehicles();
  }, []);

  const fetchUserVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const { data } = await getUserVehicles(selector.userId);
      
      if (data.data.length > 0) {
        setVehicles(data.data);
        setSelectedVehicle(data.data[0]);
      } else {
        Alert.alert(
          "No Vehicle Found",
          "You need to add at least one vehicle to create a ride. Would you like to add a vehicle now?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Add Vehicle", 
              onPress: () => router.push("/vehicle-information") 
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      Alert.alert(
        "Error",
        "Failed to fetch your vehicles. Please try again or add a vehicle.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Add Vehicle", 
            onPress: () => router.push("/vehicle-information") 
          }
        ]
      );
    } finally {
      setLoadingVehicles(false);
    }
  };

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
      const from = selectedSource.geometry.location;
      const to = selectedDestination.geometry.location;
      const res = await olaService.getRoute(from, to);
      setRoutes(res || []);
      Routes.show({
        encodedRoute: res[0].overview_polyline,
        from: from,
        to: to,
        onConfirm: (coords) => {
          setPath(coords);
          setSelectedRoute(coords);
          Routes.hide();
        },
      });
    } catch {
      Alert.alert("Error", "Failed to fetch routes");
    } finally {
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      handleCreateRide();
    }
  }, [selectedRoute]);

  const createRide = async () => {
    try {
      const payload = {
        startPoint: selectedSource.description,
        startLatitude: selectedSource.geometry.location.lat,
        startLongitude: selectedSource.geometry.location.lng,

        destinationPoint: selectedDestination.description,
        destinationLatitude: selectedDestination.geometry.location.lat,
        destinationLongitude: selectedDestination.geometry.location.lng,

        rideDate: rideDate.toISOString().split("T")[0],
        rideTime: rideTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),

        availableSeats: slots || 1,
        polyline: selectedRoute,
        vehicleId: selectedVehicle.id,
      };

      const { data } = await RideService.createRide(selector.userId, payload);

      reset();

      if (data.success) {
        Alert.alert("Success", "Ride created successfully!");
        router.push("/search-ride");
      }
      else Alert.alert("Error", data.message || "Something went wrong");
    } catch (error) {
      Alert.alert("Error", "Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSource("");
    setDestination("");
    setSelectedSource(null);
    setSelectedDestination(null);
    setRoutes([]);
    setSelectedRoute(null);
    setRideDate(new Date());
    setRideTime(new Date());
    setSlots(1);
    setSelectedVehicle(null);
  };

  useEffect(() => {
    if (selectedRoute && isCreatingRide && selectedSource && selectedDestination) {
      createRide();
    }
  }, [isCreatingRide, selectedRoute]);

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
    >
      <Text style={styles.suggestionMain}>{item.structured_formatting?.main_text || item.description}</Text>
      {item.structured_formatting?.secondary_text && (
        <Text style={styles.suggestionSecondary}>{item.structured_formatting.secondary_text}</Text>
      )}
    </TouchableOpacity>
  );

  const renderVehicleItem = (vehicle) => (
    <TouchableOpacity
      key={vehicle.id}
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedVehicle(vehicle);
        setShowVehicleDropdown(false);
      }}
    >
      <Text style={styles.suggestionMain}>
        {vehicle.make} {vehicle.model} ({vehicle.year})
      </Text>
      <Text style={styles.suggestionSecondary}>
        {vehicle.plateNumber} • {vehicle.color}
      </Text>
    </TouchableOpacity>
  );

  if (loadingVehicles) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color="#0051a8" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Ride</Text>

          {/* Vehicle Selection */}
          <View style={{ marginBottom: 15, zIndex: 3000 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => router.push("/vehicle-information")}>
                <Text style={styles.addVehicleLink}>+ Add Vehicle</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.dateField, !selectedVehicle && styles.placeholderField]}
              onPress={() => setShowVehicleDropdown(!showVehicleDropdown)}
            >
              <Text style={[styles.dateText, !selectedVehicle && styles.placeholderText]}>
                {selectedVehicle 
                  ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.plateNumber})`
                  : "Select a vehicle"
                }
              </Text>
              <FontAwesome 
                name={showVehicleDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#0051a8" 
              />
            </TouchableOpacity>

            {showVehicleDropdown && vehicles.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {vehicles.map(renderVehicleItem)}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Source */}
          <View style={{ marginBottom: 15, zIndex: 2000 }}>
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
          <View style={{ marginBottom: 15, zIndex: 1000 }}>
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

          {/* Create Ride */}
          <TouchableOpacity style={styles.submitBtn} onPress={fetchRoutes} disabled={loading}>
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
    backgroundColor: "#fff",
  },
  placeholderField: {
    backgroundColor: "#f8f9fa",
  },
  dateText: { fontSize: 15, color: "#000" },
  placeholderText: { color: "#999" },
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
  addVehicleLink: {
    fontSize: 14,
    color: "#0051a8",
    fontWeight: "600",
  },
});