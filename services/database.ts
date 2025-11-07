import { deleteAsync, documentDirectory } from "expo-file-system/legacy";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

/* --- Types --- */

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

// --- MODIFIED: GTZAN PRESET LIST with Index-based Values ---
// These values now correctly correspond to the knob indices.
// For EQ: 0-14 index range, 7 is flat (0dB).
// For Attenuation: 0-14 index range, 14 is flat (0dB).
const GTZAN_PRESETS: Omit<Preset, "id">[] = [
  {
    name: "Blues",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 9, // +4dB
      treble: 6, // -2dB
      mid: 10, // +6dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Classical",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 9, // +4dB
      treble: 9, // +4dB
      mid: 6, // -2dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Country",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 7, // 0dB
      treble: 9, // +4dB
      mid: 10, // +6dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Disco",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 11, // +8dB
      treble: 10, // +6dB
      mid: 4, // -6dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Hiphop",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 13, // +12dB
      treble: 7, // 0dB
      mid: 3, // -8dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Jazz",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 6, // -2dB
      treble: 10, // +6dB
      mid: 9, // +4dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Metal",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 12, // +10dB
      treble: 12, // +10dB
      mid: 1, // -12dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Pop",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 10, // +6dB
      treble: 9, // +4dB
      mid: 6, // -2dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Reggae",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 12, // +10dB
      treble: 6, // -2dB
      mid: 5, // -4dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
  {
    name: "Rock",
    type: "gtzan",
    preset_values: {
      volume: 60,
      bass: 11, // +8dB
      treble: 10, // +6dB
      mid: 5, // -4dB
      prologic: false,
      tone: true,
      surround: false,
      mixed: true,
      frontLeft: 14,
      frontRight: 14,
      subwoofer: 50,
      center: 14,
      rearLeft: 14,
      rearRight: 14,
      mode: "AUX1",
    },
  },
];

export type Devices = {
  modelCode: string;
  modelName: string;
  modelImage: string;
  ssid: string;
  password: string;
  desc: string;
  apHost: string;
  staHost: string;
};

const INITIAL_DEVICES: Devices[] = [
  {
    modelCode: "38B14",
    modelName: "PE PRO",
    modelImage: "pv_pro",
    ssid: "PE PRO 38B14",
    password: "PrasadDigital",
    desc: "Placeholder",
    apHost: "http://192.168.4.1",
    staHost: "http://192.168.1.100",
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

/* --- resetDB FUNCTION --- */
export const resetDB = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    _initPromise = null;
    console.log("Database connection closed for reset.");
  }

  const dbPath = `${documentDirectory}SQLite/acousticone.db`;
  try {
    await deleteAsync(dbPath, { idempotent: true });
    console.log("🧹 Old database deleted successfully");
  } catch (err) {
    console.warn("⚠️ Error deleting database:", err);
  }
};

/* --- Initialization --- */
export const initDB = async (): Promise<void> => {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const database = await getDB();

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
        modelCode TEXT PRIMARY KEY NOT NULL,
        modelName TEXT NOT NULL,
        modelImage TEXT,
        ssid TEXT NOT NULL,
        password TEXT NOT NULL,  
        desc TEXT,           
        help_text TEXT,
        apHost TEXT NOT NULL,
        staHost TEXT NOT NULL
      );
    `);

    try {
      const presetCountRow = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM presets WHERE type = ?;",
        ["gtzan"]
      );
      const count = presetCountRow?.count ?? 0;
      if (count === 0) {
        console.log("Populating GTZAN presets...");
        for (const p of GTZAN_PRESETS) {
          await database.runAsync(
            "INSERT INTO presets (name, type, preset_values) VALUES (?, ?, ?);",
            [p.name, p.type, JSON.stringify(p.preset_values)]
          );
        }
        console.log("GTZAN presets populated.");
      }
    } catch (err) {
      console.warn("initDB: error inserting GTZAN presets", err);
    }

    try {
      const deviceCountRow = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM devices;"
      );
      const count = deviceCountRow?.count ?? 0;
      if (count === 0) {
        console.log("Populating initial devices...");
        for (const d of INITIAL_DEVICES) {
          await database.runAsync(
            "INSERT INTO devices (modelCode, modelName, modelImage, ssid, password, desc, apHost, staHost) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            [
              d.modelCode,
              d.modelName,
              d.modelImage,
              d.ssid,
              d.password,
              d.desc,
              d.apHost,
              d.staHost,
            ]
          );
        }
        console.log("Initial devices populated.");
      }
    } catch (err) {
      console.warn("initDB: error inserting initial devices", err);
    }

    console.log("✅ Database initialized successfully.");
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

export const getDevices = async (): Promise<Devices[]> => {
  const database = await getDB();
  // Fetch all devices from the table
  const rows = await database.getAllAsync<Devices>(
    "SELECT * FROM devices ORDER BY modelName ASC;"
  );
  return rows;
};
