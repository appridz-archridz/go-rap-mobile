import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AuthService } from "../components/services/authService";
import { inputField } from "../global-css";
import { getRides } from "../services/ride-service";
import { locationService } from "../services/thirdPartyApis";

export default function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  // refs for debounce timers
  const fromDebounceRef = useRef(null);
  const toDebounceRef = useRef(null);

  // Run profile fetch only once
  useEffect(() => {
    AuthService.getProfileInfo();
  }, []);

  // Fetch rides whenever from & to are selected
  useEffect(() => {
    if (from && to) {
      setLoading(true);
      (async () => {
        const data = await getRides(from, to);
        setRides(data);
        setLoading(false);
      })();
    }
  }, [from, to]);

  // ---- Search "from" locations with debounce ----
  const handleFromChange = (text) => {
    setFromQuery(text);
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);

    fromDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        const results = await locationService.search(text);
        setFromSuggestions(results);
      } else {
        setFromSuggestions([]);
      }
    }, 200);
  };

  // ---- Search "to" locations with debounce ----
  const handleToChange = (text) => {
    setToQuery(text);
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);

    toDebounceRef.current = setTimeout(async () => {
      if (text.length > 1) {
        const results = await locationService.search(text);
        setToSuggestions(results);
      } else {
        setToSuggestions([]);
      }
    }, 200);
  };

  // Dummy handler for card button
  const handleRideAction = (rideId) => {
    console.log("Ride action clicked for ID:", rideId);
    router.push("/create-ride");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* -------- From -------- */}
        <Text style={styles.label}>From</Text>
        <TextInput
          style={inputField}
          placeholder="Search Pickup Location"
          value={fromQuery}
          onChangeText={handleFromChange}
        />
        { fromSuggestions.length > 0 &&
          <FlatList
            data={fromSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFrom(item.display_name);
                  setFromQuery(item.display_name);
                  setFromSuggestions([]);
                }}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
          />
        }

        {/* -------- To -------- */}
        <Text style={styles.label}>To</Text>
        <TextInput
          style={inputField}
          placeholder="Search Drop Location"
          value={toQuery}
          onChangeText={handleToChange}
        />
        { toSuggestions.length > 0 &&
          <FlatList
            data={toSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setTo(item.display_name);
                  setToQuery(item.display_name);
                  setToSuggestions([]);
                }}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
          />
        }

        {/* -------- Rides -------- */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0051a8"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.from} → {item.to}
                </Text>
                <Text style={styles.cardText}>Driver: {item.driver}</Text>
                <Text style={styles.cardText}>Vehicle: {item.vehicle}</Text>
                <Text style={styles.cardText}>
                  Seats Available: {item.seats}
                </Text>
                <Text style={styles.cardText}>
                  Date: {item.date} | {item.time}
                </Text>

                {/* Button in card */}
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => handleRideAction(item.id)}
                >
                  <Text style={styles.cardButtonText}>View Ride</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              from && to ? (
                <Text style={styles.noRide}>No rides found</Text>
              ) : (
                <Text style={styles.noRide}>Search rides above</Text>
              )
            }
            contentContainerStyle={{ marginTop: 20 }}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
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
    position: "relative",
    width: "100%",
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardText: { fontSize: 14, color: "#555", marginTop: 2 },
  noRide: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#888" },
  cardButton: {
    marginTop: 10,
    backgroundColor: "#0051a8",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cardButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
