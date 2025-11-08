// /hooks/useDeviceSync.ts
// (You can place this in a /hooks folder)

import { useEffect, useRef } from "react";
import * as deviceService from "../services/deviceService";
import { LastSettings, saveLastSettings } from "../services/storage";

// Define the type for the callback function we'll receive
type SyncCallback = (settings: LastSettings) => void;

/**
 * A custom React hook that polls the device for updates.
 * @param onSync A callback function to execute when new settings are fetched.
 */
export const useDeviceSync = (onSync: SyncCallback) => {
  // Use a ref to ensure the onSync function is always the latest
  // without causing the useEffect to re-run and reset the interval.
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    const poll = async () => {
      try {
        const needsUpdate = await deviceService.checkForUpdate();

        if (needsUpdate) {
          console.log("Device state changed, fetching params...");
          const newSettings = await deviceService.fetchAllParameters();

          if (newSettings) {
            // Call the callback function (from index.tsx)
            onSyncRef.current(newSettings);

            // Also, save these new settings to local storage
            saveLastSettings(newSettings);
          }
        }
      } catch (error) {
        console.warn("Polling error:", error);
      }
    };

    // Start polling every 1.5 seconds
    const intervalId = setInterval(poll, 1500);

    // Stop polling when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // The empty array [] ensures this runs only once when the hook is mounted.
};
