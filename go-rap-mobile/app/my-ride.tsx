import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
      totalSeats: 4,
    },
    {
      pickupLocation: "Tiruvuru BUs Stop",
      dropLocation: "Hyderbad  Kondapur",
      date: "20:08-2025",
      time: "10:15 PM",
      vechicleType: "Car",
      avalaibleSeats: 2,
      totalSeats: 4,
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


  let customStyles = {
    bgColor: '#2094F3',
    color: '#fff',
    height: 0,
    padding: 20,
    fontSize: 16,
  }
  const editRide = () => {

  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Rides</Text>
      </View>
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

        {/* <Pressable
          onPress={() => onTabChange(1)}
          style={activeTab === 1 ? styles.activeTab : styles.inActiveTab}
        >
          <Text
            style={
              activeTab === 1 ? styles.activeTabText : styles.inActiveTabText
            }
          >
            Rider Cancel
          </Text>
        </Pressable> */}

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

        {/* <Pressable
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
        </Pressable> */}
      </View>

      {RideDetails.map((item, index) => (
        <View key={index} style={styles.cardcontainer}>
          <View style={styles.ridecard}>
            <View style={styles.addresscontainer}>
              <View style={styles.address}>{item.pickupLocation}</View>
              <View > <Ionicons name="arrow-forward" size={22} color="#0D48A0FF" /></View>
              <View style={styles.address}>{item.dropLocation}</View>
            </View>
            <View style={styles.timecontainer}>
              <View style={styles.iconContainer}>
                 <Image
                        style={styles.icon}
                        source={require("../assets/images/calendar.png")}
                      />
                <Text >{item.date}</Text>
              </View>
              <View style={styles.iconContainer}>
                 <Image
                        style={styles.icon}
                        source={require("../assets/images/clock.png")}
                      />
                <Text >{item.time}</Text>
              </View>
            </View>
            <View style={styles.viechleInfoContainer}>
              <View style={styles.infoContainer}>
                <Text style={styles.text} >Total Seats :</Text>
                <Text>{item.totalSeats}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.text} >Avalaible Seats :</Text>
                <Text>{item.avalaibleSeats}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.text} >Vechicle Type :</Text>
                <Text>{item.vechicleType}</Text>
              </View>
            </View>
          { activeTab === 0 && <View style={styles.buttoncontainer}>
              <PressableButton customStyles={customStyles} text="Edit Ride" onPress={editRide} />
              <PressableButton customStyles={customStyles} text="Cancel Ride" onPress={editRide} />
            </View>}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFFFFFFF",
    borderRadius: 0,
    boxShadow: "0px 0px 1px #171a1f12, 0px 0px 2px #171a1f1F",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#242524FF",
  },

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
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  activeTab: {
    color: "#171A1FF",
    backgroundColor: "#FFFFFFFF",
    width: "50%",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
  },
  inActiveTab: {
    color: "#8C8D8BFF",
    backgroundColor: "#00000000",
    width: "50%",
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
    padding: 15,
    gap: 10,
    backgroundColor: '#FFFFFFFF',
    borderRadius: 12,
    borderColor: '#EBEBEAFF',
    boxShadow: '0px 0px 1px #171a1f12, 0px 0px 2px #171a1f1F',
  },
  timecontainer: {
    borderBottomWidth: 1,
    borderColor: '#EBEBEAFF',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },

  buttoncontainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    justifyContent: "space-between",
    marginTop: 5,
  },
  cardcontainer: {
    flexDirection: "column",
    gap: 10,
  },
  address: {
    width: '50%',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242524FF',
  },
  viechleInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    gap: 5,
  }
  ,
  text: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: '#8C8D8BFF',
  },
    icon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: "#0057D9", // optional (blue like your screenshot)
  },
});
