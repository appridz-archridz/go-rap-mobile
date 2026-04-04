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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import FilePicker from "../components/FilePicker";
import { createVehicle, getVehicleById, updateVehicle } from "../services/vehicle-service";
import { theme } from "../constants/theme";

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
  const [showInsuranceExpiryPicker, setShowInsuranceExpiryPicker] = useState(false);
  const [showPucExpiryPicker, setShowPucExpiryPicker] = useState(false);
  const [showPermitExpiryPicker, setShowPermitExpiryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vehicleId, returnTo } = useLocalSearchParams();
  const isEdit = !!vehicleId;
  const userId = useSelector((state) => state.auth.userId);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (field, event, selectedDate) => {
    const currentDate = selectedDate || formData[field];
    setFormData({ ...formData, [field]: currentDate });
    setShowDlExpiryPicker(false);
    setShowInsuranceExpiryPicker(false);
    setShowPucExpiryPicker(false);
    setShowPermitExpiryPicker(false);
  };

  const validateVehicle = (vehicleNumber) => {
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    return vehicleRegex.test(vehicleNumber.toUpperCase());
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      if (!formData.vehicleType || !formData.vehicleNumber || !formData.dlNumber || !formData.consentGiven) {
        Alert.alert("Error", "Please fill all mandatory fields and give consent.");
        return;
      }

      if (!validateVehicle(formData.vehicleNumber)) {
        Alert.alert("Error", "Invalid vehicle number. Please check and try again.");
        return;
      }

      setIsSubmitting(true);

      const payload = {
        ...formData,
        vehicleFrontPhotoUrl: formData.vehicleFrontPhoto?.uri || null,
      };

      const response = isEdit ? await updateVehicle(vehicleId, payload) : await createVehicle(userId, payload);

      if (response.status === 201 || response.status === 200) {
        const successMessage = isEdit ? "Vehicle updated successfully!" : "Vehicle created successfully!";
        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => {
              if (returnTo === "create-ride") {
                router.push("/create-ride");
              } else if (isEdit) {
                router.back();
              } else {
                router.push("/create-ride");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit vehicle information. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const { data } = await getVehicleById(vehicleId);

        if (data.success && data.data) {
          const vehicle = data.data;
          const hasAdditionalInfo = !!(
            vehicle.insurancePolicyNumber ||
            vehicle.pucNumber ||
            vehicle.permitNumber ||
            vehicle.idProofNumber ||
            vehicle.vehicleFrontPhotoUrl
          );

          setShowAdditionalInfo(hasAdditionalInfo);
          setFormData({
            vehicleType: vehicle.vehicleType || "Car",
            vehicleNumber: vehicle.vehicleNumber || "",
            dlNumber: vehicle.dlNumber || "",
            dlExpiry: vehicle.dlExpiry ? new Date(vehicle.dlExpiry) : new Date(),
            insurancePolicyNumber: vehicle.insurancePolicyNumber || "",
            insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : new Date(),
            isCommercialInsurance: vehicle.isCommercialInsurance || false,
            pucNumber: vehicle.pucNumber || "",
            pucExpiry: vehicle.pucExpiry ? new Date(vehicle.pucExpiry) : new Date(),
            permitNumber: vehicle.permitNumber || "",
            permitExpiry: vehicle.permitExpiry ? new Date(vehicle.permitExpiry) : new Date(),
            idProofNumber: vehicle.idProofNumber || "",
            vehicleFrontPhoto: vehicle.vehicleFrontPhotoUrl ? { uri: vehicle.vehicleFrontPhotoUrl } : null,
            consentGiven: vehicle.consentGiven || false,
          });
        }
      } catch (_error) {
        Alert.alert("Error", "Failed to load vehicle information.");
      }
    };

    if (isEdit && vehicleId) {
      loadVehicle();
    }
  }, [isEdit, vehicleId]);

  const renderInput = (label, value, onChangeText, placeholder, key, extraProps = {}) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          {...extraProps}
        />
        {value?.length ? (
          <TouchableOpacity onPress={() => handleInputChange(key, "")}>
            <FontAwesome name="times-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.headerCard}>
              <Text style={styles.eyebrow}>{isEdit ? "Update vehicle" : "Vehicle onboarding"}</Text>
              <Text style={styles.title}>{isEdit ? "Edit vehicle details" : "Add vehicle information"}</Text>
              <Text style={styles.subtitle}>
                Keep your vehicle profile complete so rides can be created without friction.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                  <Picker.Item label="Car" value="Car" />
                  <Picker.Item label="Bike" value="Bike" />
                  <Picker.Item label="Bus" value="Bus" />
                  <Picker.Item label="Auto" value="Auto" />
                </Picker>
              </View>
              {renderInput(
                "Vehicle Number *",
                formData.vehicleNumber,
                (value) => handleInputChange("vehicleNumber", value.toUpperCase()),
                "e.g. TS16EN9XXX",
                "vehicleNumber",
                { autoCapitalize: "characters" }
              )}
              {renderInput(
                "DL Number *",
                formData.dlNumber,
                (value) => handleInputChange("dlNumber", value),
                "e.g. TS0920110012345",
                "dlNumber"
              )}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>DL Expiry *</Text>
                <TouchableOpacity style={styles.dateField} onPress={() => setShowDlExpiryPicker(true)} activeOpacity={0.85}>
                  <Text style={styles.dateText}>{formData.dlExpiry.toDateString()}</Text>
                  <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {!showAdditionalInfo ? (
              <TouchableOpacity style={styles.moreButton} onPress={() => setShowAdditionalInfo(true)} activeOpacity={0.85}>
                <FontAwesome name="plus-circle" size={18} color={theme.colors.primary} />
                <Text style={styles.moreButtonText}>Add documents and insurance</Text>
              </TouchableOpacity>
            ) : null}

            {showAdditionalInfo ? (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Documents</Text>
                  {renderInput(
                    "Insurance Policy Number",
                    formData.insurancePolicyNumber,
                    (value) => handleInputChange("insurancePolicyNumber", value),
                    "Enter insurance policy number",
                    "insurancePolicyNumber"
                  )}
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>Insurance Expiry</Text>
                    <TouchableOpacity style={styles.dateField} onPress={() => setShowInsuranceExpiryPicker(true)} activeOpacity={0.85}>
                      <Text style={styles.dateText}>{formData.insuranceExpiry.toDateString()}</Text>
                      <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.toggleCard}>
                    <Text style={styles.toggleLabel}>Commercial insurance</Text>
                    <TouchableOpacity
                      style={styles.toggleButton}
                      onPress={() => handleInputChange("isCommercialInsurance", !formData.isCommercialInsurance)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.toggleText}>{formData.isCommercialInsurance ? "Yes" : "No"}</Text>
                      <FontAwesome
                        name={formData.isCommercialInsurance ? "toggle-on" : "toggle-off"}
                        size={24}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  {renderInput(
                    "PUC Number",
                    formData.pucNumber,
                    (value) => handleInputChange("pucNumber", value),
                    "Enter PUC number",
                    "pucNumber"
                  )}
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>PUC Expiry</Text>
                    <TouchableOpacity style={styles.dateField} onPress={() => setShowPucExpiryPicker(true)} activeOpacity={0.85}>
                      <Text style={styles.dateText}>{formData.pucExpiry.toDateString()}</Text>
                      <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {renderInput(
                    "Permit Number",
                    formData.permitNumber,
                    (value) => handleInputChange("permitNumber", value),
                    "Enter permit number",
                    "permitNumber"
                  )}
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>Permit Expiry</Text>
                    <TouchableOpacity style={styles.dateField} onPress={() => setShowPermitExpiryPicker(true)} activeOpacity={0.85}>
                      <Text style={styles.dateText}>{formData.permitExpiry.toDateString()}</Text>
                      <FontAwesome name="calendar" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Insurance & Uploads</Text>
                  {renderInput(
                    "ID Proof Number",
                    formData.idProofNumber,
                    (value) => handleInputChange("idProofNumber", value),
                    "Enter ID proof number",
                    "idProofNumber"
                  )}
                  <Text style={styles.fieldLabel}>Vehicle Front Photo</Text>
                  <View style={styles.uploadWrap}>
                    <FilePicker
                      onFileSelected={(file) => {
                        setFormData({ ...formData, vehicleFrontPhoto: file });
                      }}
                    />
                  </View>
                  {formData.vehicleFrontPhoto ? (
                    <Image source={{ uri: formData.vehicleFrontPhoto.uri }} style={styles.photoPreview} resizeMode="cover" />
                  ) : null}
                </View>
              </>
            ) : null}

            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => handleInputChange("consentGiven", !formData.consentGiven)}
                activeOpacity={0.85}
              >
                <FontAwesome
                  name={formData.consentGiven ? "check-square-o" : "square-o"}
                  size={22}
                  color={theme.colors.primary}
                />
                <Text style={styles.consentText}>
                  I give consent for the processing of my personal data as per the terms and conditions. *
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPad} />

            {showDlExpiryPicker ? (
              <DateTimePicker
                value={formData.dlExpiry}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => handleDateChange("dlExpiry", event, date)}
              />
            ) : null}
            {showInsuranceExpiryPicker ? (
              <DateTimePicker
                value={formData.insuranceExpiry}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => handleDateChange("insuranceExpiry", event, date)}
              />
            ) : null}
            {showPucExpiryPicker ? (
              <DateTimePicker
                value={formData.pucExpiry}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => handleDateChange("pucExpiry", event, date)}
              />
            ) : null}
            {showPermitExpiryPicker ? (
              <DateTimePicker
                value={formData.permitExpiry}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => handleDateChange("permitExpiry", event, date)}
              />
            ) : null}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : isEdit ? "Update vehicle info" : "Submit vehicle info"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xxxl,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  fieldWrap: {
    marginTop: theme.spacing.md,
  },
  fieldLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.white,
  },
  inputShell: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  dateField: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
  },
  dateText: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  moreButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
  },
  moreButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  toggleCard: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontFamily: "work-sans-medium",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  toggleText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  uploadWrap: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  consentText: {
    flex: 1,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  bottomPad: { height: 96 },
  stickyFooter: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  submitButton: {
    minHeight: 54,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: "work-sans-bold",
    fontSize: theme.fontSizes.lg,
    color: theme.colors.white,
  },
});

export default VehicleInfoFormScreen;
