import * as FileSystem from "expo-file-system";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

/* --- Types --- */

// --- 👇 SIMPLIFIED DEVICE TYPE ---
export type Device = {
  id: string; // BSSID (MAC Address) - Primary Key
  name: string; // User-friendly name (defaults to SSID)
  ssid: string; // WiFi Network Name
  modelCode?: string; // e.g., "38B14" (obtained after connection)
};
// --- END OF SIMPLIFICATION ---

export type Preset = {
  id?: number;
  name: string;
  type: "gtzan" | "custom";
  preset_values: {
    volume: number;
    bass: number;
    treble: number;
    mid: number;
    prologic: boolean;
    tone: boolean;
    surround: boolean;
    mixed: boolean;
    frontLeft: number;
    frontRight: number;
    subwoofer: number;
    center: number;
    rearLeft: number;
    rearRight: number;
    mode: string;
  };
};

/* --- Mock data (Updated to match simplified type) --- */
const MOCK_PAIRED_SYSTEMS: Device[] = [
  {
    id: "AA:BB:CC:DD:EE:01",
    name: "Living Room Speaker",
    ssid: "AcousticsOne-LR-5G",
    modelCode: "38B14",
  },
  {
    id: "AA:BB:CC:DD:EE:02",
    name: "Bedroom Amp",
    ssid: "AcousticsOne-BR-2.4G",
    modelCode: "38B14",
  },
  {
    id: "AA:BB:CC:DD:EE:03",
    name: "Garage PA",
    ssid: "AcousticsOne-GRG-5G",
    modelCode: "38B14",
  },
  {
    id: "AA:BB:CC:DD:EE:04",
    name: "Basement System",
    ssid: "AcousticsOne-BSMT-2.4G",
    modelCode: "38B14",
  },
];

// --- *** FIXED: FULL GTZAN PRESET LIST *** ---
const GTZAN_PRESETS: Omit<Preset, "id">[] = [
  // ... (GTZAN presets remain unchanged) ...
  {
    name: "Blues",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 70,
      treble: 65,
      mid: 60,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Classical",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 55,
      treble: 70,
      mid: 65,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Country",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 65,
      treble: 60,
      mid: 70,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Disco",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 80,
      treble: 75,
      mid: 50,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Hiphop",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 90,
      treble: 65,
      mid: 40,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Jazz",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 60,
      treble: 75,
      mid: 65,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Metal",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 75,
      treble: 80,
      mid: 20,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Pop",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 75,
      treble: 70,
      mid: 60,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Reggae",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 85,
      treble: 60,
      mid: 35,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
  {
    name: "Rock",
    type: "gtzan",
    preset_values: {
      volume: 75,
      bass: 80,
      treble: 75,
      mid: 50,
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 50,
      frontRight: 50,
      subwoofer: 50,
      center: 50,
      rearLeft: 50,
      rearRight: 50,
      mode: "AUX1",
    },
  },
];

/* --- DB instance + init guard --- */
let db: SQLiteDatabase | null = null;
let _initPromise: Promise<void> | null = null;

const getDB = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    db = await openDatabaseAsync("acousticone.db");
  }
  return db;
};

/* Simple RunResult type */
type RunResult = {
  rowsAffected?: number;
  insertId?: number;
};

