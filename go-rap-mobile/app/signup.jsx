import { router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PressableButton from '../components/PressableButton';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const SignUp = () => {
  
  const selector = useSelector((state) => state);
  
  useEffect(() => {
    console.log(selector.auth);
  }, [selector]);

  customStyles = {
    bgColor: '#2094F3',
    color: '#fff'
  }

  const navigateToSignUp2 = () => {
    router.push("/signup-2");
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
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="gray"
            />
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="email.address@example.com"
              placeholderTextColor="gray"
            />
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="91XXXXXXXX"
              placeholderTextColor="gray"
            />
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
    paddingBottom: 36,
  },
  button: {
    marginTop: 32,
  }
});
