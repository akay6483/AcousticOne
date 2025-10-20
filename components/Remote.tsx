import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --- App Theme (from your main file) ---
const theme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E1E1E1",
  primary: "#007AFF",
  border: "#2C2C2E",
  icon: "#D0D0D0",
};

// --- Remote Specific Theme ---
const remoteTheme = {
  background: "#424242",
  buttonDefault: "#C4C4C4",
  buttonText: "#000000",
  power: "#D32F2F",
  play: "#3F51B5",
  eq: "#8E24AA",
};

// --- Prop Types ---
interface RemoteButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  color?: string;
  textColor?: string;
}

interface RemoteModalProps {
  visible: boolean;
  onClose: () => void;
}

// --- Reusable Button Component ---
const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  onPress,
  color,
  textColor,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      {
        backgroundColor: color || remoteTheme.buttonDefault,
        opacity: pressed ? 0.7 : 1,
      },
    ]}
    onPress={onPress}
  >
    {icon}
    {label && (
      <Text
        style={[
          styles.buttonText,
          { color: textColor || remoteTheme.buttonText },
        ]}
      >
        {label}
      </Text>
    )}
  </Pressable>
);

// --- Main Remote Modal Component ---
export const RemoteModal: React.FC<RemoteModalProps> = ({
  visible,
  onClose,
}) => {
  // --- Button Handlers ---
  const handleButtonPress = (action: string) => {
    console.log(`Remote button pressed: ${action}`);
    // You can add your logic here to send commands
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.remoteBody}>
          {/* --- Header with Back Button --- */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </Pressable>
          </View>

          {/* --- Button Grid --- */}
          <View style={styles.gridContainer}>
            {/* Row 1 */}
            <RemoteButton
              onPress={() => handleButtonPress("Power")}
              color={remoteTheme.power}
              icon={
                <MaterialCommunityIcons name="power" size={32} color="white" />
              }
            />
            <RemoteButton
              label="Mode"
              onPress={() => handleButtonPress("Mode")}
            />
            <RemoteButton
              onPress={() => handleButtonPress("Mute")}
              icon={
                <MaterialCommunityIcons
                  name="volume-off"
                  size={30}
                  color="black"
                />
              }
            />

            {/* Row 2 */}
            <RemoteButton
              onPress={() => handleButtonPress("Play/Pause")}
              color={remoteTheme.play}
              icon={<Ionicons name="play" size={28} color="white" />}
            />
            <RemoteButton
              onPress={() => handleButtonPress("Previous")}
              icon={<Ionicons name="play-skip-back" size={24} color="black" />}
            />
            <RemoteButton
              onPress={() => handleButtonPress("Next")}
              icon={
                <Ionicons name="play-skip-forward" size={24} color="black" />
              }
            />

            {/* Row 3 */}
            <RemoteButton
              label="EQ"
              onPress={() => handleButtonPress("EQ")}
              color={remoteTheme.eq}
              textColor="white"
            />
            <RemoteButton
              label="VOL-"
              onPress={() => handleButtonPress("Vol-")}
            />
            <RemoteButton
              label="VOL+"
              onPress={() => handleButtonPress("Vol+")}
            />

            {/* Row 4 */}
            <RemoteButton label="0" onPress={() => handleButtonPress("0")} />
            <RemoteButton
              label="RPT"
              onPress={() => handleButtonPress("Repeat")}
            />
            <RemoteButton
              label="U/SD"
              onPress={() => handleButtonPress("U/SD")}
            />

            {/* Number Pad */}
            <RemoteButton label="1" onPress={() => handleButtonPress("1")} />
            <RemoteButton label="2" onPress={() => handleButtonPress("2")} />
            <RemoteButton label="3" onPress={() => handleButtonPress("3")} />

            <RemoteButton label="4" onPress={() => handleButtonPress("4")} />
            <RemoteButton label="5" onPress={() => handleButtonPress("5")} />
            <RemoteButton label="6" onPress={() => handleButtonPress("6")} />

            <RemoteButton label="7" onPress={() => handleButtonPress("7")} />
            <RemoteButton label="8" onPress={() => handleButtonPress("8")} />
            <RemoteButton label="9" onPress={() => handleButtonPress("9")} />
          </View>

          <Text style={styles.footerText}>MID</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  remoteBody: {
    backgroundColor: remoteTheme.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 350, // Ensures buttons don't get too far apart on wide screens
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 20,
    color: theme.text,
    fontSize: 16,
    fontWeight: "500",
  },
});
