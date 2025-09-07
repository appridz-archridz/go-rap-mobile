import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Theme object
const theme = {
  primary: '#2094F3',
  border: '#ECEBF0',
  text: {
    primary: 'black',
    secondary: 'gray',
    link: '#2094F3',
  },
  background: 'white',
  spacing: {
    small: 8,
    medium: 16,
    large: 20,
    extraLarge: 40,
  },
};

// Structured Privacy Policy content
const privacySections = [
  {
    heading: "1. Information We Collect",
    bullets: [
      "Personal information such as name, email, phone number, and profile picture.",
      "Ride-related information including pickup and drop-off locations, timing, and preferences.",
      "Device and usage information to improve app performance.",
    ],
  },
  {
    heading: "2. How We Use Information",
    bullets: [
      "To provide and manage your GoRap account and ride bookings.",
      "To communicate important updates, offers, or safety information.",
      "To improve our services and user experience.",
    ],
  },
  {
    heading: "3. Information Sharing",
    bullets: [
      "We do not sell your personal information to third parties.",
      "We may share information with service providers for operational purposes.",
      "Information may be disclosed if required by law or to protect legal rights.",
    ],
  },
  {
    heading: "4. Security",
    text: ["We implement reasonable measures to protect your personal information, but no method of transmission over the internet is completely secure."],
  },
  {
    heading: "5. Your Rights",
    bullets: [
      "Access and update your personal information.",
      "Request deletion of your account and personal data.",
      "Contact GoRap for any questions about your privacy.",
    ],
  },
  {
    heading: "6. Changes to this Policy",
    text: ["GoRap may update this Privacy Policy from time to time. Continued use of the app constitutes acceptance of any updates."],
  },
  {
    heading: "7. Contact Us",
    text: ["For any questions or concerns regarding your privacy:"],
    link: { text: "Email: support@gorap.com", url: "mailto:support@gorap.com" },
  },
];

const PrivacyPolicy = () => {
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((error) => console.error("Failed to open link:", error));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {privacySections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.date && <Text style={styles.date}>{section.date}</Text>}
            {section.heading && <Text style={styles.heading}>{section.heading}</Text>}
            {section.text?.map((t, i) => (
              <Text key={i} style={styles.paragraph}>{t}</Text>
            ))}
            {section.bullets && section.bullets.map((b, i) => (
              <Text key={i} style={styles.bullet}>• {b}</Text>
            ))}
            {section.link && (
              <TouchableOpacity onPress={() => handleLinkPress(section.link.url)}>
                <Text style={styles.link}>{section.link.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    padding: theme.spacing.large,
  },
  scrollContainer: {
    paddingBottom: theme.spacing.extraLarge,
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text.primary,
    marginBottom: theme.spacing.small,
  },
  date: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.text.primary,
    marginBottom: theme.spacing.small,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.text.primary,
    marginLeft: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  link: {
    fontSize: 14,
    color: theme.text.link,
    textDecorationLine: 'underline',
    marginTop: theme.spacing.small,
  },
});
