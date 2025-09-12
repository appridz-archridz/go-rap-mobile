import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService } from "../components/services/authService";
import { getLocations, getRides } from "../services/ride-service";
// import { getLocations, getRides } from "../components/services/rideService";


export default function SearchRide() {
  const [locations, setLocations] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch rides whenever from & to are selected
  useEffect(() => {
    AuthService.getProfileInfo();
    if (from && to) {
      setLoading(true);
      (async () => {
        const data = await getRides(from, to);
        setRides(data);
        setLoading(false);
      })();
    }
  }, [from, to]);

  // Fetch locations when input focused
  const handleFocus = async (type) => {
    const data = await getLocations();
    setLocations(data);
    if (type === "from") setShowFromDropdown(true);
    if (type === "to") setShowToDropdown(true);
  };

  // Dummy handler for card button
  const handleRideAction = (rideId) => {
    console.log("Ride action clicked for ID:", rideId);
    // you can add logic later here
    router.push('/create-ride');
  };

  return (
    <View style={styles.container}>
      {/* -------- From -------- */}
      <Text style={styles.label}>From</Text>
      <TextInput
        style={styles.input}
        placeholder="Search Pickup Location"
        value={fromQuery}
        onChangeText={setFromQuery}
        onFocus={() => handleFocus("from")}
      />
      {showFromDropdown && (
        <FlatList
          data={locations.filter((loc) =>
            loc.name.toLowerCase().includes(fromQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setFrom(item.name);
                setFromQuery(item.name);
                setShowFromDropdown(false);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}

      {/* -------- To -------- */}
      <Text style={styles.label}>To</Text>
      <TextInput
        style={styles.input}
        placeholder="Search Drop Location"
        value={toQuery}
        onChangeText={setToQuery}
        onFocus={() => handleFocus("to")}
      />
      {showToDropdown && (
        <FlatList
          data={locations.filter((loc) =>
            loc.name.toLowerCase().includes(toQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setTo(item.name);
                setToQuery(item.name);
                setShowToDropdown(false);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}

      {/* -------- Rides -------- */}
      {loading ? (
        <ActivityIndicator size="large" color="#0051a8" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.from} → {item.to}
              </Text>
              <Text style={styles.cardText}>Driver: {item.driver}</Text>
              <Text style={styles.cardText}>Vehicle: {item.vehicle}</Text>
              <Text style={styles.cardText}>Seats Available: {item.seats}</Text>
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
            <Text style={styles.noRide}>No rides found</Text>
          }
          contentContainerStyle={{ marginTop: 20 }}
        />
      )}
    </View>
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 12,
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
