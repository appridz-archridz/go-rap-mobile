import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import PressableButton from "../components/PressableButton";
import { inputField } from "../global-css";

const SignUp = () => {
  const selector = useSelector((state) => state);

  const [lastChangedField, setLastChangedField] = useState(null);
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

  const handleChange = (name, value) => {
    setDetailsForm({ ...detailsForm, [name]: value });
    setLastChangedField(name);
  };

  useEffect(() => {
    if (lastChangedField) {
      validate(lastChangedField);
    }
  }, [detailsForm, lastChangedField]); // ✅ no setLastChangedField here

  useEffect(() => {
    console.log(selector.auth);
  }, [selector]);

  const validate = (field) => {
    let newErrors = { ...errors };

    if (!field || field === "fullName") {
      if (!detailsForm.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
      } else {
        newErrors.fullName = "";
      }
    }

    if (!field || field === "email") {
      if (!detailsForm.email.trim()) {
        newErrors.email = "Email Address is required";
      } else if (
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(detailsForm.email.trim())
      ) {
        newErrors.email = "Please enter a valid Email Address";
      } else {
        newErrors.email = "";
      }
    }

    if (!field || field === "phone") {
      if (!detailsForm.phone.trim()) {
        newErrors.phone = "Phone Number is required";
      } else if (!/^\d+$/.test(detailsForm.phone.trim())) {
        newErrors.phone = "Phone Number must contain only digits";
      } else if (detailsForm.phone.trim().length !== 10) {
        newErrors.phone = "Phone Number must be exactly 10 digits";
      } else {
        newErrors.phone = "";
      }
    }

    setErrors(newErrors);

    if (!field) {
      // ✅ Return true only if all fields are valid
      return Object.values(newErrors).every((err) => !err);
    }
  };

  const navigateToSignUp2 = () => {
    if (validate()) {
      router.push("/signup-2");
    }
  };

  const customStyles = {
    bgColor: "#2094F3",
    color: "#fff",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
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
      </KeyboardAvoidingView>
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
});
