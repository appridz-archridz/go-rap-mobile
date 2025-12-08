import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Theme object
const theme = {
  primary: '#2094F3',
  border: '#ECEBF0',
  text: {
    primary: 'black',
    secondary: 'gray',
    error: 'red',
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

// Terms content structured
const termsSections = [
  {
    heading: "1. Acceptance of Terms",
    text: ["By accessing or using GoRap, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, do not use the app."]
  },
  {
    heading: "2. Eligibility",
    text: ["You must be at least 18 years old to use GoRap. By registering, you confirm that you meet this age requirement and have legal capacity to enter into these terms."]
  },
  {
    heading: "3. Account Registration",
    bullets: [
      "Provide accurate and complete information during registration.",
      "Keep your account credentials secure. You are responsible for any activity under your account.",
      "GoRap may suspend or terminate accounts that violate our rules or engage in fraudulent activity."
    ]
  },
  {
    heading: "4. Ride Posting & Booking",
    bullets: [
      "Users can post rides or book available rides.",
      "You agree to provide accurate ride details including pickup and drop-off points, timing, and seat availability.",
      "GoRap does not guarantee availability, safety, or punctuality of rides."
    ]
  },
  {
    heading: "5. User Responsibilities",
    bullets: [
      "Respect other users and their property.",
      "Follow all local traffic and safety regulations.",
      "Do not use GoRap for illegal or unauthorized purposes.",
      "Report inappropriate or unsafe behavior to GoRap immediately."
    ]
  },
  {
    heading: "6. Limitation of Liability",
    bullets: [
      "GoRap is a platform connecting riders and passengers.",
      "We are not responsible for accidents, injuries, or damages occurring during rides.",
      "Use the app at your own risk."
    ]
  },
  {
    heading: "7. Privacy",
    bullets: [
      "GoRap collects personal data to provide services.",
      "Review our Privacy Policy to understand how we handle your data."
    ]
  },
  {
    heading: "8. Modifications to Terms",
    bullets: [
      "GoRap may update these Terms & Conditions at any time.",
      "Continued use of the app after updates constitutes acceptance of the new terms."
    ]
  },
  {
    heading: "9. Termination",
    text: ["We may suspend or terminate access to the app for users who violate these terms or engage in harmful activities."]
  },
  {
    heading: "10. Governing Law",
    text: ["These Terms & Conditions are governed by the laws of India."]
  },
  {
    heading: "11. Contact Us",
    text: ["For questions or concerns regarding these Terms & Conditions:"],
    link: { text: "Email: support@gorap.com", url: "mailto:support@gorap.com" }
  }
];

const TermsAndConditions = () => {
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((error) => console.error("Failed to open link:", error));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {termsSections.map((section, index) => (
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
  );
};

export default TermsAndConditions;

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
