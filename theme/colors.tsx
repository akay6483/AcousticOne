const palette = {
  // Your existing colors
  blueLight: "#c3deffff",
  blueDark: "#3dbeffff",
  white: "#ffffffff",
  black: "#000000",
  greyDark: "#25292e", // From tab bar
  greyDarker: "#1b1d21", // From drawer

  // From index.tsx (dark)
  darkBg: "#121212",
  darkCard: "#1E1E1E",
  darkText: "#E1E1E1",
  darkBorder: "#2C2C2E",
  darkIcon: "#D0D0D0",
  darkInactive: "#767577",
  darkThumb: "#f4f3f4",

  // General
  red: "red",

  // From Modals
  modalBackground: "#2a2a2e",
  remoteModalBg: "#3A3A3A",
  modalOverlay: "rgba(0,0,0,0.6)",

  // From Knob.tsx
  darkMuted: "#A0A0A0",
  lightMuted: "#555555",
};

export const lightColors = {
  background: "#EAF0F8", // soft bluish-white, easy on eyes
  text: "#1C1C1E", // dark charcoal for better readability
  primary: "#2979FF", // balanced blue accent (modern feel)
  error: "#E53935", // slightly softened red
  card: "#FFFFFF", // pure white for cards
  border: "#D1D5DB", // neutral cool gray for outlines
  icon: "#444B54", // cool dark gray for icons
  inactiveTint: "#A0A4A8", // softer gray for inactive icons/text
  thumbColor: "#E0E0E0", // subtle neutral for toggles
  tabBarBackground: "#F5F7FA", // faint blue-gray background
  headerBackground: "#F8FAFD", // slightly lighter than tab bar
  drawerBackground: "#FFFFFF", // consistent with cards

  // From Modals
  modalBackground: "#FAFAFC", // slightly lifted off-white
  remoteModalBg: "#F1F3F6", // muted cool gray-blue for depth
  modalOverlay: "rgba(0,0,0,0.4)", // keep same translucency
  remoteButtonText: "#1C1C1E", // match text tone
  remotePowerText: "#FFFFFF", // strong contrast for emphasis
  remotePlayText: "#FFFFFF",
  remoteEqText: "#FFFFFF",

  // From Knob
  textMuted: "#5E5E63", // balanced mid-gray for secondary text
};

export const darkColors = {
  background: palette.darkBg,
  text: palette.darkText,
  primary: palette.blueDark,
  error: palette.red,
  card: palette.darkCard,
  border: palette.darkBorder,
  icon: palette.darkIcon,
  inactiveTint: palette.darkInactive,
  thumbColor: palette.darkThumb,
  tabBarBackground: palette.greyDark,
  headerBackground: palette.greyDark,
  drawerBackground: palette.greyDarker,

  // From Modals
  modalBackground: palette.modalBackground,
  remoteModalBg: palette.remoteModalBg,
  modalOverlay: palette.modalOverlay,
  remoteButtonText: palette.black,
  remotePowerText: palette.white,
  remotePlayText: palette.white,
  remoteEqText: palette.white,

  // From Knob
  textMuted: palette.darkMuted,
};
