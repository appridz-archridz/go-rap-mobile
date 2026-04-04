import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import { theme } from "../../constants/theme";

const renderTabIcon = (activeName, inactiveName, props) => (
  <Ionicons
    name={props.focused ? activeName : inactiveName}
    size={props.size}
    color={props.color}
  />
);

export default function TabLayout() {
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarStyle: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 0,
        height: 68,
        paddingTop: 8,
        paddingBottom: 8,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 10,
      },
      tabBarLabelStyle: {
        fontFamily: "work-sans-medium",
        fontSize: theme.fontSizes.xs,
      },
    }),
    []
  );

  const searchOptions = useMemo(
    () => ({
      title: "Find Ride",
      tabBarIcon: (props) => renderTabIcon("search", "search-outline", props),
    }),
    []
  );

  const createRideOptions = useMemo(
    () => ({
      title: "Offer Ride",
      tabBarIcon: (props) => renderTabIcon("add-circle", "add-circle-outline", props),
    }),
    []
  );

  const requestedRidesOptions = useMemo(
    () => ({
      title: "Ride Requests",
      tabBarIcon: (props) => renderTabIcon("git-compare", "git-compare-outline", props),
    }),
    []
  );

  const activityOptions = useMemo(
    () => ({
      title: "My Activity",
      tabBarIcon: (props) => renderTabIcon("reader", "reader-outline", props),
    }),
    []
  );

  const profileOptions = useMemo(
    () => ({
      title: "Profile",
      tabBarIcon: (props) => renderTabIcon("person", "person-outline", props),
    }),
    []
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="search-ride" options={searchOptions} />
      <Tabs.Screen name="create-ride" options={createRideOptions} />
      <Tabs.Screen name="explore-request-ride" options={requestedRidesOptions} />
      <Tabs.Screen name="activity" options={activityOptions} />
      <Tabs.Screen name="profile" options={profileOptions} />
    </Tabs>
  );
}
