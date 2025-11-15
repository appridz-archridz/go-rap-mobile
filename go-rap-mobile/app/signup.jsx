import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import PressableButton from "../components/PressableButton";
import { inputField } from "../global-css";

const SignUp = () => {
  const selector = useSelector((state) => state.auth);

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

  // ✅ Validate individual field (used onChangeText)
  const validateField = (field, value) => {
    let errorMessage = "";

    if (field === "fullName") {
      if (!value.trim()) {
        errorMessage = "Full Name is required";
      }
    }

    if (field === "email") {
      if (!value.trim()) {
        errorMessage = "Email Address is required";
      } else if (
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())
      ) {
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

  const customStyles = {
    bgColor: "#2094F3",
    color: "#fff",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        <ScrollView>
          {/* Top Section */}
          <View style={styles.topContent}>
            <Image
              source={require("../assets/images/dummy-img.png")}
              style={styles.image}
              width={100}
              height={100}
            />
            <Text style={styles.heading}>Create Your GoRap Account</Text>
            <Text style={styles.caption}>
              Join our community for faster, safer, and smarter rides.
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputFields}>
            <View style={styles.container}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={inputField}
                placeholder="Full Name"
                placeholderTextColor="gray"
                value={detailsForm.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
                autoCapitalize="words"
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            <View style={styles.container}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={inputField}
                placeholder="email.address@example.com"
                placeholderTextColor="gray"
                value={detailsForm.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.container}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={inputField}
                placeholder="91XXXXXXXX"
                placeholderTextColor="gray"
                value={detailsForm.phone}
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(text) => handleChange("phone", text)}
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
              <Text style={styles.bottomText}>10-digit mobile number</Text>
            </View>
          </View>

          {/* Continue Button */}
          <View>
            <PressableButton
              customStyles={customStyles}
              text="Continue"
              rightArrow={true}
              onPress={navigateToSignUp2}
            />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  topContent: {
    marginBottom: 32,
  },
  heading: {
    color: "black",
    fontSize: 24,
    marginBottom: 8,
    fontFamily: "work-sans-bold",
    textAlign: "center",
  },
  caption: {
    color: "gray",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    paddingBottom: 50,
  },
  image: {
    justifyContent: "center",
    alignSelf: "center",
  },
  inputFields: {
    flex: 1,
    gap: 16,
  },
  container: {
    marginBottom: 8,
  },
  label: {
    color: "black",
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "work-sans-medium",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  bottomText: {
    color: "gray",
    fontSize: 12,
    paddingBottom: 36,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
});
