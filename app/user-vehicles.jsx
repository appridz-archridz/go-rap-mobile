import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getUserVehicles } from '../services/vehicle-service';

export default function ManageVehiclesScreen({ navigation, route }) {
  const selector = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  const fetchVehicles = async () => {
    try {
      const { data } = await getUserVehicles(selector.userId);
      const list = data?.data || [];
      console.log("list :",list)
      setVehicles(list);
      console.log("vehicles",vehicles)
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      fadeIn();
      animateFAB();
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const animateFAB = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleDeleteVehicle = (vehicleId) => {
    // Add your delete logic here
    console.log('Delete vehicle:', vehicleId);
    // You might want to show a confirmation dialog before deleting
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getVehicleIcon = (type) => {
    const icons = {
      'Car': 'car-sport',
      'Bike': 'bicycle',
      'Motorcycle': 'bicycle',
      'Truck': 'bus',
      'Van': 'car',
      'Scooter': 'bicycle',
    };
    return icons[type] || 'car';
  };

  const renderCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        }],
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
      }}
    >
      {/* Header - Compact Single Line */}
      <View
        style={{
          backgroundColor: '#1e3a8a',
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Side: Icon and Vehicle Type */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Icon */}
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name={getVehicleIcon(item.vehicleType)} size={22} color="#ffffff" />
          </View>
          
          {/* Vehicle Type */}
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: '#ffffff',
          }}>
            {item.vehicleType}
          </Text>
        </View>
        
        {/* Right Side: Vehicle Number */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
        }}>
          <Text style={{ 
            fontSize: 13, 
            fontWeight: '600', 
            color: '#ffffff',
            letterSpacing: 0.5,
          }}>
            {item.vehicleNumber}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={{ padding: 20 }}>
        {/* Driver's License Info */}
        <View style={{
          backgroundColor: '#dbeafe',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#1e3a8a',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}>
              <Ionicons name="card" size={14} color="#ffffff" />
            </View>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '600', 
              color: '#1e3a8a',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Driver's License
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                License Number
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
                {item.dlNumber}
              </Text>
            </View>
            <View style={{ 
              width: 1, 
              height: 30, 
              backgroundColor: '#93c5fd',
              marginHorizontal: 16,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                Expiry Date
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
                {item.dlExpiry}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditVehicle', { vehicleId: item.id })}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: '#16a34a',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: '#16a34a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="pencil" size={18} color="#ffffff" />
            <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '700', marginLeft: 6 }}>
              Edit
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => handleDeleteVehicle(item.id)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: '#dc2626',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: '#dc2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="trash" size={18} color="#ffffff" />
            <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '700', marginLeft: 6 }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eff6ff' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      {/* Header */}
      <View style={{ 
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#bfdbfe',
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '800',
          color: '#1e3a8a',
          marginBottom: 4,
        }}>
          My Vehicles
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b' }}>
          {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
        </Text>
      </View>

      {vehicles.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#dbeafe',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="car-sport" size={40} color="#1e3a8a" />
          </View>
          <Text style={{ 
            color: '#1e3a8a', 
            fontSize: 20, 
            fontWeight: '600',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            No Vehicles Yet
          </Text>
          <Text style={{ 
            color: '#64748b', 
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            Add your first vehicle to get started with managing your fleet
          </Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            padding: 20,
            paddingBottom: 100,
          }}
        />
      )}

      {/* Floating Action Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          transform: [{ scale: fabScale }],
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/vehicle-information")}
          activeOpacity={0.8}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#1e3a8a',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#1e3a8a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}