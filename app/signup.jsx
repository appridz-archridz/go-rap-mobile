import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PressableButton from "../components/PressableButton";
import { theme, typography } from "../constants/theme";

const SignUp = () => {
  const [detailsForm, setDetailsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const validateField = (field, value) => {
    let errorMessage = "";

    if (field === "fullName" && !value.trim()) {
      errorMessage = "Full Name is required";
    }

    if (field === "email") {
      if (!value.trim()) {
        errorMessage = "Email Address is required";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
        errorMessage = "Please enter a valid Email Address";
      }
    }

    if (field === "phone") {
      if (!value.trim()) {
        errorMessage = "Phone Number is required";
      } else if (!/^\d+$/.test(value.trim())) {
        errorMessage = "Phone Number must contain only digits";
      } else if (value.trim().length !== 10) {
        errorMessage = "Phone Number must be exactly 10 digits";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };

  const validate = () => {
    let allValid = true;

    Object.keys(detailsForm).forEach((field) => {
      validateField(field, detailsForm[field]);
      if (detailsForm[field].trim() === "" || errors[field]) {
        allValid = false;
      }
    });

    return allValid;
  };

  const handleChange = (name, value) => {
    setDetailsForm({ ...detailsForm, [name]: value });
    validateField(name, value);
  };

  const navigateToSignUp2 = () => {
    if (validate()) {
      router.push({
        pathname: "/signup-2",
        params: {
          fullName: detailsForm.fullName,
          email: detailsForm.email,
          phone: detailsForm.phone,
        },
      });
    }
  };

  const renderField = (label, icon, key, placeholder, extraProps = {}) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={detailsForm[key]}
          onChangeText={(text) => handleChange(key, text)}
          {...extraProps}
        />
      </View>
      {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
      {key === "phone" ? <Text style={styles.helperText}>10-digit mobile number</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.keyboardContainer} enableOnAndroid extraScrollHeight={50}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/gorap-logo-bg-white.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.eyebrow}>Step 1 of 2</Text>
            <Text style={styles.heading}>Create your GoRAP account</Text>
            <Text style={styles.caption}>Start with the basics so we can personalize your ride experience.</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>

          <View style={styles.formCard}>
            {renderField("Full Name", "person-outline", "fullName", "Full Name", {
              autoCapitalize: "words",
            })}
            {renderField("Email Address", "mail-outline", "email", "email.address@example.com", {
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
            })}
            {renderField("Phone Number", "call-outline", "phone", "91XXXXXXXX", {
              keyboardType: "phone-pad",
              maxLength: 10,
            })}
          </View>

          <PressableButton text="Continue" rightArrow onPress={navigateToSignUp2} />
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 88,
    marginBottom: theme.spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: theme.colors.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  heading: {
    ...typography.headingLg,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 22,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  inputShell: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: theme.spacing.sm,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  helperText: {
    ...typography.bodySm,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: "work-sans-regular",
    fontSize: theme.fontSizes.xs,
  },
});
