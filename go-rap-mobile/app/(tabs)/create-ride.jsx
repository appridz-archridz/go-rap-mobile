import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { olaService } from '../../services/thirdPartyApis';

const CreateRideScreen = () => {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [rideDate, setRideDate] = useState(new Date());
  const [rideTime, setRideTime] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState("");
  const [activeInput, setActiveInput] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // 🗺️ New state for routes
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // 🔍 Fetch suggestions for Ola Maps
  const fetchSuggestions = async (query, type) => {
    if (query.length < 2) {
      if (type === "start") setStartSuggestions([]);
      else setEndSuggestions([]);
      return;
    }
    try {
      const data = await olaService.search(query);
      console.log("Ola suggestions for", type, data);
      if (type === "start") setStartSuggestions(data);
      else setEndSuggestions(data);
    } catch (err) {
      console.error("Ola Maps error:", err);
    }
  };

  // 🗺️ Fetch routes when both locations are selected
  const fetchRoutes = async () => {
    if (!selectedStartLocation?.geometry?.location || !selectedEndLocation?.geometry?.location) {
      return;
    }

    setLoadingRoutes(true);
    setRoutes([]);
    setSelectedRoute(null);
    
    try {
      const origin = {
        lat: selectedStartLocation.geometry.location.lat,
        lng: selectedStartLocation.geometry.location.lng,
      };
      const destination = {
        lat: selectedEndLocation.geometry.location.lat,
        lng: selectedEndLocation.geometry.location.lng,
      };

      const routesData = await olaService.getRoute(origin, destination);
      console.log("📍 Found routes:", routesData.length);
      setRoutes(routesData);
      
      // Auto-select first route
      if (routesData.length > 0) {
        setSelectedRoute(0); // Store index instead of object
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // 🏁 Handle selection
  const handleStartSelect = (location) => {
    setSelectedStartLocation(location);
    setStartQuery(location.description);
    setStartSuggestions([]);
    setActiveInput(null);
  };

  const handleEndSelect = async (location) => {
    setSelectedEndLocation(location);
    setEndQuery(location.description);
    setEndSuggestions([]);
    setActiveInput(null);
  };

  // Fetch routes when both locations are selected
  useEffect(() => {
    if (selectedStartLocation && selectedEndLocation) {
      fetchRoutes();
    } else {
      setRoutes([]);
      setSelectedRoute(null);
    }
  }, [selectedStartLocation, selectedEndLocation]);

  // 💾 Handle submit
  const handleSubmit = () => {
    if (!selectedStartLocation || !selectedEndLocation) {
      alert("Please select both start and end locations.");
      return;
    }

    if (!selectedRoute && routes.length > 0) {
      alert("Please select a route.");
      return;
    }

    const rideDTO = {
      id: uuidv4(),
      startPoint: selectedStartLocation.description,
      startLatitude: selectedStartLocation.geometry?.location?.lat,
      startLongitude: selectedStartLocation.geometry?.location?.lng,
      destinationPoint: selectedEndLocation.description,
      destinationLatitude: selectedEndLocation.geometry?.location?.lat,
      destinationLongitude: selectedEndLocation.geometry?.location?.lng,
      rideDate: rideDate.toISOString().split("T")[0],
      rideTime: `${rideTime.getHours().toString().padStart(2, "0")}:${rideTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      availableSeats: parseInt(availableSeats),
      viaPoints: [],
      selectedRoute: selectedRoute !== null ? routes[selectedRoute] : null,
    };

    console.log("Ride DTO:", rideDTO);
    alert("Ride created successfully (check console)");
  };

  // 🎨 Render suggestion items
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestion}
      onPress={() =>
        activeInput === "start"
          ? handleStartSelect(item)
          : handleEndSelect(item)
      }
    >
      <Text style={styles.suggestionTitle}>{item.description}</Text>
      <Text style={styles.suggestionSubtitle}>
        {item.structured_formatting?.secondary_text || ""}
      </Text>
    </TouchableOpacity>
  );

  // 🗺️ Format duration from seconds
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  // 🗺️ Format distance from meters
  const formatDistance = (meters) => {
    if (!meters) return "N/A";
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  // 🗺️ Get route name/type
  const getRouteName = (route, index) => {
    if (route.summary && route.summary.trim()) return route.summary;
    
    // Try to get name from legs or steps
    const firstLeg = route.legs?.[0];
    if (firstLeg?.summary) return firstLeg.summary;
    
    // Check if there's a via point or major road
    const steps = firstLeg?.steps || [];
    if (steps.length > 0 && steps[0].name) {
      return `Via ${steps[0].name}`;
    }
    
    return `Route ${index + 1}`;
  };

  // 🗺️ Get total duration and distance from route
  const getRouteTotals = (route) => {
    const legs = route.legs || [];
    let totalDuration = 0;
    let totalDistance = 0;
    
    legs.forEach(leg => {
      totalDuration += leg.duration || 0;
      totalDistance += leg.distance || 0;
    });
    
    return { totalDuration, totalDistance };
  };

  // 🗺️ Render route card
  const renderRouteCard = ({ item, index }) => {
    const isSelected = selectedRoute === index;
    const { totalDuration, totalDistance } = getRouteTotals(item);
    const steps = item.legs?.[0]?.steps || [];
    const routeName = getRouteName(item, index);
    
    // Extract warnings or travel advisory
    const warnings = item.warnings || [];
    const advisory = item.travel_advisory;

    return (
      <TouchableOpacity
        style={[
          styles.routeCard,
          isSelected && styles.routeCardSelected,
        ]}
        onPress={() => setSelectedRoute(index)}
        activeOpacity={0.7}
      >
        {/* Route Header */}
        <View style={styles.routeHeader}>
          <View style={styles.routeHeaderLeft}>
            <View style={[styles.routeNumber, isSelected && styles.routeNumberSelected]}>
              <Text style={[styles.routeNumberText, isSelected && styles.routeNumberTextSelected]}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.routeName} numberOfLines={1}>
              {routeName}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
        </View>

        {/* Route Stats */}
        <View style={styles.routeStats}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🛣️</Text>
            <Text style={styles.statValue}>{steps.length || 0}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
        </View>

        {/* Route Details - Show key via points */}
        {steps.length > 0 && (
          <View style={styles.routeViaPoints}>
            <Text style={styles.viaPointsTitle}>🗺️ Route Details:</Text>
            <Text style={styles.viaPointsText} numberOfLines={2}>
              {steps.slice(0, 3).map((step, idx) => {
                const instruction = step.maneuver?.instruction || step.name || step.html_instructions;
                // Clean HTML tags if present
                return instruction ? instruction.replace(/<[^>]*>/g, '') : null;
              }).filter(Boolean).join(" → ")}
              {steps.length > 3 ? ` (+${steps.length - 3} more)` : ""}
            </Text>
          </View>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText} numberOfLines={2}>
              {warnings[0]}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 Create a Ride</Text>

      {/* Start Location */}
      <Text style={styles.label}>📍 Start Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter starting point"
        value={startQuery}
        onChangeText={(text) => {
          setStartQuery(text);
          setActiveInput("start");
          fetchSuggestions(text, "start");
        }}
      />
      {activeInput === "start" && startSuggestions.length > 0 && (
        <FlatList
          data={startSuggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSuggestion}
          style={styles.suggestionList}
        />
      )}

      {/* Selected Start */}
      {selectedStartLocation && (
        <View style={styles.selectedLocation}>
          <Text style={styles.selectedText}>
            <Text style={styles.bold}>✓ Selected: </Text>
            {selectedStartLocation.description}
          </Text>
        </View>
      )}

      {/* End Location */}
      <Text style={styles.label}>🏁 Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter destination"
        value={endQuery}
        onChangeText={(text) => {
          setEndQuery(text);
          setActiveInput("end");
          fetchSuggestions(text, "end");
        }}
      />
      {activeInput === "end" && endSuggestions.length > 0 && (
        <FlatList
          data={endSuggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSuggestion}
          style={styles.suggestionList}
        />
      )}

      {/* Selected Destination */}
      {selectedEndLocation && (
        <View style={styles.selectedLocation}>
          <Text style={styles.selectedText}>
            <Text style={styles.bold}>✓ Selected: </Text>
            {selectedEndLocation.description}
          </Text>
        </View>
      )}

      {/* 🗺️ Routes Section */}
      {selectedStartLocation && selectedEndLocation && (
        <View style={styles.routesSection}>
          <View style={styles.routesSectionHeader}>
            <Text style={styles.routesSectionTitle}>🗺️ Choose Your Route</Text>
            {routes.length > 0 && (
              <Text style={styles.routesCount}>{routes.length} route{routes.length > 1 ? 's' : ''} found</Text>
            )}
          </View>
          
          {loadingRoutes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Finding best routes...</Text>
            </View>
          ) : routes.length > 0 ? (
            <FlatList
              data={routes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRouteCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.routesList}
            />
          ) : (
            <View style={styles.noRoutesContainer}>
              <Text style={styles.noRoutesIcon}>🚫</Text>
              <Text style={styles.noRoutesText}>No routes available</Text>
              <Text style={styles.noRoutesSubtext}>Try selecting different locations</Text>
            </View>
          )}
        </View>
      )}

      {/* Date & Time */}
      <Text style={styles.label}>📅 Ride Date</Text>
      <TouchableOpacity
        style={styles.input}
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

      <Text style={styles.label}>🕐 Ride Time</Text>
      <TouchableOpacity
        style={styles.input}
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
      <Text style={styles.label}>💺 Available Seats</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter available seats"
        keyboardType="numeric"
        value={availableSeats}
        onChangeText={setAvailableSeats}
      />

      {/* Submit */}
      <TouchableOpacity 
        style={[styles.submitButton, (!selectedRoute && routes.length > 0) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>
          {(!selectedRoute && routes.length > 0) ? "⚠️ Select a Route First" : "✅ Create Ride"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateRideScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    fontSize: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  suggestionList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 5,
    marginBottom: 10,
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionTitle: {
    fontWeight: "500",
    fontSize: 14,
    color: "#1a1a1a",
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedLocation: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  selectedText: {
    fontSize: 14,
    color: "#2e7d32",
  },
  bold: {
    fontWeight: "700",
  },
  // 🗺️ Routes Section Styles
  routesSection: {
    marginTop: 25,
    marginBottom: 15,
  },
  routesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  routesSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  routesCount: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  routesList: {
    paddingRight: 20,
  },
  routeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    width: 300,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  routeCardSelected: {
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff",
    transform: [{ scale: 1.02 }],
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  routeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  routeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  routeNumberSelected: {
    backgroundColor: "#007bff",
  },
  routeNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  routeNumberTextSelected: {
    color: "#fff",
  },
  routeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: "#4caf50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  routeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
  routeViaPoints: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ff9800",
  },
  viaPointsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ff6f00",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  viaPointsText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  warningText: {
    fontSize: 11,
    color: "#856404",
    flex: 1,
  },
  noRoutesContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  noRoutesIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  noRoutesText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  noRoutesSubtext: {
    color: "#bbb",
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 16,
    marginTop: 25,
    marginBottom: 20,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#ff9800",
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});