import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import FilePicker from '../components/FilePicker';
import PressableButton from '../components/PressableButton';

const SignUp2 = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [lastChangedField, setLastChangedField] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const customStyles = { bgColor: '#2094F3', color: '#fff' };

  const validate = (field) => {
    let newErrors = { ...errors };

    if (!field || field === 'profilePic') {
      newErrors.profilePic = profilePic ? '' : 'Please upload a profile picture';
    }

    if (!field || field === 'password') {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else newErrors.password = '';
    }

    if (!field || field === 'confirmPassword') {
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      else newErrors.confirmPassword = '';
    }

    setErrors(newErrors);
    if (!field) return Object.values(newErrors).every(err => !err);
  };

  useEffect(() => {
    if (lastChangedField) validate(lastChangedField);
  }, [profilePic, password, confirmPassword, lastChangedField]);

  const handleSubmit = () => {
    if (validate()) router.push('/login');
  };

  const navigateToTermsAndCondition = () => {
    router.push('/TermsAndConditions');
  };

  const navigateToPrivacyPolicy = () => {
    router.push('/PrivacyPolicy');
  }

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
              <FilePicker onFileSelected={(file) => handleFileSelected(file)} />
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
                  onChangeText={(text) => { setPassword(text); setLastChangedField('password'); }}
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowPassword(prev => !prev)}
                >
                  <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
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
                  onChangeText={(text) => { setConfirmPassword(text); setLastChangedField('confirmPassword'); }}
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                >
                  <Text style={styles.showButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
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
    borderBottomColor: '#ECEBF0',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 60,
  },
  showButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
  },
  showButtonText: {
    color: '#2094F3',
    fontWeight: 'bold',
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

