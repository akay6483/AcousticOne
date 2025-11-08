import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // For the style function type

export default function PrivacyPolicy() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Last updated: November 8, 2025</Text>

      <Text style={styles.paragraph}>
        Welcome to AcousticOne. Your privacy is important to us. This Privacy
        Policy explains how we collect, use, disclose, and safeguard your
        information when you use our mobile application (the "App").
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect information about you in a variety of ways. The
        information we may collect via the App includes:
      </Text>

      <Text style={styles.subHeading}>
        Information Collected via Permissions
      </Text>
      <Text style={styles.paragraph}>
        With your permission, we may access information from your device to
        provide core app functionality.
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Microphone (RECORD_AUDIO):</Text> We access
        the microphone solely to sample audio for the automatic genre detection
        feature. This audio is processed on-device and is not stored or
        transmitted.
      </Text>
      <Text style={styles.listItem}>
        •{" "}
        <Text style={styles.bold}>
          Location (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION):
        </Text>{" "}
        We require location access to read your WiFi network name (SSID). This
        is necessary to find and connect to your device on the network. We do
        not track or store your geographic location.
      </Text>
      <Text style={styles.listItem}>
        •{" "}
        <Text style={styles.bold}>
          Local Network & Wi-Fi (ACCESS_WIFI_STATE,
          NSLocalNetworkUsageDescription):
        </Text>{" "}
        We use this to discover and connect to your audio system hardware on
        your local network.
      </Text>

      <Text style={styles.subHeading}>Device and Usage Data</Text>
      <Text style={styles.paragraph}>
        We may automatically collect information such as your mobile device
        model, operating system version, IP address, and anonymous usage
        statistics to diagnose crashes and improve the App.
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use the information we collect to:
      </Text>
      <Text style={styles.listItem}>
        • Provide and manage the core functionality of the App.
      </Text>
      <Text style={styles.listItem}>
        • Diagnose and fix bugs, crashes, and other technical issues.
      </Text>
      <Text style={styles.listItem}>
        • Monitor and analyze usage trends to improve the App's interface and
        features.
      </Text>

      <Text style={styles.heading}>3. Sharing of Your Information</Text>
      <Text style={styles.paragraph}>
        We do not sell, trade, or rent your personal information. We may share
        anonymous, aggregated data with third-party service providers for
        analytics and crash reporting (e.g., Google Firebase) to help us improve
        the App.
      </Text>

      <Text style={styles.heading}>4. Data Security</Text>
      <Text style={styles.paragraph}>
        We use administrative, technical, and physical security measures to help
        protect your information. While we have taken reasonable steps to secure
        the data, please be aware that no security system is impenetrable.
      </Text>

      <Text style={styles.heading}>5. Your Rights and Choices</Text>
      <Text style={styles.paragraph}>
        You can control the information we access by managing the App's
        permissions in your device's settings menu.
      </Text>

      <Text style={styles.heading}>6. Children's Privacy</Text>
      <Text style={styles.paragraph}>
        This App is not intended for use by children under the age of 13. We do
        not knowingly collect personal information from children under 13.
      </Text>

      <Text style={styles.heading}>7. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new policy in the App and updating the
        "Last updated" date.
      </Text>

      <Text style={styles.heading}>8. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have questions or comments about this Privacy Policy, please
        contact us at: privacy@acousticone.app
      </Text>
    </ScrollView>
  );
}

// Dynamic styling function
const getStyles = (colors: typeof lightColors) => {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 40, // Ensure content doesn't hide behind tab bar
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    date: {
      fontSize: 14,
      color: colors.inactiveTint,
      marginBottom: 20,
      fontStyle: "italic",
    },
    heading: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    subHeading: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 12,
    },
    listItem: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 8,
      paddingLeft: 8,
    },
    bold: {
      fontWeight: "600",
    },
  });
};
