// --- Fetch Utility ---
// Moved from device.tsx to be reusable
async function fetchWithTimeout(url: string, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Sends the Master Volume (mav) command to the ESP.
 * @param host The IP address of the device (e.g., "http://192.168.4.1").
 * @param volume The volume index (e.g., 75).
 */
export const sendMasterVolume = async (
  host: string,
  volume: number
): Promise<void> => {
  try {
    // The ESP .ino file expects: /mav/{value}
    const url = `${host}/mav/${volume}`;
    console.log(`Sending command: ${url}`);

    const response = await fetchWithTimeout(url, 2500);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    // The .ino file responds with "OK" on success
    if (responseText.includes("OK")) {
      console.log(`Successfully set volume to ${volume}.`);
    } else {
      console.warn(
        `Sent volume ${volume}, but got unexpected response: ${responseText}`
      );
    }
  } catch (error) {
    console.error(`Error in sendMasterVolume:`, error);
    // Re-throw to be caught by the connection loop if needed
    throw error;
  }
};

// TODO: Add other API functions here as you implement them
/*
export const sendBass = async (host: string, bass: number) => {
  // ...
}
*/
