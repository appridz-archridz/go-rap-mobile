import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { clearButton, inputField, inputWithCross } from "../../global-css";
import { olaService } from "../../services/thirdPartyApis";

export default function SearchRideScreen() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
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

  const handleSearchRide = () => {
    if (!selectedFrom?.geometry?.location || !selectedTo?.geometry?.location) {
      return;
    }

    const searchData = {
      sourceLatitude: selectedFrom.geometry.location.lat.toString(),
      sourceLongitude: selectedFrom.geometry.location.lng.toString(),
      destinationLatitude: selectedTo.geometry.location.lat.toString(),
      destinationLongitude: selectedTo.geometry.location.lng.toString(),
      fromDescription: fromQuery,
      toDescription: toQuery,
    };

    

  router.push({
    pathname: '/ride-results',
    params: searchData
  });
};

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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            <ScrollView
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
            >
              {fromSuggestions.map((item, i) => (
                <View key={item.place_id || i.toString()}>
                  {renderSuggestion({ item })}
                </View>
              ))}
            </ScrollView>
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
            <ScrollView
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
            >
              {toSuggestions.map((item, i) => (
                <View key={item.place_id || i.toString()}>
                  {renderSuggestion({ item })}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedFrom || !selectedTo) && styles.submitButtonDisabled
          ]}
          onPress={handleSearchRide}
          disabled={!selectedFrom || !selectedTo}
        >
          <Text style={styles.submitText}>Search Ride</Text>
        </TouchableOpacity>

        {/* RECENT SEARCHES SECTION - You can add this later */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <Text style={styles.recentPlaceholder}>Your recent searches will appear here</Text>
        </View>
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
    maxHeight: 200,
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
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15
  },
  recentSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  recentPlaceholder: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});