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
        } catch (error) { }
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
        } catch (error) { }
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
    }, 300);
  };

  const fetchRidesAndRoutes = async () => {
    if (!selectedFrom?.geometry?.location || !selectedTo?.geometry?.location) return;
    setLoading(true);
    setRides([]);
    setRoutes([]);
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const searchDTO = {
        sourceLatitude: selectedFrom.geometry.location.lat,
        sourceLongitude: selectedFrom.geometry.location.lng,
        destinationLatitude: selectedTo.geometry.location.lat,
        destinationLongitude: selectedTo.geometry.location.lng,
        localDate: currentDate,
      };

      const ridesData = await getRides(searchDTO);
      setRides(ridesData.data.data);

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
          setShowFromSuggestions(false);
        } else {
          setSelectedTo(item);
          setToQuery(item.description);
          setToSuggestions([]);
          setShowToSuggestions(false);
        }
      }}
    >
      <Text style={styles.suggestionMain}>
        {item.structured_formatting?.main_text || item.description}
      </Text>
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Find Your Perfect Ride</Text>

        {/* FROM */}
        <View style={{ position: "relative", marginBottom: 15 }}>
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
                  setShowFromSuggestions(false);
                }}
                style={clearButton}
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {showFromSuggestions && (
            <FlatList
              data={fromSuggestions}
              keyExtractor={(item, i) => item.place_id || i.toString()}
              renderItem={renderSuggestion}
              style={styles.dropdown}
            />
          )}
        </View>

        {/* TO */}
        <View style={{ position: "relative", marginBottom: 20 }}>
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
                  setShowToSuggestions(false);
                }}
                style={clearButton}
              >
                <FontAwesome name="times-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {showToSuggestions && (
            <FlatList
              data={toSuggestions}
              keyExtractor={(item, i) => item.place_id || i.toString()}
              renderItem={renderSuggestion}
              style={styles.dropdown}
            />
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={fetchRidesAndRoutes}>
          <Text style={styles.submitText}>Search Ride</Text>
        </TouchableOpacity>

        {/* RESULTS */}
        {loading ? (
          <ActivityIndicator size="large" color="#0051a8" style={{ marginTop: 30 }} />
        ) : (
          <>
            {rides.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Available Rides</Text>
                <FlatList
                  data={rides}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderRideCard}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </>
            )}
            {selectedFrom && selectedTo && rides.length === 0 && !loading && (
              <Text style={styles.noRideText}>No rides found for this route</Text>
            )}
          </>
        )}

        {/* ROUTES */}
        {routes.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Suggested Routes</Text>
            <FlatList
              horizontal
              data={routes}
              renderItem={renderRouteCard}
              keyExtractor={(_, i) => i.toString()}
              style={{ marginTop: 10 }}
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
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
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 300,
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
  submitButton: {
    marginTop: 20,
    backgroundColor: "#0051a8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 25,
    marginBottom: 8,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rideTitle: { fontSize: 16, fontWeight: "700", color: "#0051a8" },
  rideSubtitle: { fontSize: 13, color: "#555", marginTop: 4 },
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
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    width: 170,
  },
  routeTitle: { fontSize: 15, fontWeight: "700", color: "#0051a8" },
  routeSubtitle: { fontSize: 13, color: "#444", marginTop: 3 },
});
