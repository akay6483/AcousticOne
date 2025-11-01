import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_CONNECTED_ID_KEY = "LAST_CONNECTED_DEVICE_ID";

/**
 * Stores the ID (BSSID) of the last successfully connected device.
 */
export const storeLastConnectedDeviceID = async (id: string) => {
  try {
    await AsyncStorage.setItem(LAST_CONNECTED_ID_KEY, id);
  } catch (e) {
    console.error("Failed to save last connected ID", e);
  }
};

/**
 * Retrieves the ID (BSSID) of the last connected device.
 */
export const getLastConnectedDeviceID = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_CONNECTED_ID_KEY);
  } catch (e) {
    console.error("Failed to get last connected ID", e);
    return null;
  }
};
