import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function CreateRide() {
  const now = new Date();
  const [form, setForm] = useState({
    pickupLocation: "",
    dropLocation: "",
    date: now.toISOString().split("T")[0],
    time: `${now.getHours()}:${now.getMinutes()}`,
    vechicleType: "",
    availableSeats: 0,
    totalSeats: "",
    status: "",
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView>
          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.inputContainer}>
            {/* <Image style={styles.icon} source={require("../assets/images/location.png")} /> */}
            <TextInput
              style={styles.input}
              placeholder="Enter pickup location"
              value={form.pickupLocation}
              onChangeText={(text) => setForm({ ...form, pickupLocation: text })}
            />
          </View>
          <Text style={styles.label}>Drop Location</Text>
          <View style={styles.inputContainer}>
            {/* <Image style={styles.icon} source={require("../assets/images/location.png")} /> */}
            <TextInput
              style={styles.input}
              placeholder="Enter drop location"
              value={form.dropLocation}
              onChangeText={(text) => setForm({ ...form, dropLocation: text })}
            />
          </View>
          <Text style={styles.label}>Date</Text>
          <View style={styles.inputContainer}>
            {/* <Image style={styles.icon} source={require("../assets/images/calendar.png")} /> */}
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={form.date}
              onChangeText={(text) => setForm({ ...form, date: text })}
            />
          </View>
          <Text style={styles.label}>Time</Text>
          <View style={styles.inputContainer}>
            <Image style={styles.icon} source={require("../../assets/images/clock.png")} />
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={form.time}
              onChangeText={(text) => setForm({ ...form, time: text })}
            />
          </View>
          {/* <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.inputContainer}>
        <Image style={styles.icon} source={require("../assets/images/sportbike.png")} />
        <Picker
          selectedValue={form.vechicleType}
          onValueChange={(itemValue) => setForm({ ...form, vechicleType: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Car" value="Car" />
          <Picker.Item label="Bike" value="Bike" />
          <Picker.Item label="Auto" value="Auto" />
        </Picker>
      </View> */}
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <Image style={styles.icon} source={require("../../assets/images/location.png")} />
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={form.amount}
              onChangeText={(text) => setForm({ ...form, amount: text })}
            />
          </View>
          {/* <Text style={styles.label}>Total Seats</Text>
      <View style={styles.inputContainer}>
        <Image style={styles.icon} source={require("../assets/images/user.png")} />
        <TextInput
          style={styles.input}
          placeholder="Enter total seats"
          value={form.totalSeats}
          onChangeText={(text) => setForm({ ...form, totalSeats: text })}
        />
      </View> */}
          {/* <Text style={styles.label}>Available Seats</Text>
      <View style={styles.seatsContainer}>
        <View style={styles.iconContainer}>
          <Image style={styles.icon} source={require("../assets/images/user.png")} />
          <Text style={styles.label}>Current:</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.seatButton}
            onPress={() => form.availableSeats > 0 && setForm({ ...form, availableSeats: form.availableSeats - 1 })}
          >
            <Text style={styles.seatButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.seatCount}>{form.availableSeats}</Text>
          <TouchableOpacity
            style={styles.seatButton}
            onPress={() => setForm({ ...form, availableSeats: form.availableSeats + 1 })}
          >
            <Text style={styles.seatButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View> */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.inputContainer}>
            <Picker
              mode="dropdown"
              style={styles.picker}
              selectedValue={form.status}
              onValueChange={(itemValue) => setForm({ ...form, status: itemValue })}
            >
              <Picker.Item label="Open" value="Open" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
          </View>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Create Ride</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginTop: 15,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: "#0057D9",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
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
  picker: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 0,
  },
});

