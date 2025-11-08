// --- 1. FIX: Import createAudioPlayer, not just AudioPlayer ---
import { AudioPlayer, AudioSource, createAudioPlayer } from "expo-audio";

let audioPlayer: AudioPlayer | null = null;

const TICK_SOUND_FILE: AudioSource = require("../assets/sounds/knob-tick.mp3");

export async function loadTickSound() {
  if (audioPlayer) {
    return; // Already loaded
  }

  console.log("Creating audio player with new expo-audio...");
  try {
    audioPlayer = createAudioPlayer(TICK_SOUND_FILE);
    console.log("Audio player created successfully.");
  } catch (error) {
    console.error("Failed to create audio player", error);
  }
}

export async function playTickSound() {
  if (!audioPlayer) {
    console.warn("Audio player not created, attempting to create...");
    await loadTickSound();
    if (!audioPlayer) {
      console.error("Could not play sound, player creation failed.");
      return;
    }
  }

  try {
    audioPlayer.seekTo(0);
    audioPlayer.play();
  } catch (error) {
    console.error("Failed to play tick sound", error);
  }
}

export async function unloadTickSound() {
  if (audioPlayer) {
    console.log("Releasing audio player...");
    await audioPlayer.release();
    audioPlayer = null;
  }
}
