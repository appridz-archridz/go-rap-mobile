import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {

   const now = new Date();
   const [form, setForm] = useState({
    pickupLocation: "",
    dropLLocation: "",
    date: now.toISOString().split("T")[0],
    time: now.getHours() + ":" + now.getMinutes(),
    vechicleType: "",
    avalaibleSeats: 0,
  });

  return (  
    <ScrollView
      style={styles.container}
   
    >
      <Text style={styles.label}>Pickup Location</Text>
      <View style={styles.inputContainer}>
          <Image
          style={styles.icon}
          source={require("../assets/images/location.png")}
        />
        <input
          style={styles.input}
          placeholder="Enter pickup location"
          value={form.pickupLocation}
          onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
        />
      </View>
      <Text style={styles.label}>Drop Location</Text>
      <View style={styles.inputContainer}>
        <Image
          style={styles.icon}
          source={require("../assets/images/location.png")}
        />
        <input
          style={styles.input}
          placeholder="Enter drop location"
          value={form.dropLLocation}>
        </input>
      </View>
      <Text style={styles.label}>Date</Text>
      <View style={styles.inputContainer}>
         <Image
          style={styles.icon}
          source={require("../assets/images/calendar.png")}
        />
        <input
          style={styles.input}
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </View>
      <Text style={styles.label}>Time</Text>
      <View style={styles.inputContainer}>
         <Image
          style={styles.icon}
          source={require("../assets/images/clock.png")}
        />
        <input
          style={styles.input}
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </View>
      <Text style={styles.label}>Vechicle Type</Text>
      <View style={styles.inputContainer}>
         <Image
          style={styles.icon}
          source={require("../assets/images/sportbike.png")}
        />
        <input
          style={styles.input}
          placeholder="Enter vechicle type"
          value={form.vechicleType}
          onChange={(e) => setForm({ ...form, vechicleType: e.target.value })}
        />
      </View>
      <Text style={styles.label}>Available Seats</Text>
      <View style={styles.seatsContainer}>
        <View style={styles.iconContainer}>
          <Image
          style={styles.icon}
          source={require("../assets/images/user.png")}
        />
        <Text style={styles.label}>Current:</Text>
        </View>
        <View style={styles.iconContainer}>
        <View style={styles.seatButton}>
          <Text style={styles.seatButtonText} onPress={() => form.avalaibleSeats > 0 && setForm({ ...form, avalaibleSeats: form.avalaibleSeats - 1 })}>-</Text>
        </View>
        <Text style={styles.seatCount}>{form.avalaibleSeats}</Text>
        <View style={styles.seatButton}>
          <Text style={styles.seatButtonText} onPress={() => setForm({ ...form, avalaibleSeats: form.avalaibleSeats + 1 })}>+</Text>
        </View>
        </View>
      </View>
      <View style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Create Ride</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 6,
    marginTop: 15,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    borderWidth: 0,
    height: 40,
    outlineWidth: 0,
  },
  seatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
     borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  seatsLabel: {
    fontSize: 16,
    marginRight: 12,
    fontWeight: "600",
  },
  seatButton: {
    borderWidth: 1,
    borderColor: "#007aff",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
  },
  seatButtonText: {
    color: "#007aff",
    fontSize: 20,
    fontWeight: "bold",
  },
  seatCount: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#0051a8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});