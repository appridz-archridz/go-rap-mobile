import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, FAB, Paragraph, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { getRidesByUser } from '../services/ride-service';

const UserRidesScreen = ({ route }) => {
  const userId = useSelector((state) => state.auth.userId);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await getRidesByUser(userId);
      setRides(response.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleEditRide= (rideId) => {
    // Navigate to the edit ride screen with the selected rideId
    router.push(`/create-ride/${rideId}`);
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const createRide = () => {
    router.push("/create-ride");
    // console.log('creretride');
    
  };

  const renderRide = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title="Ride Details"
        titleStyle={styles.cardTitle}
        left={(props) => <Avatar.Icon {...props} icon="car" style={styles.avatarIcon} />}
        right={(props) => (
          <Chip
            mode="outlined"
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}
          >
            {item.status}
          </Chip>
        )}
      />

      <Card.Content style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Avatar.Icon size={24} icon="map-marker" style={styles.detailIcon} />
          <Paragraph style={styles.detailText}>From: {item.source.split(",").slice(0, 2).join(",").trim()}</Paragraph>
        </View>
        <View style={styles.detailRow}>
          <Avatar.Icon size={24} icon="map-marker-check" style={styles.detailIcon} />
          <Paragraph style={styles.detailText}>To: {item.destination.split(",").slice(0, 2).join(",").trim()}</Paragraph>
        </View>
        <View style={styles.detailRow}>
          <Avatar.Icon size={24} icon="calendar-month-outline" style={styles.detailIcon} />
          <Paragraph style={styles.detailText}>
            Ride Date: {new Date(item.createdDate).toLocaleDateString()}
          </Paragraph>
        </View>
        <View style={styles.detailRow}>
          <Avatar.Icon size={24} icon="clock-time-four-outline" style={styles.detailIcon} />
          <Paragraph style={styles.detailText}>
            Ride Time: {item.rideTime}
          </Paragraph>
        </View>
      </Card.Content>

      {/* <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          onPress={handleEditRide}
          style={styles.editButton}
          labelStyle={styles.buttonLabel}
        >
          Edit Ride
        </Button>
      </Card.Actions> */}
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50'; // Green
      case 'completed':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#FF9800'; // Orange
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0051a8" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200EE']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={64} icon="car-off" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No rides created yet. Start by adding one!</Text>
          </View>
        }
        contentContainerStyle={rides.length === 0 ? styles.emptyList : null}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => createRide()}
      />
    </View>
  );
};

export default UserRidesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#0051a8", // Purple accent
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  avatarIcon: {
    backgroundColor: '#0051a8'
  },
  statusChip: {
    marginRight: 16,
    borderColor: '#ffffff',
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailIcon: {
    backgroundColor: '#E1F5FE',
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    backgroundColor: '#0051a8',
    borderRadius: 25,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0051a8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    backgroundColor: '#BDBDBD',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#757575",
    marginTop: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0051a8',
  },
});
