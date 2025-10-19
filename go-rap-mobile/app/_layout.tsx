import { useColorScheme } from "@/hooks/useColorScheme";
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../redux/store";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "work-sans-regular": WorkSans_400Regular,
    "work-sans-medium": WorkSans_500Medium,
    "work-sans-bold": WorkSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const navigateTo = () => {
    router.push('/profile');
  }

  const screenOptions = (title: string) => ({
    headerShown: false,
    headerTitle: title,
    headerTitleAlign: 'center',
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {/* <ThemeProvider> */}
              <Stack screenOptions={{ headerShown: true, headerTitleAlign: "center" }}>
                <Stack.Screen name="welcome" options={screenOptions("Welcome")} />
                <Stack.Screen name="signup" options={screenOptions("Sign Up")} />
                <Stack.Screen name="signup-2" options={screenOptions("Sign Up")} />
                <Stack.Screen name="create-ride" options={screenOptions("Create Ride")} />
                <Stack.Screen name="login" options={screenOptions("Login")} />
                <Stack.Screen name="TermsAndConditions" options={screenOptions("Terms & Conditions")} />
                <Stack.Screen name="PrivacyPolicy" options={screenOptions("Privacy Policy")} />
                <Stack.Screen name="forgot-password" options={screenOptions("Forgot Password")} />
                <Stack.Screen name="profile" options={screenOptions("Profile")} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="my-ride" options={screenOptions("My Rides")} />
              </Stack>
            {/* </ThemeProvider> */}
          </PersistGate>
        </Provider>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}
