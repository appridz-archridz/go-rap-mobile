import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import FilePicker from '../components/FilePicker';
import PressableButton from '../components/PressableButton';

const SignUp2 = () => {

  customStyles = {
    bgColor: '#2094F3',
    color: '#fff'
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={90}
      >
        <ScrollView>
        <View style={styles.inputFields}>

          <View style={styles.container}>
            <Text style={styles.label}>Upload Profile Pic</Text>
            <FilePicker />
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Create Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a strong password"
              placeholderTextColor="gray"
            />
            <Text style={styles.bottomText}>Use 8 or more characters</Text>
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="gray"
            />
            <Text style={styles.bottomText}>Use 8 or more characters</Text>
          </View>
        </View>
        <View style={styles.button}>
          <PressableButton customStyles={customStyles} text="Sign Up Now" />
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp2;

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
  },
  button: {
    marginTop: 32
  }
});
