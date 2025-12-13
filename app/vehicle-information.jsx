import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import FilePicker from "../components/FilePicker";
import { clearButton, inputField, inputWithCross } from "../global-css";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "../services/vehicle-service";

const VehicleInfoFormScreen = () => {
  const [formData, setFormData] = useState({
    vehicleType: "Car",
    vehicleNumber: "",
    dlNumber: "",
    dlExpiry: new Date(),
    insurancePolicyNumber: "",
    insuranceExpiry: new Date(),
    isCommercialInsurance: false,
    pucNumber: "",
    pucExpiry: new Date(),
    permitNumber: "",
    permitExpiry: new Date(),
    idProofNumber: "",
    vehicleFrontPhoto: null,
    consentGiven: false,
  });

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showDlExpiryPicker, setShowDlExpiryPicker] = useState(false);
  const [showInsuranceExpiryPicker, setShowInsuranceExpiryPicker] =
    useState(false);
  const [showPucExpiryPicker, setShowPucExpiryPicker] = useState(false);
  const [showPermitExpiryPicker, setShowPermitExpiryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vehicleId, returnTo } = useLocalSearchParams();
  const isEdit = !!vehicleId;
  const userId = useSelector((state) => state.auth.userId);

  const handleInputChange = (field, value) => {
    console.log("handleInputChange", field, value);
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

  const validateVehicle = (vehicleNumber) => {
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    return vehicleRegex.test(vehicleNumber.toUpperCase());
  }

  const validateDL = (dlNumber) => {
    const dlRegex = /^[A-Z]{2}\d{2}\d{4}\d{7}$/;
    return dlRegex.test(dlNumber.toUpperCase());
  }

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) return;

    try {
      if (
        !formData.vehicleType ||
        !formData.vehicleNumber ||
        !formData.dlNumber ||
        !formData.consentGiven
      ) {
        Alert.alert(
          "Error",
          "Please fill all mandatory fields and give consent."
        );
        return;
      }

      if (!validateVehicle(formData.vehicleNumber)) {
        Alert.alert("Error", "Invalid vehicle number. Please check and try again.");
        return;
      }

      // if (!validateDL(formData.dlNumber)) {
      //   Alert.alert("Error", "Invalid DL number. Please check and try again.");
      //   return;
      // }

      setIsSubmitting(true);

      const payload = {
        ...formData,
        vehicleFrontPhotoUrl: formData.vehicleFrontPhoto?.uri || null,
      };

      let response = isEdit
        ? await updateVehicle(vehicleId, payload)
        : await createVehicle(userId, payload);

      if (response.status === 201 || response.status === 200) {
        const successMessage = isEdit
          ? "Vehicle updated successfully!"
          : "Vehicle created successfully!";

        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on where user came from
              if (returnTo === "create-ride") {
                router.push("/create-ride");
              } else if (isEdit) {
                router.back();
              } else {
                // For new vehicle creation, go to create ride page
                router.push("/create-ride");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Submit failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
        "Failed to submit vehicle information. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const { data } = await getVehicleById(vehicleId);

        if (data.success && data.vehicle) {
          const hasAdditionalInfo = !!(
            data.vehicle.insurancePolicyNumber ||
            data.vehicle.pucNumber ||
            data.vehicle.permitNumber ||
            data.vehicle.idProofNumber ||
            data.vehicle.vehicleFrontPhotoUrl
          );

          setShowAdditionalInfo(hasAdditionalInfo);

          setFormData({
            vehicleType: data.vehicle.vehicleType || "Car",
            vehicleNumber: data.vehicle.vehicleNumber || "",
            dlNumber: data.vehicle.dlNumber || "",
            dlExpiry: data.vehicle.dlExpiry
              ? new Date(data.vehicle.dlExpiry)
              : new Date(),
            insurancePolicyNumber: data.vehicle.insurancePolicyNumber || "",
            insuranceExpiry: data.vehicle.insuranceExpiry
              ? new Date(data.vehicle.insuranceExpiry)
              : new Date(),
            isCommercialInsurance: data.vehicle.isCommercialInsurance || false,
            pucNumber: data.vehicle.pucNumber || "",
            pucExpiry: data.vehicle.pucExpiry
              ? new Date(data.vehicle.pucExpiry)
              : new Date(),
            permitNumber: data.vehicle.permitNumber || "",
            permitExpiry: data.vehicle.permitExpiry
              ? new Date(data.vehicle.permitExpiry)
              : new Date(),
            idProofNumber: data.vehicle.idProofNumber || "",
            vehicleFrontPhoto: data.vehicle.vehicleFrontPhotoUrl
              ? { uri: data.vehicle.vehicleFrontPhotoUrl }
              : null,
            consentGiven: data.vehicle.consentGiven || false,
          });
        }
      } catch (error) {
        console.error("Failed to load vehicle:", error);
        Alert.alert("Error", "Failed to load vehicle information.");
      }
    };

    if (isEdit && vehicleId) {
      loadVehicle();
    }
  }, [isEdit, vehicleId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isEdit ? "Edit Vehicle" : "Add Vehicle Information"}
          </Text>

          {/* Vehicle Type Dropdown */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Vehicle Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.vehicleType}
                onValueChange={(value) =>
                  handleInputChange("vehicleType", value)
                }
                style={styles.picker}
              >
                <Picker.Item label="Car" value="Car" />
                <Picker.Item label="Bike" value="Bike" />
                <Picker.Item label="Bus" value="Bus" />
                <Picker.Item label="Auto" value="Auto" />
              </Picker>
            </View>
          </View>

          {/* Vehicle Number */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>Vehicle Number *</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="e.g: TS16EN9XXX"
                value={formData.vehicleNumber}
                onChangeText={(value) =>
                  handleInputChange("vehicleNumber", value.toUpperCase())
                }
                autoCapitalize="characters"
              />
              {formData.vehicleNumber.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleInputChange("vehicleNumber", "")}
                  style={clearButton}
                >
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* DL Number */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>DL Number (Driving License Number)*</Text>
            <View style={inputWithCross}>
              <RNTextInput
                style={inputField}
                placeholder="e.g: TS0920110012345"
                value={formData.dlNumber}
                onChangeText={(value) => handleInputChange("dlNumber", value)}
              />
              {formData.dlNumber.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleInputChange("dlNumber", "")}
                  style={clearButton}
                >
                  <FontAwesome name="times-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* DL Expiry */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>DL Expiry *</Text>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowDlExpiryPicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.dlExpiry.toDateString()}
              </Text>
              <FontAwesome name="calendar" size={20} color="#0051a8" />
            </TouchableOpacity>
          </View>

          {/* Add More Information Button */}
          {!showAdditionalInfo && (
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => setShowAdditionalInfo(true)}
            >
              <FontAwesome name="plus-circle" size={20} color="#0051a8" />
              <Text style={styles.addMoreText}>
                Add More Information (Optional)
              </Text>
            </TouchableOpacity>
          )}

          {/* Additional Information Section */}
          {showAdditionalInfo && (
            <>
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
                    onChangeText={(value) =>
                      handleInputChange("insurancePolicyNumber", value)
                    }
                  />
                  {formData.insurancePolicyNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        handleInputChange("insurancePolicyNumber", "")
                      }
                      style={clearButton}
                    >
                      <FontAwesome name="times-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Insurance Expiry</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setShowInsuranceExpiryPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.insuranceExpiry.toDateString()}
                  </Text>
                  <FontAwesome name="calendar" size={20} color="#0051a8" />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Is Commercial Insurance?</Text>
                <TouchableOpacity
                  style={styles.toggleField}
                  onPress={() =>
                    handleInputChange(
                      "isCommercialInsurance",
                      !formData.isCommercialInsurance
                    )
                  }
                >
                  <Text style={styles.toggleText}>
                    {formData.isCommercialInsurance ? "Yes" : "No"}
                  </Text>
                  <FontAwesome
                    name={
                      formData.isCommercialInsurance
                        ? "toggle-on"
                        : "toggle-off"
                    }
                    size={24}
                    color="#0051a8"
                  />
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
                    onChangeText={(value) =>
                      handleInputChange("pucNumber", value)
                    }
                  />
                  {formData.pucNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleInputChange("pucNumber", "")}
                      style={clearButton}
                    >
                      <FontAwesome name="times-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>PUC Expiry</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setShowPucExpiryPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.pucExpiry.toDateString()}
                  </Text>
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
                    onChangeText={(value) =>
                      handleInputChange("permitNumber", value)
                    }
                  />
                  {formData.permitNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleInputChange("permitNumber", "")}
                      style={clearButton}
                    >
                      <FontAwesome name="times-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Permit Expiry</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setShowPermitExpiryPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.permitExpiry.toDateString()}
                  </Text>
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
                    onChangeText={(value) =>
                      handleInputChange("idProofNumber", value)
                    }
                  />
                  {formData.idProofNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleInputChange("idProofNumber", "")}
                      style={clearButton}
                    >
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
            </>
          )}

          {/* Consent */}
          <View style={{ marginBottom: 15 }}>
            <TouchableOpacity
              style={styles.checkboxField}
              onPress={() =>
                handleInputChange("consentGiven", !formData.consentGiven)
              }
            >
              <FontAwesome
                name={formData.consentGiven ? "check-square-o" : "square-o"}
                size={24}
                color="#0051a8"
              />
              <Text style={styles.consentText}>
                I give consent for the processing of my personal data as per the
                terms and conditions. *
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting
                ? "Submitting..."
                : isEdit
                  ? "Update Vehicle Info"
                  : "Submit Vehicle Info"}
            </Text>
          </TouchableOpacity>

          {/* Date Pickers */}
          {showDlExpiryPicker && (
            <DateTimePicker
              value={formData.dlExpiry}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) =>
                handleDateChange("dlExpiry", event, date)
              }
            />
          )}
          {showInsuranceExpiryPicker && (
            <DateTimePicker
              value={formData.insuranceExpiry}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) =>
                handleDateChange("insuranceExpiry", event, date)
              }
            />
          )}
          {showPucExpiryPicker && (
            <DateTimePicker
              value={formData.pucExpiry}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) =>
                handleDateChange("pucExpiry", event, date)
              }
            />
          )}
          {showPermitExpiryPicker && (
            <DateTimePicker
              value={formData.permitExpiry}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) =>
                handleDateChange("permitExpiry", event, date)
              }
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginVertical: 10,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEBF0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
  },
  toggleText: { fontSize: 15, color: "#000" },
  checkboxField: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginVertical: 15,
  },
  consentText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginLeft: 8,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f7ff",
    borderWidth: 1,
    borderColor: "#0051a8",
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 15,
    gap: 8,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0051a8",
  },
  submitBtn: {
    backgroundColor: "#0051a8",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },
  submitBtnDisabled: {
    backgroundColor: "#6b8db3",
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
