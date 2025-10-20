import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// --- App Theme ---
const theme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E1E1E1",
  primary: "#007AFF",
  border: "#2C2C2E",
  icon: "#D0D0D0",
};

// --- Remote-Specific Theme ---
const remoteTheme = {
  background: "#3A3A3A",
  buttonText: "#000000",
  powerText: "#FFFFFF",
  playText: "#FFFFFF",
  eqText: "#FFFFFF",
};

// --- Button Images ---
const buttonImages = {
  default: require("../assets/images/button-default.png"),
  red: require("../assets/images/button-red.png"),
  blue: require("../assets/images/button-blue.png"),
  purple: require("../assets/images/button-purple.png"),
};

// --- Props ---
interface RemoteButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  buttonType?: "default" | "red" | "blue" | "purple";
  textColor?: string;
}

interface RemoteModalProps {
  visible: boolean;
  onClose: () => void;
}

// --- Remote Button ---
const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  onPress,
  buttonType = "default",
  textColor,
}) => {
  const sourceImage = buttonImages[buttonType];

  return (
    <Pressable
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
    >
      <ImageBackground
        source={sourceImage}
        style={styles.buttonBackground}
        imageStyle={styles.buttonImageStyle}
        resizeMode="cover"
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
      </ImageBackground>
    </Pressable>
  );
};

// --- Remote Modal ---
export const RemoteModal: React.FC<RemoteModalProps> = ({
  visible,
  onClose,
}) => {
  const handleButtonPress = (action: string) => {
    console.log(`Remote button pressed: ${action}`);
  };

  return (
    <SafeAreaProvider>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Text style={styles.remoteTitle}>Remote</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={theme.text} />
              </Pressable>
            </View>

            {/* Buttons Grid */}
            <View style={styles.gridContainer}>
              {/* Row 1 */}
              <RemoteButton
                onPress={() => handleButtonPress("Power")}
                buttonType="red"
                icon={
                  <MaterialCommunityIcons
                    name="power"
                    size={32}
                    color={remoteTheme.powerText}
                  />
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
                buttonType="blue"
                icon={
                  <Ionicons
                    name="play"
                    size={28}
                    color={remoteTheme.playText}
                  />
                }
              />
              <RemoteButton
                onPress={() => handleButtonPress("Previous")}
                icon={
                  <Ionicons name="play-skip-back" size={24} color="black" />
                }
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
                buttonType="purple"
                textColor={remoteTheme.eqText}
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
              {Array.from({ length: 9 }, (_, i) => (
                <RemoteButton
                  key={i + 1}
                  label={`${i + 1}`}
                  onPress={() => handleButtonPress(`${i + 1}`)}
                />
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: remoteTheme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  remoteTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text,
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    padding: 6,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 340,
    marginTop: 10,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImageStyle: {
    borderRadius: 40,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 2,
  },
});
