import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SuggestionsScreen() {
  const { inputType, currentFrom, currentTo } = useLocalSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Dummy suggestions API
  const fetchSuggestions = (q) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    
    const allCities = [
      "Hyderabad", "Delhi", "Mumbai", "Chennai", "Bangalore", 
      "Kolkata", "Ahmedabad", "Pune", "Surat", "Jaipur",
      "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
      "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"
    ];
    
    const filtered = allCities.filter((item) =>
      item.toLowerCase().includes(q.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSuggestionSelect = (selectedItem) => {
    // Navigate back to main with all necessary params
    router.push({
      pathname: "/main",
      params: {
        selectedValue: selectedItem,
        inputType: inputType,
        // Preserve the other field's value
        preservedFrom: inputType === "to" ? currentFrom : undefined,
        preservedTo: inputType === "from" ? currentTo : undefined,
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Select {inputType === "from" ? "Origin" : "Destination"}
        </Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder={`Search ${inputType === "from" ? "origin" : "destination"} city`}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchSuggestions(text);
        }}
        autoFocus={true}
        placeholderTextColor="#666"
      />

      {/* Current Selection Info */}
      {(currentFrom || currentTo) && (
        <View style={styles.currentSelection}>
          <Text style={styles.currentSelectionText}>
            Current: {inputType === "from" ? 
              (currentTo ? `→ ${currentTo}` : "No destination selected") : 
              (currentFrom ? `${currentFrom} →` : "No origin selected")
            }
          </Text>
        </View>
      )}

      {/* Instructions */}
      {!query && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Type to search for cities
          </Text>
        </View>
      )}

      {/* No Results */}
      {query && suggestions.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            No cities found matching "{query}"
          </Text>
        </View>
      )}

      {/* Suggestions List */}
      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{item}</Text>
            <Text style={styles.suggestionArrow}>→</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    margin: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  currentSelection: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#e8f4f8",
    borderRadius: 6,
  },
  currentSelectionText: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "500",
  },
  instructions: {
    padding: 16,
    alignItems: "center",
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  noResults: {
    padding: 16,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  suggestionArrow: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
});