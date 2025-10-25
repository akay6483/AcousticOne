// services/database.ts
import * as FileSystem from "expo-file-system";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

/* --- Types --- */
export type Device = {
  id: string;
  name: string;
  ssid: string;
  ipAddress?: string;
  serialNo?: string;
  helpText?: string;
  codeName?: string;
  image?: string;
};

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

/* --- Mock data (unchanged) --- */
const MOCK_PAIRED_SYSTEMS: Device[] = [
  { id: "1", name: "Living Room Speaker", ssid: "AcousticsOne-LR-5G" },
  { id: "2", name: "Bedroom Amp", ssid: "AcousticsOne-BR-2.4G" },
  { id: "3", name: "Garage PA", ssid: "AcousticsOne-GRG-5G" },
  { id: "4", name: "Basement System", ssid: "AcousticsOne-BSMT-2.4G" },
];

const GTZAN_PRESETS: Omit<Preset, "id">[] = [
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
  // ... rest of GTZAN presets
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

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        ssid TEXT NOT NULL,
        ipAddress TEXT,
        serialNo TEXT,
        helpText TEXT,
        codeName TEXT,
        image TEXT
      );
    `);

    // Populate GTZAN presets if none exist
    try {
      const presetCountRow = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM presets WHERE type = ?;",
        ["gtzan"]
      );
      const count = presetCountRow?.count ?? 0;
      if (count === 0) {
        for (const p of GTZAN_PRESETS) {
          await database.runAsync(
            "INSERT INTO presets (name, type, preset_values) VALUES (?, ?, ?);",
            [p.name, p.type, JSON.stringify(p.preset_values)]
          );
        }
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
        for (const d of MOCK_PAIRED_SYSTEMS) {
          await database.runAsync(
            "INSERT INTO devices (id, name, ssid) VALUES (?, ?, ?);",
            [d.id, d.name, d.ssid]
          );
        }
      }
    } catch (err) {
      console.warn("initDB: error inserting mock devices", err);
    }

    console.log("✅ Database initialized successfully");
  })();

  return _initPromise;
};

/* --- Preset functions --- */

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

export const addDevice = async (device: Device): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync(
    `INSERT INTO devices (id, name, ssid, ipAddress, serialNo, helpText, codeName, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      device.id,
      device.name,
      device.ssid,
      device.ipAddress ?? null,
      device.serialNo ?? null,
      device.helpText ?? null,
      device.codeName ?? null,
      device.image ?? null,
    ]
  )) as unknown as RunResult;
  return res;
};

export const deleteDevice = async (id: string): Promise<RunResult> => {
  const database = await getDB();
  const res = (await database.runAsync("DELETE FROM devices WHERE id = ?;", [
    id,
  ])) as unknown as RunResult;
  return res;
};

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
