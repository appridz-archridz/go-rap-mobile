import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, TextInput as RNTextInput, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FilePicker from '../components/FilePicker';
import { clearButton, inputField, inputWithCross } from "../global-css";

const VehicleInfoFormScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    dlNumber: '',
    dlExpiry: new Date(),
    insurancePolicyNumber: '',
    insuranceExpiry: new Date(),
    isCommercialInsurance: false,
    pucNumber: '',
    pucExpiry: new Date(),
    permitNumber: '',
    permitExpiry: new Date(),
    idProofNumber: '',
    vehicleFrontPhoto: null,
    consentGiven: false,
  });

  const [showDlExpiryPicker, setShowDlExpiryPicker] = useState(false);
  const [showInsuranceExpiryPicker, setShowInsuranceExpiryPicker] = useState(false);
  const [showPucExpiryPicker, setShowPucExpiryPicker] = useState(false);
  const [showPermitExpiryPicker, setShowPermitExpiryPicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (field, event, selectedDate) => {
    const currentDate = selectedDate || formData[field];
    setFormData({ ...formData, [field]: currentDate });
    // Hide pickers
    setShowDlExpiryPicker(false);
    setShowInsuranceExpiryPicker(false);
    setShowPucExpiryPicker(false);
    setShowPermitExpiryPicker(false);
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.vehicleNumber || !formData.dlNumber || !formData.consentGiven) {
      Alert.alert('Error', 'Please fill in all mandatory fields and give consent.');
      return;
    }

    // Prepare payload with photo URI
    const payload = {
      ...formData,
      vehicleFrontPhotoUrl: formData.vehicleFrontPhoto?.uri,
    };

    // Here, you would typically send the data to your backend
    console.log('Submitting vehicle info:', payload);
    Alert.alert('Success', 'Vehicle information submitted successfully!');
    // Navigate back or to another screen
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Vehicle Information</Text>


          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Vehicle Number *</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter Vehicle Number"
                value={formData.vehicleNumber}
                onChangeText={(value) => handleInputChange('vehicleNumber', value)}
              />
              {formData.vehicleNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('vehicleNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>DL Number *</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter DL Number"
                value={formData.dlNumber}
                onChangeText={(value) => handleInputChange('dlNumber', value)}
              />
              {formData.dlNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('dlNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>DL Expiry *</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowDlExpiryPicker(true)}>
              <Text style={styles.dateText}>{formData.dlExpiry.toDateString()}</Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Insurance Details */}
          <Text style={styles.sectionTitle}>Insurance Details</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Insurance Policy Number</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter Insurance Policy Number"
                value={formData.insurancePolicyNumber}
                onChangeText={(value) => handleInputChange('insurancePolicyNumber', value)}
              />
              {formData.insurancePolicyNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('insurancePolicyNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Insurance Expiry</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowInsuranceExpiryPicker(true)}>
              <Text style={styles.dateText}>{formData.insuranceExpiry.toDateString()}</Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Is Commercial Insurance?</Text>
            <TouchableOpacity
              style={styles.toggleField}
              onPress={() => handleInputChange('isCommercialInsurance', !formData.isCommercialInsurance)}
            >
              <Text style={styles.toggleText}>{formData.isCommercialInsurance ? 'Yes' : 'No'}</Text>
              <FontAwesome name={formData.isCommercialInsurance ? 'toggle-on' : 'toggle-off'} size={24} color="#0051a8" />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* PUC Details */}
          <Text style={styles.sectionTitle}>PUC Details</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>PUC Number</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter PUC Number"
                value={formData.pucNumber}
                onChangeText={(value) => handleInputChange('pucNumber', value)}
              />
              {formData.pucNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('pucNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>PUC Expiry</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowPucExpiryPicker(true)}>
              <Text style={styles.dateText}>{formData.pucExpiry.toDateString()}</Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Permit Details */}
          <Text style={styles.sectionTitle}>Permit Details</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Permit Number</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter Permit Number"
                value={formData.permitNumber}
                onChangeText={(value) => handleInputChange('permitNumber', value)}
              />
              {formData.permitNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('permitNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Permit Expiry</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowPermitExpiryPicker(true)}>
              <Text style={styles.dateText}>{formData.permitExpiry.toDateString()}</Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Additional Details */}
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>ID Proof Number</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="Enter ID Proof Number"
                value={formData.idProofNumber}
                onChangeText={(value) => handleInputChange('idProofNumber', value)}
              />
              {formData.idProofNumber.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('idProofNumber', '')} style={clearButton}>
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Vehicle Front Photo</Text>
            <FilePicker
              onFileSelected={(file) => {
                setFormData({ ...formData, vehicleFrontPhoto: file });
              }}
            />
            {formData.vehicleFrontPhoto ? (
              <Image
                source={{ uri: formData.vehicleFrontPhoto.uri }}
                style={styles.photoPreview}
                resizeMode="contain"
              />
            ) : null}
          </View>

          <View style={styles.separator} />

          {/* Consent */}
          <View style={{ marginBottom: 15 }}>
            <TouchableOpacity
              style={styles.checkboxField}
              onPress={() => handleInputChange('consentGiven', !formData.consentGiven)}
            >
              <FontAwesome name={formData.consentGiven ? 'check-square-o' : 'square-o'} size={24} color="#0051a8" />
              <Text style={styles.consentText}>
                I give consent for the processing of my personal data as per the terms and conditions. *
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Vehicle Info</Text>
          </TouchableOpacity>

          {/* Date Pickers */}
          {showDlExpiryPicker && (
            <DateTimePicker
              value={formData.dlExpiry}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('dlExpiry', event, date)}
            />
          )}
          {showInsuranceExpiryPicker && (
            <DateTimePicker
              value={formData.insuranceExpiry}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('insuranceExpiry', event, date)}
            />
          )}
          {showPucExpiryPicker && (
            <DateTimePicker
              value={formData.pucExpiry}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('pucExpiry', event, date)}
            />
          )}
          {showPermitExpiryPicker && (
            <DateTimePicker
              value={formData.permitExpiry}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('permitExpiry', event, date)}
            />
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default VehicleInfoFormScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "bold", color: "#003366", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginVertical: 10 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 5 },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dateText: { fontSize: 15, color: "#000" },
  toggleField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  toggleText: { fontSize: 15, color: "#000" },
  checkboxField: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginVertical: 15,
  },
  consentText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginLeft: 8,
  },
  submitBtn: { backgroundColor: "#0051a8", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 15, marginBottom: 25 },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
