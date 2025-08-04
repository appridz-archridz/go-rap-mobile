
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Redirect } from 'expo-router';

export default function App() {
  return (
    <Redirect href={'/(tabs)'} />
  );
}
