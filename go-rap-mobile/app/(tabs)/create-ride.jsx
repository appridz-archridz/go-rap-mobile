import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import { useSelector } from "react-redux";
import { inputField } from "../../global-css";
import { RideService } from "../../services/ride-service";
import { olaService } from "../../services/thirdPartyApis";

export default function CreateRideScreen() {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // debounce refs
  const startDebounceRef = useRef(null);
  const endDebounceRef = useRef(null);

  const selector = useSelector((state) => state.auth);

  // 🔍 Fetch location suggestions with debounce
  const handleStartChange = (text) => {
    setStartQuery(text);
    if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
    startDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        const results = await olaService.search(text);
        setStartSuggestions(results);
      } else {
        setStartSuggestions([]);
      }
    }, 300);
  };

  const handleEndChange = (text) => {
    setEndQuery(text);
    if (endDebounceRef.current) clearTimeout(endDebounceRef.current);
    endDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        const results = await olaService.search(text);
        setEndSuggestions(results);
      } else {
        setEndSuggestions([]);
      }
    }, 300);
  };

  // 🗺️ Fetch routes when both points are chosen
  const fetchRoutes = async () => {
    if (!selectedStart?.geometry || !selectedEnd?.geometry) return;
    try {
      setLoadingRoutes(true);
      setRoutes([]);
      const origin = selectedStart.geometry.location;
      const destination = selectedEnd.geometry.location;
      const routesData = await olaService.getRoute(origin, destination);
      setRoutes(routesData);
      if (routesData.length > 0) setSelectedRoute(0);
    } catch (err) {
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    if (selectedStart && selectedEnd) {
      fetchRoutes();
    } else {
      setRoutes([]);
    }
  }, [selectedStart, selectedEnd]);

  const handleSubmit = () => {
    if (!selectedStart || !selectedEnd) {
      Alert.alert("Missing fields", "Please select both start and destination.");
      return;
    }

    const rideDTO = {
      startPoint: selectedStart.description,
      endPoint: selectedEnd.description,
      startLatitude: selectedStart.geometry.location.lat,
      startLongitude: selectedStart.geometry.location.lng,
      destinationLatitude: selectedEnd.geometry.location.lat,
      destinationLongitude: selectedEnd.geometry.location.lng,
      rideDate: rideDate.toISOString().split("T")[0],
      rideTime: `${rideTime.getHours().toString().padStart(2, "0")}:${rideTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      availableSeats: parseInt(availableSeats),
      polyline: routes[0].overview_polyline,
    };

    const userId = selector.userId;
    
    console.log('Ride ceated', userId, rideDTO);
    const response = RideService.createRide(userId, rideDTO)
    
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (startSuggestions.includes(item)) {
          setSelectedStart(item);
          setStartQuery(item.description);
          setStartSuggestions([]);
        } else {
          setSelectedEnd(item);
          setEndQuery(item.description);
          setEndSuggestions([]);
        }
      }}
    >
      <Text>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Create a Ride</Text>

        {/* From */}
        <Text style={styles.label}>From</Text>
        <TextInput
          style={inputField}
          placeholder="Search Pickup Location"
          value={startQuery}
          onChangeText={handleStartChange}
        />
        {startSuggestions.length > 0 && (
          <FlatList
            data={startSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSuggestion}
            style={styles.dropdown}
          />
        )}

        {/* To */}
        <Text style={styles.label}>To</Text>
        <TextInput
          style={inputField}
          placeholder="Search Drop Location"
          value={endQuery}
          onChangeText={handleEndChange}
        />
        {endSuggestions.length > 0 && (
          <FlatList
            data={endSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSuggestion}
            style={styles.dropdown}
          />
        )}

        {/* Date */}
        <Text style={styles.label}>Ride Date</Text>
        <TouchableOpacity
          style={inputField}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{rideDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={rideDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setRideDate(date);
            }}
          />
        )}

        {/* Time */}
        <Text style={styles.label}>Ride Time</Text>
        <TouchableOpacity
          style={inputField}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>
            {rideTime.getHours().toString().padStart(2, "0")}:
            {rideTime.getMinutes().toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={rideTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setRideTime(time);
            }}
          />
        )}

        {/* Seats */}
        <Text style={styles.label}>Available Seats</Text>
        <TextInput
          style={inputField}
          placeholder="Enter available seats"
          keyboardType="numeric"
          value={availableSeats}
          onChangeText={setAvailableSeats}
        />

        {/* Routes */}
        {loadingRoutes ? (
          <ActivityIndicator size="large" color="#0051a8" style={{ marginTop: 20 }} />
        ) : routes.length > 0 ? (
          <FlatList
            data={routes}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.routeCard,
                  selectedRoute === index && styles.routeCardSelected,
                ]}
                onPress={() => setSelectedRoute(index)}
              >
                <Text style={styles.routeTitle}>Route {index + 1}</Text>
                <Text style={styles.routeSubtitle}>
                  Distance: {(item.legs?.[0]?.distance / 1000).toFixed(1)} km
                </Text>
                <Text style={styles.routeSubtitle}>
                  Duration: {(item.legs?.[0]?.duration / 60).toFixed(0)} min
                </Text>
              </TouchableOpacity>
            )}
            style={{ marginTop: 10 }}
          />
        ) : (
          selectedStart &&
          selectedEnd && (
            <Text style={styles.noRide}>No routes available</Text>
          )
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create Ride</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: 160,
  },
  routeCardSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#0051a8",
  },
  routeTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  routeSubtitle: { fontSize: 13, color: "#555" },
  noRide: { textAlign: "center", marginTop: 20, color: "#888" },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#0051a8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
