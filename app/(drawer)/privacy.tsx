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
      <Text style={styles.date}>Last updated: November 7, 2025</Text>

      <Text style={styles.paragraph}>
        Your privacy is important to us. This privacy policy explains how
        AcousticOne ("we," "us," or "our") collects, uses, shares, and protects
        your information when you use our mobile application (the "App").
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect information about you in a variety of ways. The
        information we may collect via the App depends on the features you use.
      </Text>

      <Text style={styles.subHeading}>Information You Provide to Us</Text>
      <Text style={styles.paragraph}>
        We collect information you provide directly to us, such as when you
        create an account, update your profile, or communicate with us. This may
        include:
      </Text>
      <Text style={styles.listItem}>
        • Your name, email address, or username.
      </Text>
      <Text style={styles.listItem}>
        • Other information you choose to provide (e.g., feedback or support
        requests).
      </Text>

      <Text style={styles.subHeading}>Information Collected Automatically</Text>
      <Text style={styles.paragraph}>
        When you use the App, we may automatically collect certain information,
        including:
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Device Information:</Text> We may collect
        information about your mobile device, such as the device model,
        operating system version, and unique device identifiers.
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Usage Data:</Text> We collect anonymous data
        about your interaction with the App, such as the features you use,
        screens you visit, and crash reports. This helps us understand usage
        trends and fix bugs.
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Permissions-Based Information:</Text> If you
        grant permission, we may access your device's Bluetooth, microphone, or
        storage to provide core app functionality. We will only access this data
        to perform the actions you initiate.
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use the information we collect to:
      </Text>
      <Text style={styles.listItem}>
        • Provide, maintain, and improve the App.
      </Text>
      <Text style={styles.listItem}>
        • Personalize your experience (e.g., remembering your settings).
      </Text>
      <Text style={styles.listItem}>
        • Monitor and analyze usage and trends to improve functionality.
      </Text>
      <Text style={styles.listItem}>
        • Diagnose and fix technical issues and crashes.
      </Text>
      <Text style={styles.listItem}>
        • Respond to your comments, questions, and support requests.
      </Text>

      <Text style={styles.heading}>3. Sharing of Your Information</Text>
      <Text style={styles.paragraph}>
        We do not sell your personal information. We may share information as
        follows:
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>With Service Providers:</Text> We may share
        anonymous, aggregated data with third-party service providers who help
        us with analytics or app infrastructure (e.g., crash reporting).
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>For Legal Reasons:</Text> We may disclose
        information if required to do so by law or in response to valid requests
        by public authorities.
      </Text>

      <Text style={styles.heading}>4. Data Security</Text>
      <Text style={styles.paragraph}>
        We use administrative, technical, and physical security measures to help
        protect your personal information. While we have taken reasonable steps
        to secure the data you provide, no security system is impenetrable.
      </Text>

      <Text style={styles.heading}>5. Your Rights and Choices</Text>
      <Text style={styles.paragraph}>
        You have rights regarding your data. Depending on your jurisdiction, you
        may have the right to:
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Access and Update:</Text> You can review and
        change your account information at any time via the Profile page.
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Data Deletion:</Text> You may request
        deletion of your account and associated data by contacting us or using
        the in-app "Delete Account" feature.
      </Text>
      <Text style={styles.listItem}>
        • <Text style={styles.bold}>Device Permissions:</Text> You can change or
        revoke app permissions (e.g., Microphone) at any time through your
        device's settings.
      </Text>

      <Text style={styles.heading}>6. Children's Privacy</Text>
      <Text style={styles.paragraph}>
        Our services are not directed to individuals under the age of 13. We do
        not knowingly collect personal information from children under 13.
      </Text>

      <Text style={styles.heading}>7. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this privacy policy from time to time. We will notify you
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
