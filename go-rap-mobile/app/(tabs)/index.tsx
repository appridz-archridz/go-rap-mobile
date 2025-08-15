import { Link, router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <Link href="/login" style={styles.text}><Text>Hello Web</Text></Link> */}
       
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  text: {
    fontSize: 22,
    color: '#fff',
  },
});
