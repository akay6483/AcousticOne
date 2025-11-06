// --- IMPORT LastSettings type ---
import { LastSettings } from "./storage";

// --- This array MUST match the order in ModeSelector.tsx ---
const INPUT_MODES_MAP = ["AUX1", "AUX2", "AUX3", "USB/BT", "5.1 Analogue"];
const ESP_HOST = "http://192.168.4.1"; // Host is now managed here

// --- COMMAND QUEUE ---
let commandQueue: string[] = [];
let isProcessing = false;

/**
 * A safe, sequential fetch utility.
 * This is the "worker" that processes the queue.
 */
const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) {
    return;
  }
  isProcessing = true;

  const command = commandQueue.shift(); // Get the oldest command
  if (!command) {
    isProcessing = false;
    return;
  }

  const url = `${ESP_HOST}${command}`;
  console.log(`Sending command: ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    // We just care that it didn't fail.
    console.log(`Success for command: ${command}, Response: ${responseText}`);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`Request timed out for command: ${command}`);
    } else {
      console.error(`Error in sendCommand (${command}):`, error);
    }
  } finally {
    isProcessing = false;
    // Process the next item in the queue
    setTimeout(processQueue, 50); // Small delay between commands
  }
};

/**
 * Adds a command to the queue.
 */
const queueCommand = (command: string) => {
  // Optimization: If the same *type* of command is already in the queue,
  // remove the old one. This prevents sending stale knob data.
  const commandType = command.split("/")[1]; // e.g., "mav"
  commandQueue = commandQueue.filter(
    (cmd) => !cmd.startsWith(`/${commandType}/`)
  );

  commandQueue.push(command);
  processQueue();
};

// --- API Functions (All use the queue) ---

export const sendMasterVolume = (volume: number) => {
  queueCommand(`/mav/${volume}/`);
};
export const sendBass = (bass: number) => {
  queueCommand(`/bsv/${bass}/`);
};
export const sendMid = (mid: number) => {
  queueCommand(`/mdv/${mid}/`);
};
export const sendTreble = (treble: number) => {
  queueCommand(`/trv/${treble}/`);
};
export const sendFrontLeft = (value: number) => {
  queueCommand(`/flv/${value}/`);
};
export const sendFrontRight = (value: number) => {
  queueCommand(`/frv/${value}/`);
};
export const sendCenter = (value: number) => {
  queueCommand(`/cnv/${value}/`);
};
export const sendRearLeft = (value: number) => {
  queueCommand(`/rlv/${value}/`);
};
export const sendRearRight = (value: number) => {
  queueCommand(`/rrv/${value}/`);
};
export const sendTone = (value: number) => {
  queueCommand(`/ton/${value}/`);
};
export const sendSurround = (value: number) => {
  queueCommand(`/sue/${value}/`);
};
export const sendInput = (value: number) => {
  queueCommand(`/inp/${value}/`);
};
export const sendMute = () => {
  queueCommand(`/mut/`);
};
export const sendIR = (code: string) => {
  queueCommand(`/irs/${code}/`);
};

/**
 * Queues all settings. Used for loading presets.
 */
export const sendAllParameters = (settings: LastSettings) => {
  console.log("--- Queuing all parameters ---");
  const modeIndex = INPUT_MODES_MAP.indexOf(settings.mode);

  // Just add all commands to the queue.
  // The queue worker (processQueue) will send them sequentially.
  queueCommand(`/mav/${settings.volume}/`);
  queueCommand(`/bsv/${settings.bass}/`);
  queueCommand(`/mdv/${settings.mid}/`);
  queueCommand(`/trv/${settings.treble}/`);
  queueCommand(`/flv/${settings.frontLeft}/`);
  queueCommand(`/frv/${settings.frontRight}/`);
  queueCommand(`/cnv/${settings.center}/`);
  queueCommand(`/rlv/${settings.rearLeft}/`);
  queueCommand(`/rrv/${settings.rearRight}/`);
  queueCommand(`/ton/${settings.tone ? 1 : 0}/`);
  queueCommand(`/sue/${settings.surround ? 1 : 0}/`);
  if (modeIndex > -1) {
    queueCommand(`/inp/${modeIndex}/`);
  }
  console.log("--- All parameters queued ---");
};

// --- MODIFIED: ALL DIRECT CALLS REMOVED ---
// - getParameters
// - checkLiveness
// - fetchWithTimeout
