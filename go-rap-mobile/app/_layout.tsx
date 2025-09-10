import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../redux/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [fontsLoaded] = useFonts({
    "work-sans-regular": WorkSans_400Regular,
    "work-sans-medium": WorkSans_500Medium,
    "work-sans-bold": WorkSans_700Bold,
  });

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name='welcome' options={{ headerShown: false }} />
            <Stack.Screen name='signup' options={{ headerShown: true, headerTitleAlign: 'center', headerTitle: 'Sign Up' }} />
            <Stack.Screen name='signup-2' options={{ headerShown: true, headerTitle: 'Sign Up', headerTitleAlign: 'center' }} />
            <Stack.Screen name='create-ride' options={{ headerShown: true, headerTitle: 'Create Ride', headerTitleAlign: 'center' }} />
            <Stack.Screen name='login' options={{ headerShown: true, headerTitle: 'Login', headerTitleAlign: 'center' }} />
            <Stack.Screen name='TermsAndConditions' options={{ headerShown: true, headerTitle: 'Terms & Conditions', headerTitleAlign: 'center' }} />
            <Stack.Screen name='PrivacyPolicy' options={{ headerShown: true, headerTitle: 'Privacy Policy', headerTitleAlign: 'center' }} />
            <Stack.Screen name='forgot-password' options={{ headerShown: true, headerTitle: 'Forgot Password', headerTitleAlign: 'center' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}



