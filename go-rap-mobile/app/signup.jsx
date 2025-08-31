import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import PressableButton from '../components/PressableButton';
import { inputField } from '../global-css';

const SignUp = () => {

  const selector = useSelector((state) => state);
  const [detailsForm, setDetailsForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const handleChange = (name, value) => {
    setDetailsForm({ ...detailsForm, [name]: value })
  }

  useEffect(() => {
    console.log(selector.auth);
  }, [selector]);

  customStyles = {
    bgColor: '#2094F3',
    color: '#fff'
  }

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const validate = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
    };

    if (!detailsForm.fullName) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!detailsForm.email) {
      newErrors.email = 'Email Address is required';
    }

    if (!detailsForm.phone) {
      newErrors.phone = 'Phone Number is required';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };

  const navigateToSignUp2 = () => {
    // if (validate()) {
    router.push("/signup-2");
    // }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView>
          <View style={styles.topContent}>
            <Image source={require('../assets/images/dummy-img.png')} style={styles.image} width={100} height={100} />
            <Text style={styles.heading}>
              Create Your GoRap Account
            </Text>
            <Text style={styles.caption}>
              Join our community for faster, safer, and smarter rides.
            </Text>
          </View>
          <View style={styles.inputFields}>

            <View style={styles.container}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={inputField}
                placeholder="Full Name"
                placeholderTextColor="gray"
                value={detailsForm.fullName}
                name="fullName"
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
              {errors.fullName && <Text style={{ color: 'red' }}>{errors.fullName}</Text>}
            </View>

            <View style={styles.container}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={inputField}
                placeholder="email.address@example.com"
                placeholderTextColor="gray"
                value={detailsForm.email}
                name="email"
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
            </View>

            <View style={styles.container}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={inputField}
                placeholder="91XXXXXXXX"
                placeholderTextColor="gray"
                value={detailsForm.phone}
                name="phone"
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <Text style={{ color: 'red' }}>{errors.phone}</Text>}
              <Text style={styles.bottomText}>10-digit mobile number</Text>
            </View>

          </View>

          <View>
            <PressableButton customStyles={customStyles} text="Continue" rightArrow={true} onPress={navigateToSignUp2} />
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
    color: 'black',
    fontSize: 24,
    marginBottom: 8,
    fontFamily: 'work-sans-bold',
    textAlign: 'center',
  },
  caption: {
    color: 'gray',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    // marginTop: 50,
    padding: 20,
    paddingBottom: 50,
  },
  field: {
    width: '100%',
    borderBottomColor: '#ECEBF0',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    justifyContent: 'center',
    alignSelf: 'center'

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
  bottomText: {
    color: 'gray',
    fontSize: 12,
    paddingBottom: 36,
  },
  button: {
    marginTop: 32,
  }
});

