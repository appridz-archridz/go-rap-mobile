import * as Application from 'expo-application';
import * as Device from "expo-device";
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FilePicker from '../components/FilePicker';
import PressableButton from '../components/PressableButton';
import { signUp } from '../components/services/authService';
import { useSnackbar } from '../components/ui/SnackbarProvider';

const eyeOpen = require('../assets/images/eye-open.png');
const eyeClosed = require('../assets/images/eye-closed.png');

const SignUp2 = () => {
  const { fullName, email, phone } = useLocalSearchParams();

  const [profilePic, setProfilePic] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const customStyles = { bgColor: '#2094F3', color: '#fff' };

  const snackbar = useSnackbar();

  const validateField = (field, value) => {
    let message = '';

    if (field === 'profilePic') {
      if (!value) message = 'Please upload a profile picture';
    }

    if (field === 'password') {
      if (!value) message = 'Password is required';
      else if (value.length < 8) message = 'Password must be at least 8 characters';
    }

    if (field === 'confirmPassword') {
      if (!value) message = 'Please confirm your password';
      else if (value !== password) message = 'Passwords do not match';
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validate = () => {
    const fieldsToValidate = {
      profilePic,
      password,
      confirmPassword,
    };

    let allValid = true;

    Object.entries(fieldsToValidate).forEach(([field, value]) => {
      validateField(field, value);
      if (
        (field === 'profilePic' && !value) ||
        (field === 'password' && (!value || value.length < 8)) ||
        (field === 'confirmPassword' && (value !== password || !value))
      ) {
        allValid = false;
      }
    });

    return allValid;
  };

  const getDeviceInfo = async () => {
    const deviceId = Device.osName === 'iOS'
      ? await Application.getIosIdForVendorAsync()
      : Application.getAndroidId();

    const deviceInfo = {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      modelId: Device.modelId,
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceName: Device.deviceName,
      designName: Device.designName,
      productName: Device.productName,
      deviceType: Device.deviceType,
      isDevice: Device.isDevice,
      uniqueId: deviceId,
    };
    return deviceInfo;
  };

  const handleSubmit = async () => {
    console.log('handle submit');

    if (!validate()) return;

    try {
      const payload = {
        userName: fullName,
        email,
        password,
        phoneNumber: phone,
        address: '',
        role: 'USER',
        profilePic: profilePic?.uri,
        deviceName: (await getDeviceInfo()).uniqueId,
      };

      const { data } = (await signUp(payload));

      if (data && data?.success) {
        console.log('Done with signup');
        router.push('/login');
        snackbar.show('success', data?.message || 'Signup successful.');
      } else {
        snackbar.show('error', data?.message || 'Signup failed. Try again.');
      }
    } catch (error) {
      snackbar.show('error', error?.response?.data?.message || "Signup failed. Try again.");
    }
  };

  const navigateToTermsAndCondition = () => router.push('/TermsAndConditions');
  const navigateToPrivacyPolicy = () => router.push('/PrivacyPolicy');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.inputFields}>

            {/* Profile Pic */}
            <View style={styles.container}>
              <Text style={styles.label}>Upload Profile Pic</Text>
              <FilePicker
                onFileSelected={(file) => {
                  setProfilePic(file);
                  validateField('profilePic', file);
                }}
              />
              {errors.profilePic && <Text style={styles.error}>{errors.profilePic}</Text>}
            </View>

            {/* Password */}
            <View style={styles.container}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter a strong password"
                  placeholderTextColor="gray"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField('password', text);
                  }}
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Image
                    source={showPassword ? eyeClosed : eyeOpen}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.bottomText}>Use 8 or more characters</Text>
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.container}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="gray"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    validateField('confirmPassword', text);
                  }}
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Image
                    source={showConfirmPassword ? eyeClosed : eyeOpen}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
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
                <Text style={styles.linkText} onPress={navigateToTermsAndCondition}>Terms & Conditions</Text> and{" "}
                <Text style={styles.linkText} onPress={navigateToPrivacyPolicy}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAwareScrollView>
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
    justifyContent: 'space-between',
  },
  inputFields: {
    flex: 1,
    gap: 16,
  },
  container: {
    marginBottom: 8,
  },
  label: {
    color: 'black',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'work-sans-medium',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    borderColor: '#ECEBF0',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 48,
  },
  showButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 4,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: '#2094F3',
  },
  bottomText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 4,
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
    lineHeight: 18,
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
