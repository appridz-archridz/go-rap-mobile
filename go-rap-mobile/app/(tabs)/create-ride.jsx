import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { RideService } from '../../services/ride-service';
import { locationService } from '../../services/thirdPartyApis';

export default function CreateRide() {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [rideDate, setRideDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rideTime, setRideTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableSeats, setAvailableSeats] = useState('1');
  const [status, setStatus] = useState(null);
  const [activeInput, setActiveInput] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  const userId = '';

  useEffect(() => {
    const fetchStartLocations = async () => {
      if (startQuery.length < 2) {
        setStartSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await locationService.search(startQuery);
        setStartSuggestions(results);
      } catch (error) {
        console.error('Start location fetch failed:', error);
        setStartSuggestions([]);
        Alert.alert('Error', 'Failed to fetch start location suggestions.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(fetchStartLocations, 400);
    return () => clearTimeout(timeout);
  }, [startQuery]);

  useEffect(() => {
    const fetchEndLocations = async () => {
      if (endQuery.length < 2) {
        setEndSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await locationService.search(endQuery);
        setEndSuggestions(results);
      } catch (error) {
        console.error('End location fetch failed:', error);
        setEndSuggestions([]);
        Alert.alert('Error', 'Failed to fetch end location suggestions.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(fetchEndLocations, 400);
    return () => clearTimeout(timeout);
  }, [endQuery]);

  const handleStartSelect = (location) => {
    setSelectedStartLocation(location);
    setStartQuery(location.display_name);
    setStartSuggestions([]);
    setActiveInput(null);
  };

  const handleEndSelect = (location) => {
    setSelectedEndLocation(location);
    setEndQuery(location.display_name);
    setEndSuggestions([]);
    setActiveInput(null);
  };

  const handleClear = () => {
    setStartQuery('');
    setEndQuery('');
    setStartSuggestions([]);
    setEndSuggestions([]);
    setSelectedStartLocation(null);
    setSelectedEndLocation(null);
    setRideDate(new Date());
    setRideTime(new Date());
    setAvailableSeats('1');
    setStatus(null);
    setActiveInput(null);
  };

  const handleSubmit = async () => {
    if (!selectedStartLocation) {
      Alert.alert('Error', 'Please select a start location.');
      return;
    }
    if (!selectedEndLocation) {
      Alert.alert('Error', 'Please select an end location.');
      return;
    }
    if (!rideDate) {
      Alert.alert('Error', 'Please select a ride date.');
      return;
    }
    if (!rideTime) {
      Alert.alert('Error', 'Please select a ride time.');
      return;
    }

    const rideDTO = {
      id: uuidv4(),
      startPoint: selectedStartLocation.display_name,
      startLatitude: parseFloat(selectedStartLocation.lat),
      startLongitude: parseFloat(selectedStartLocation.lon),
      destinationPoint: selectedEndLocation.display_name,
      destinationLatitude: parseFloat(selectedEndLocation.lat),
      destinationLongitude: parseFloat(selectedEndLocation.lon),
      rideDate: rideDate.toISOString().split('T')[0],
      rideTime: `${rideTime.getHours().toString().padStart(2, '0')}:${rideTime.getMinutes().toString().padStart(2, '0')}`,
      availableSeats: parseInt(availableSeats),
      viaPoints: [],
    };

    setIsLoading(true);
    try {
      const response = await RideService.createRide(userId, rideDTO);
      setStatus('✅ Ride created successfully');
      console.log('Response:', response.data);
      console.log('Payload sent:', rideDTO);
    } catch (err) {
      console.error('Error creating ride:', err?.response?.data || err.message);
      setStatus('❌ Failed to create ride');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestion}
      onPress={() => activeInput === 'start' ? handleStartSelect(item) : handleEndSelect(item)}
    >
      <Text style={styles.suggestionTitle}>
        {item.display_place || item.address?.name || 'Unknown'}
      </Text>
      <Text style={styles.suggestionSubtitle}>
        {item.display_address || item.display_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Create New Ride</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Start Location *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search start point"
                value={startQuery}
                onChangeText={(text) => {
                  setStartQuery(text);
                  setActiveInput('start');
                }}
                onFocus={() => setActiveInput('start')}
              />
            </View>
            {activeInput === 'start' && startSuggestions.length > 0 && (
              <FlatList
                data={startSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => index.toString()}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}
            {selectedStartLocation && (
              <View style={styles.selectedLocation}>
                <Text style={styles.selectedText}>
                  <Text style={styles.bold}>Selected Start: </Text>
                  {selectedStartLocation.display_name}
                </Text>
                <Text style={styles.selectedSubText}>
                  Lat: {selectedStartLocation.lat}, Lon: {selectedStartLocation.lon}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>End Location *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search destination"
                value={endQuery}
                onChangeText={(text) => {
                  setEndQuery(text);
                  setActiveInput('end');
                }}
                onFocus={() => setActiveInput('end')}
              />
            </View>
            {activeInput === 'end' && endSuggestions.length > 0 && (
              <FlatList
                data={endSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => index.toString()}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}
            {selectedEndLocation && (
              <View style={styles.selectedLocation}>
                <Text style={styles.selectedText}>
                  <Text style={styles.bold}>Selected Destination: </Text>
                  {selectedEndLocation.display_name}
                </Text>
                <Text style={styles.selectedSubText}>
                  Lat: {selectedEndLocation.lat}, Lon: {selectedEndLocation.lon}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ride Date *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.input}>
                {rideDate.toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={rideDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setRideDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ride Time *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.input}>
                {`${rideTime.getHours().toString().padStart(2, '0')}:${rideTime.getMinutes().toString().padStart(2, '0')}`}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={rideTime}
                mode="time"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setRideTime(selectedTime);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Available Seats *</Text>
            <View style={styles.inputContainer}>
              <Picker
                selectedValue={availableSeats}
                onValueChange={(itemValue) => setAvailableSeats(itemValue)}
                style={styles.picker}
              >
                {[...Array(8).keys()].map((i) => (
                  <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Ride</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {status && (
            <View style={[
              styles.statusContainer,
              { backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da' },
            ]}>
              <Text style={[
                styles.statusText,
                { color: status.includes('✅') ? '#155724' : '#721c24' },
              ]}>
                <Text style={styles.bold}>Status: </Text>
                {status}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  suggestionList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 8,
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  selectedLocation: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#155724',
  },
  selectedSubText: {
    fontSize: 12,
    color: '#155724',
  },
  bold: {
    fontWeight: '700',
  },
  picker: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  clearButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 14,
  },
});