import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MainScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cards, setCards] = useState([]);

  // Initialize with default cards
  useEffect(() => {
    fetchCards("", "");
  }, []);

  // Handle selection coming from suggestions page
  useEffect(() => {
    if (params.selectedValue && params.inputType) {
      if (params.inputType === "from") {
        setFrom(params.selectedValue);
      } else if (params.inputType === "to") {
        setTo(params.selectedValue);
      }
    }
  }, [params.selectedValue, params.inputType]);

  // Fetch cards whenever from or to changes
  useEffect(() => {
    fetchCards(from, to);
  }, [from, to]);

  // Dummy getAll API
  const fetchCards = (fromValue, toValue) => {
    if (fromValue && toValue) {
      setCards([
        { id: 1, title: "Trip 1", description: `From ${fromValue} to ${toValue}` },
        { id: 2, title: "Trip 2", description: `Fastest route between ${fromValue} and ${toValue}` },
        { id: 3, title: "Trip 3", description: `Economy option: ${fromValue} → ${toValue}` },
      ]);
    } else if (fromValue || toValue) {
      // One field is selected
      const selected = fromValue || toValue;
      setCards([
        { id: 1, title: "Partial Selection", description: `Selected: ${selected}. Please select ${fromValue ? 'destination' : 'origin'}` },
        { id: 2, title: "Popular Routes", description: `Popular routes from/to ${selected}` },
      ]);
    } else {
      // Default cards when nothing is selected
      setCards([
        { id: 1, title: "Default Card 1", description: "Showing all available trips" },
        { id: 2, title: "Default Card 2", description: "Please select From & To locations" },
        { id: 3, title: "Popular Destinations", description: "Check out trending routes" },
      ]);
    }
  };

  const handleFromPress = () => {
    console.log("Navigating to from suggestions with current values:", { from, to }); // Debug
    router.push({ 
      pathname: "/suggestions", 
      params: { 
        inputType: "from",
        currentFrom: from || "",
        currentTo: to || ""
      } 
    });
  };

  const handleToPress = () => {
    console.log("Navigating to to suggestions with current values:", { from, to }); // Debug
    router.push({ 
      pathname: "/suggestions", 
      params: { 
        inputType: "to",
        currentFrom: from || "",
        currentTo: to || ""
      } 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Plan Your Trip</Text>
      
      {/* From Input */}
      <TouchableOpacity onPress={handleFromPress} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, from ? styles.inputFilled : null]}
          placeholder="From"
          value={from}
          editable={false}
          placeholderTextColor="#666"
        />
      </TouchableOpacity>

      {/* To Input */}
      <TouchableOpacity onPress={handleToPress} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, to ? styles.inputFilled : null]}
          placeholder="To"
          value={to}
          editable={false}
          placeholderTextColor="#666"
        />
      </TouchableOpacity>

      {/* Clear Button */}
      {(from || to) && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => {
            setFrom("");
            setTo("");
          }}
        >
          <Text style={styles.clearButtonText}>Clear Selection</Text>
        </TouchableOpacity>
      )}

      {/* Status Text */}
      <Text style={styles.statusText}>
        {from && to ? `Route: ${from} → ${to}` : 
         from ? `From: ${from} (Select destination)` :
         to ? `To: ${to} (Select origin)` :
         "Select your travel route"}
      </Text>

      {/* Cards */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff" 
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    color: "#333",
  },
  inputFilled: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  clearButton: {
    backgroundColor: "#ff6b6b",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "500",
  },
  statusText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
});