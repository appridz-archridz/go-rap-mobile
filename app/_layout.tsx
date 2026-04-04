import { useColorScheme } from "@/hooks/useColorScheme";
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
import { useFonts } from "expo-font";
import { router, Stack, usePathname, useRootNavigationState, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SnackbarProvider } from "../components/ui/SnackbarProvider";
import { LoaderProvider } from "../components/ui/Loader";
import { RoutesModal } from "../components/RoutesModal";
import { persistor, store } from "../redux/store";

const PUBLIC_ROUTES = new Set([
  "welcome",
  "login",
  "signup",
  "signup-2",
  "forgot-password",
  "reset-password",
  "verify-otp",
  "TermsAndConditions",
  "PrivacyPolicy",
]);

function AppNavigator() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const segments = useSegments();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();
  const lastRedirectRef = useRef(null);

  useEffect(() => {
    if (!navigationState?.key) return;

    const firstSegment = segments[0];
    const isInTabs = firstSegment === "(tabs)";
    const isPublicRoute = !firstSegment || PUBLIC_ROUTES.has(firstSegment);

    let nextRoute = null;

    if (!isAuthenticated && (isInTabs || !isPublicRoute)) {
      nextRoute = "/login";
    } else if (isAuthenticated && (firstSegment === "login" || firstSegment === "welcome" || pathname === "/")) {
      nextRoute = "/search-ride";
    }

    if (!nextRoute) {
      lastRedirectRef.current = null;
      return;
    }

    if (pathname === nextRoute || lastRedirectRef.current === nextRoute) {
      return;
    }

    lastRedirectRef.current = nextRoute;
    router.replace(nextRoute);
  }, [isAuthenticated, navigationState?.key, pathname, segments]);

  const defaultScreenOptions = useMemo(
    () => ({
      headerShown: false,
      headerTitleAlign: "center",
    }),
    []
  );

  const rideDetailsOptions = useMemo(
    () => ({
      headerShown: true,
      headerTitle: "Ride Details",
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#003366",
      },
    }),
    []
  );

  const rideResultsOptions = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <>
      <StatusBar style="dark" translucent={false} />
      <Stack screenOptions={defaultScreenOptions}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signup-2" />
        <Stack.Screen name="login" />
        <Stack.Screen name="TermsAndConditions" />
        <Stack.Screen name="PrivacyPolicy" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="UserRidesScreen" options={{ headerShown: false }} />
        <Stack.Screen name="vehicle-information" options={{ headerShown: false }} />
        <Stack.Screen name="my-requested-ride" options={{ headerShown: false }} />
        <Stack.Screen name="request-ride" options={{ headerShown: false }} />
        <Stack.Screen name="user-vehicles" options={{ headerShown: false }} />
        <Stack.Screen name="ride-details" options={rideDetailsOptions} />
        <Stack.Screen name="ride-results" options={rideResultsOptions} />
      </Stack>
      <RoutesModal />
    </>
  );
}

export default function RootLayout() {
  useColorScheme();

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

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
          <LoaderProvider>
            <SnackbarProvider>
              <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <AppNavigator />
                </PersistGate>
              </Provider>
            </SnackbarProvider>
          </LoaderProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