/* --- Clean slate (optional for development) --- */
export const resetDB = async (): Promise<void> => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/acousticone.db`;
  try {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
    console.log("🧹 Old database deleted successfully");
  } catch (err) {
    console.warn("⚠️ Error deleting database:", err);
  }
};

/* --- Initialization --- */
export const initDB = async (): Promise<void> => {
  if (_initPromise) return _initPromise; // single init call

  _initPromise = (async () => {
    const database = await getDB();

    // Create tables
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS presets (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        preset_values TEXT
      );
    `);

    // --- 👇 UPDATED DEVICES TABLE SCHEMA ---
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        ssid TEXT NOT NULL,
        modelCode TEXT
      );
    `);
    // --- END OF UPDATE ---

    // Populate GTZAN presets if none exist
    try {
      const presetCountRow = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM presets WHERE type = ?;",
        ["gtzan"]
      );
      const count = presetCountRow?.count ?? 0;
      if (count === 0) {
        console.log("Populating GTZAN presets..."); // Added log
        for (const p of GTZAN_PRESETS) {
          await database.runAsync(
            "INSERT INTO presets (name, type, preset_values) VALUES (?, ?, ?);",
            [p.name, p.type, JSON.stringify(p.preset_values)]
          );
        }
        console.log("GTZAN presets populated."); // Added log
      }
    } catch (err) {
      console.warn("initDB: error inserting GTZAN presets", err);
    }

    // Populate mock devices if empty
    try {
      const deviceCountRow = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM devices;"
      );
      const dcount = deviceCountRow?.count ?? 0;
      if (dcount === 0) {
        // --- 👇 UPDATED MOCK DEVICE INSERTION ---
        for (const d of MOCK_PAIRED_SYSTEMS) {
          await database.runAsync(
            "INSERT INTO devices (id, name, ssid, modelCode) VALUES (?, ?, ?, ?);",
            [d.id, d.name, d.ssid, d.modelCode ?? null]
          );
        }
        // --- END OF UPDATE ---
      }
    } catch (err) {
      console.warn("initDB: error inserting mock devices", err);
    }

    console.log("✅ Database initialized successfully");
  })();

  return _initPromise;
};

/* --- Preset functions (Unchanged) --- */

export const getPresets = async (
  type: "gtzan" | "custom" | "all" = "all"
): Promise<Preset[]> => {
  const database = await getDB();
  let query = "SELECT * FROM presets";
  const params: (string | number)[] = [];
  if (type !== "all") {
    query += " WHERE type = ?";
    params.push(type);
  }
  const rows = await database.getAllAsync<{
    id: number;
    name: string;
    type: "gtzan" | "custom";
    preset_values: string;
  }>(query, params);

  // Parse the JSON string for each row
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    preset_values: JSON.parse(r.preset_values),
  }));
};

export const addPreset = async (
  preset: Omit<Preset, "id">
): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync(
    "INSERT INTO presets (name, type, preset_values) VALUES (?, ?, ?);",
    [preset.name, preset.type, JSON.stringify(preset.preset_values)]
  )) as unknown as RunResult;
  return res;
};

export const updatePreset = async (
  id: number,
  preset_values: Preset["preset_values"]
): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync(
    "UPDATE presets SET preset_values = ? WHERE id = ?;",
    [JSON.stringify(preset_values), id]
  )) as unknown as RunResult;
  return res;
};

export const deletePreset = async (id: number): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync("DELETE FROM presets WHERE id = ?;", [
    id,
  ])) as unknown as RunResult;
  return res;
};

/* --- Device functions --- */

export const getDevices = async (): Promise<Device[]> => {
  const database = await getDB();
  const rows = await database.getAllAsync<Device>("SELECT * FROM devices;");
  return rows;
};

// --- 👇 UPDATED addDevice ---
export const addDevice = async (device: Device): Promise<RunResult> => {
  const database = await getDB();
  // Only insert essential fields
  const res = (await database.runAsync(
    `INSERT INTO devices (id, name, ssid, modelCode)
     VALUES (?, ?, ?, ?);`,
    [device.id, device.name, device.ssid, device.modelCode ?? null]
  )) as unknown as RunResult;
  return res;
};
// --- END OF UPDATE ---

export const deleteDevice = async (id: string): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync("DELETE FROM devices WHERE id = ?;", [
    id,
  ])) as unknown as RunResult;
  return res;
};

// --- 👇 NEW FUNCTION TO UPDATE modelCode ---
export const updateDeviceModelCode = async (
  id: string,
  modelCode: string
): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync(
    "UPDATE devices SET modelCode = ? WHERE id = ?;",
    [modelCode, id]
  )) as unknown as RunResult;
  return res;
};
// --- END OF NEW FUNCTION ---

export const updateDeviceName = async (
  id: string,
  name: string
): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync(
    "UPDATE devices SET name = ? WHERE id = ?;",
    [name, id]
  )) as unknown as RunResult;
  return res;
};
