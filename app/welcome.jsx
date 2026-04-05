import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PressableButton from "../components/PressableButton";
import { theme, typography } from "../constants/theme";
import { HelperService } from "../services/helper-service";

const Welcome = () => {
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          HelperService.setToken(token);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backdrop}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            style={styles.logo}
            source={require("../assets/images/gorap-logo-bg-white.png")}
            resizeMode="contain"
          />
          <Text style={styles.eyebrow}>GoRAP</Text>
          <Text style={styles.heading}>Your ride, your way</Text>
          <Text style={styles.caption}>
            A lighter way to search, share, and request rides around your city.
          </Text>
        </View>

        <View style={styles.actions}>
          <PressableButton text="Login" onPress={() => router.push("/login")} />
          <PressableButton
            text="Sign Up"
            onPress={() => router.push("/signup")}
            customStyles={{ variant: "outlined", color: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.bottomWave}>
        <View style={styles.waveLarge} />
        <View style={styles.waveSmall} />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFF3E8",
  },
  glowTop: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFE7D4",
  },
  glowBottom: {
    position: "absolute",
    bottom: 120,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFF8F0",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl,
  },
  hero: {
    marginTop: theme.spacing.xxxl,
    alignItems: "center",
  },
  logo: {
    width: 190,
    height: 115,
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    ...typography.label,
    color: theme.colors.primary,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  heading: {
    ...typography.headingXl,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  caption: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  actions: {
    gap: theme.spacing.md,
  },
  bottomWave: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    overflow: "hidden",
  },
  waveLarge: {
    position: "absolute",
    left: -30,
    right: -30,
    bottom: -30,
    height: 120,
    backgroundColor: "#FFE2CC",
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  waveSmall: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: -48,
    height: 120,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
});
