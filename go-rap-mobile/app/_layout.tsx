import { useColorScheme } from "@/hooks/useColorScheme";
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import { NativeBaseProvider } from 'native-base';
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SnackbarProvider } from "../components/ui/SnackbarProvider";
import { persistor, store } from "../redux/store";
import { RoutesModal } from './../components/RoutesModal';
import { LoaderProvider } from './../components/ui/Loader';

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
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
          <LoaderProvider>
            <SnackbarProvider>
              <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  {/* <ThemeProvider> */}
                  <StatusBar style="dark" translucent={false} />

                  <Stack screenOptions={{ headerShown: true, headerTitleAlign: "center" }}>
                    <Stack.Screen name="welcome" options={screenOptions("Welcome")} />
                    <Stack.Screen name="signup" options={screenOptions("Sign Up")} />
                    <Stack.Screen name="signup-2" options={screenOptions("Sign Up")} />
                    <Stack.Screen name="login" options={screenOptions("Login")} />
                    <Stack.Screen name="TermsAndConditions" options={screenOptions("Terms & Conditions")} />
                    <Stack.Screen name="PrivacyPolicy" options={screenOptions("Privacy Policy")} />
                    <Stack.Screen name="forgot-password" options={screenOptions("Forgot Password")} />
                    <Stack.Screen name="reset-password" options={screenOptions("Reset Password")} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="UserRidesScreen" options={{ title: "My Rides" }} />
                    <Stack.Screen name="vehicle-information" options={{ headerShown: false }} />
                    <Stack.Screen name="ride-details" options={{
                      headerShown: true, headerTitle: "Ride Details", headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#003366",
                      },
                    }} />
                    <Stack.Screen
                      name="ride-results"
                      options={{
                        headerShown: true,
                        headerTitle: "Available Rides",
                        headerStyle: {
                          backgroundColor: "#fff",
                        },
                        headerTitleStyle: {
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#003366",
                        },
                      }}
                    />
                  </Stack>
                  <RoutesModal />
                  {/* </ThemeProvider> */}
                </PersistGate>
              </Provider>
            </SnackbarProvider>
          </LoaderProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
})
