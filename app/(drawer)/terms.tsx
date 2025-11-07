import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // For the style function type

export default function TermsOfService() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Terms of Use</Text>
      <Text style={styles.date}>Last updated: November 7, 2025</Text>

      <Text style={styles.paragraph}>
        By downloading, accessing, or using the AcousticOne mobile application
        (the "App"), you agree to be bound by these Terms of Use ("Terms"). If
        you do not agree to these Terms, do not download or use the App.
      </Text>

      <Text style={styles.heading}>1. License and Authorization</Text>
      <Text style={styles.paragraph}>
        AcousticOne grants you a limited, non-exclusive, non-transferable,
        revocable license to use the App on a device that you own or control.
      </Text>
      <Text style={styles.paragraph}>
        This App is provided as an authorized companion interface for power
        amplifier systems (the "Hardware") manufactured by{" "}
        <Text style={styles.bold}>[Manufacturer Name]</Text> (the
        "Manufacturer"). Your use of this App is intended solely for controlling
        and managing the Hardware you own or are authorized to operate.
      </Text>

      <Text style={styles.heading}>2. App vs. Hardware Warranty</Text>
      <Text style={styles.paragraph}>
        The App and the Hardware are distinct products. The Manufacturer
        provides its own warranty and support for the physical Hardware as
        detailed in the documentation provided with your purchase. These Terms
        apply <Text style={styles.bold}>only</Text> to the App.
      </Text>

      <Text style={styles.heading}>3. Disclaimer of App Warranty</Text>
      <Text style={styles.paragraph}>
        THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY
        KIND, EITHER EXPRESS OR IMPLIED.
      </Text>
      <Text style={styles.paragraph}>
        AcousticOne explicitly disclaims any warranties of merchantability,
        fitness for a particular purpose, or non-infringement. We do not
        guarantee that the App will be uninterrupted, error-free, secure, or
        that it will meet your specific requirements.
      </Text>
      <Text style={styles.paragraph}>
        This "as is" policy for the App is separate from the Manufacturer's
        warranty for the physical Hardware, which will be honored by the
        Manufacturer as long as they are selling and supporting the product,
        subject to their own terms.
      </Text>

      <Text style={styles.heading}>4. Hardware Compatibility and Support</Text>
      <Text style={styles.paragraph}>
        We strive to provide a stable and reliable experience across a range of
        Hardware models. We will make a best effort to maintain App
        compatibility and support for Hardware models for a period of{" "}
        <Text style={styles.bold}>five (5) years</Text> from the Manufacturer's
        official date of manufacturing.
      </Text>
      <Text style={styles.paragraph}>
        After this period, App support for older Hardware models may be reduced
        or discontinued at our discretion to ensure the quality and security of
        the App for current models. This does not affect the Manufacturer's
        warranty or support obligations for the Hardware itself.
      </Text>

      <Text style={styles.heading}>5. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        In no event shall AcousticOne be liable for any indirect, incidental,
        special, or consequential damages arising from your use of the App or
        your inability to use the App, even if we have been advised of the
        possibility of such damages.
      </Text>

      <Text style={styles.heading}>6. Changes to These Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to modify these Terms at any time. We will notify
        you of any changes by posting the new Terms within the App and updating
        the "Last updated" date.
      </Text>

      <Text style={styles.heading}>7. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about these Terms, please contact us at
        legal@acousticone.app.
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
      paddingBottom: 40,
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
    paragraph: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 12,
    },
    bold: {
      fontWeight: "600",
    },
  });
};
