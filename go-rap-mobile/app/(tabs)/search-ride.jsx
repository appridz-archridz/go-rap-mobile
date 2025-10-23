import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { clearButton, inputField, inputWithCross } from "../../global-css";
import { getRides } from "../../services/ride-service";
import { olaService } from "../../services/thirdPartyApis";

export default function SearchRideScreen() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);

  // debounce references
  const fromDebounceRef = useRef(null);
  const toDebounceRef = useRef(null);

  const handleFromChange = (text) => {
    setFromQuery(text);
    // Clear selected location when user types
    setSelectedFrom(null);
    
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    fromDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setFromSuggestions(results);
        } catch (error) {
        }
      } else {
        setFromSuggestions([]);
      }
    }, 300);
  };

  const handleToChange = (text) => {
    setToQuery(text);
    // Clear selected location when user types
    setSelectedTo(null);
    
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    toDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const results = await olaService.search(text);
          setToSuggestions(results);
        } catch (error) {
        }
      } else {
        setToSuggestions([]);
      }
    }, 300);
  };

  // 🗺️ Fetch Ola route info + rides when both are selected
  const fetchRidesAndRoutes = async () => {
    if (!selectedFrom?.geometry?.location || !selectedTo?.geometry?.location) {
      return;
    }

    setLoading(true);
    setRides([]);
    setRoutes([]);

    try {
      // Get current date in local format
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // 1️⃣ Create search DTO with actual coordinates from Ola response
      const searchDTO = {
        sourceLatitude: selectedFrom.geometry.location.lat,
        sourceLongitude: selectedFrom.geometry.location.lng,
        destinationLatitude: selectedTo.geometry.location.lat,
        destinationLongitude: selectedTo.geometry.location.lng,
        localDate: currentDate,
      };


      // 2️⃣ Fetch rides from backend with searchDTO
      const ridesData = await getRides(searchDTO);
      setRides(ridesData);

      // 3️⃣ Fetch routes from Ola Maps
      const origin = selectedFrom.geometry.location;
      const destination = selectedTo.geometry.location;
      const routesData = await olaService.getRoute(origin, destination);
      setRoutes(routesData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch rides or route data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFrom && selectedTo) {
      fetchRidesAndRoutes();
    }
  }, [selectedFrom, selectedTo]);

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (fromSuggestions.includes(item)) {
          setSelectedFrom(item);
          setFromQuery(item.description);
          setFromSuggestions([]);
        } else {
          setSelectedTo(item);
          setToQuery(item.description);
          setToSuggestions([]);
        }
      }}
    >
      <Text style={styles.suggestionMain}>{item.structured_formatting?.main_text || item.description}</Text>
      {item.structured_formatting?.secondary_text && (
        <Text style={styles.suggestionSecondary}>
          {item.structured_formatting.secondary_text}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRideCard = ({ item }) => (
    <View style={styles.rideCard}>
      <Text style={styles.rideTitle}>
        {item.startPoint} → {item.endPoint}
      </Text>
      <Text style={styles.rideSubtitle}>Driver: {item.driverName}</Text>
      <Text style={styles.rideSubtitle}>Vehicle: {item.vehicleName}</Text>
      <Text style={styles.rideSubtitle}>Seats: {item.availableSeats}</Text>
      <Text style={styles.rideSubtitle}>
        Date: {item.rideDate} | Time: {item.rideTime}
      </Text>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push(`/create-ride?id=${item.id}`)}
      >
        <Text style={styles.viewButtonText}>View Ride</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRouteCard = ({ item, index }) => (
    <View style={styles.routeCard}>
      <Text style={styles.routeTitle}>Route {index + 1}</Text>
      <Text style={styles.routeSubtitle}>
        Distance: {(item.legs?.[0]?.distance / 1000).toFixed(1)} km
      </Text>
      <Text style={styles.routeSubtitle}>
        Duration: {(item.legs?.[0]?.duration / 60).toFixed(0)} min
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Search Rides</Text>

        {/* From */}
        <View style={{ position: 'relative' }}>
          <Text style={styles.label}>From</Text>
          <View style={inputWithCross}>
            <TextInput
              style={inputField}
              placeholder="Enter starting location"
              value={fromQuery}
              onChangeText={handleFromChange}
            />
            {fromQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setFromQuery("");
                  setSelectedFrom(null);
                }}
                style={clearButton}
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {fromSuggestions.length > 0 && (
            <FlatList
              data={fromSuggestions}
              keyExtractor={(item, i) => item.place_id || i.toString()}
              renderItem={renderSuggestion}
              style={styles.dropdown}
            />
          )}
        </View>

        {/* To */}
        <View style={{ position: 'relative', marginTop: 10 }}>
          <Text style={styles.label}>To</Text>
          <View style={inputWithCross}>
            <TextInput
              style={inputField}
              placeholder="Enter destination"
              value={toQuery}
              onChangeText={handleToChange}
            />
            {toQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setToQuery("");
                  setSelectedTo(null);
                }}
                style={clearButton}
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {toSuggestions.length > 0 && (
            <FlatList
              data={toSuggestions}
              keyExtractor={(item, i) => item.place_id || i.toString()}
              renderItem={renderSuggestion}
              style={styles.dropdown}
            />
          )}
        </View>

        {/* Results */}
        {loading ? (
          <ActivityIndicator size="large" color="#0051a8" style={{ marginTop: 30 }} />
        ) : rides.length > 0 ? (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRideCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          selectedFrom &&
          selectedTo && (
            <Text style={styles.noRideText}>No rides found for this route</Text>
          )
        )}

        {/* Route Info */}
        {routes.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>Suggested Routes</Text>
            <FlatList
              horizontal
              data={routes}
              renderItem={renderRouteCard}
              keyExtractor={(_, i) => i.toString()}
              style={{ marginTop: 8 }}
            />
          </>
        )}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 10,
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
  rideCard: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  rideTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  rideSubtitle: { fontSize: 13, color: "#555", marginTop: 3 },
  viewButton: {
    backgroundColor: "#0051a8",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  viewButtonText: { color: "#fff", fontWeight: "600" },
  noRideText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#888",
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
  routeTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  routeSubtitle: { fontSize: 13, color: "#555" },
});