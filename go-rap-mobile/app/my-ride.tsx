import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import PressableButton from "../components/PressableButton";

export default function myRide() {
  const [activeTab, setActiveTab] = useState(0);
  const [rideData, setRideData] = useState([]);

  const RideDetails = [
    {
      pickupLocation: "Hyderbad, Kondapur",
      dropLocation: "Khammam Bus Stop",
      date: "18-08-2025",
      time: "9:10 AM",
      vechicleType: "Car",
      avalaibleSeats: 3,
    },
    {
      pickupLocation: "Tiruvuru BUs Stop",
      dropLocation: "Hyderbad condapur",
      date: "20:08-2025",
      time: "10:15 PM",
      vechicleType: "Car",
      avalaibleSeats: 2,
    },
  ];

  const onTabChange = (tab: any) => {
    switch (tab) {
      case 0:
        setActiveTab(0);
        break;
      case 1:
        setActiveTab(1);
        break;
      case 2:
        setActiveTab(2);
        break;
      case 3:
        setActiveTab(3);
        break;
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text>My Ride</Text>
      <View style={styles.tabcontainer}>
        <Pressable
          onPress={() => onTabChange(0)}
          style={activeTab === 0 ? styles.activeTab : styles.inActiveTab}
        >
          <Text
            style={
              activeTab === 0 ? styles.activeTabText : styles.inActiveTabText
            }
          >
            Upcoming
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onTabChange(1)}
          style={activeTab === 1 ? styles.activeTab : styles.inActiveTab}
        >
          <Text
            style={
              activeTab === 1 ? styles.activeTabText : styles.inActiveTabText
            }
          >
            Ongoing
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onTabChange(2)}
          style={activeTab === 2 ? styles.activeTab : styles.inActiveTab}
        >
          <Text
            style={
              activeTab === 2 ? styles.activeTabText : styles.inActiveTabText
            }
          >
            Completed
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onTabChange(3)}
          style={activeTab === 3 ? styles.activeTab : styles.inActiveTab}
        >
          <Text
            style={
              activeTab === 3 ? styles.activeTabText : styles.inActiveTabText
            }
          >
            Cancelled
          </Text>
        </Pressable>
      </View>

      {RideDetails.map((item, index) => (
        <View key={index} style={styles.cardcontainer}>
          <View style={styles.ridecard}>
            <View style={styles.addresscontainer}>
              <View style={styles.address}>{item.pickupLocation}</View>-
              <View style={styles.address}>{item.dropLocation}</View>
            </View>
            <View style={styles.iconContainer}>
                  <Ionicons name="calendar" size={22} color="#0D48A0FF" />
                <Text >{item.date}</Text>
            </View>
             <View style={styles.iconContainer}>
                  <Ionicons name="time" size={22} color="#0D48A0FF" />
                <Text >{item.time}</Text>
            </View>
            <Text>{item.vechicleType}</Text>
            <Text>{item.avalaibleSeats}</Text>
            <View style={styles.buttoncontainer}>
              <PressableButton text="ViewDetails" />
              {activeTab === 0 && <PressableButton text="Cancel" />}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  tabcontainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    height: 40,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#F7F7F7FF",
    borderRadius: 8,
    justifyContent: "center",
  },
  iconContainer:{
    flexDirection: "row",
    alignItems:"center",
    gap:10
  },
  activeTab: {
    color: "#171A1FF",
    backgroundColor: "#FFFFFFFF",
    width: "23%",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
  },
  inActiveTab: {
    color: "#8C8D8BFF",
    backgroundColor: "#00000000",
    width: "23%",
    alignItems: "center",
  },
  activeTabText: {
    color: "#171A1F",
    fontWeight: "600",
  },

  inActiveTabText: {
    color: "#8C8D8B",
  },
  addresscontainer: {
    flexDirection: "row",
    width: "100%",
  },
  ridecard: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    gap:10,
    backgroundColor: '#FFFFFFFF',
    borderRadius: 12,
    borderColor: '#EBEBEAFF',
    boxShadow: '0px 0px 1px #171a1f12, 0px 0px 2px #171a1f1F',
  },
  buttoncontainer: {
    flexDirection: "row",
    gap: 10,
    width: 100,
  },
  cardcontainer: {
    flexDirection: "column",
    gap: 10,
  },
  address: {
    width: '50%',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#242524FF',
  },
});
