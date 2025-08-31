import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import FilePicker from '../components/FilePicker';
import PressableButton from '../components/PressableButton';

const SignUp2 = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const customStyles = {
    bgColor: '#2094F3',
    color: '#fff'
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!profilePic) {
      newErrors.profilePic = 'Please upload a profile picture';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // 🚀 Submit form (API call, etc.)
      Alert.alert('Success', 'Account created successfully!');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.inputFields}>

            {/* Profile Pic */}
            <View style={styles.container}>
              <Text style={styles.label}>Upload Profile Pic</Text>
              <FilePicker onFileSelected={setProfilePic} />
              {errors.profilePic && <Text style={styles.error}>{errors.profilePic}</Text>}
            </View>

            {/* Password */}
            <View style={styles.container}>
              <Text style={styles.label}>Create Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a strong password"
                placeholderTextColor="gray"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.bottomText}>Use 8 or more characters</Text>
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.container}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="gray"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Text style={styles.bottomText}>Use 8 or more characters</Text>
              {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.bottomContainer}>
            <View style={styles.button}>
              <PressableButton
                customStyles={customStyles}
                text="Sign Up Now"
                onPress={handleSubmit}
              />
            </View>
            <View style={styles.confirmTextContainer}>
              <Text style={styles.confirmText}>
                By clicking "Sign Up Now", you agree to our{" "}
                <Text style={styles.linkText}>Terms & Conditions</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 50,
    justifyContent: 'space-between'
  },
  inputFields: {
    flex: 1,
    gap: 16,
  },
  label: {
    color: 'black',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'work-sans-medium',
  },
  input: {
    width: '100%',
    borderBottomColor: '#ECEBF0',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomText: {
    color: 'gray',
    fontSize: 12,
  },
  button: {
    marginTop: 32,
  },
  bottomContainer: {
    gap: 10,
  },
  confirmTextContainer: {
    alignItems: 'center',
  },
  confirmText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    lineHeight: 16,
    width: '90%',
  },
  linkText: {
    color: '#2094F3',
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
