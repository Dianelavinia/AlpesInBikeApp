/**
 * Design system Alpes in Bike, partagé avec le web.
 * Mêmes couleurs, mêmes typos.
 */

export const Colors = {
  brand: {
    orange: "#E15A23",
    orangeDark: "#B8431A",
    orangeLight: "#F6B595",
    forest: "#0D4F3D",
    forestDark: "#06301E",
    forestLight: "#4B916D",
    cream: "#FAF7F2",
    ink: "#0A0A0A",
  },
  text: {
    primary: "#0A0A0A",
    secondary: "#525252",
    muted: "#a8a29e",
    inverse: "#FFFFFF",
  },
  bg: {
    base: "#FAF7F2",
    card: "#FFFFFF",
    elevated: "#F5F4F0",
    inverse: "#0A0A0A",
  },
  border: {
    subtle: "#F5F4F0",
    base: "#E7E5E4",
    strong: "#A8A29E",
  },
  status: {
    success: "#0D4F3D",
    warning: "#E15A23",
    error: "#B8431A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const Type = {
  body: { fontSize: 16, lineHeight: 24 },
  bodySm: { fontSize: 14, lineHeight: 20 },
  bodyXs: { fontSize: 12, lineHeight: 16 },
  display1: { fontSize: 40, lineHeight: 44, fontWeight: "600" as const },
  display2: { fontSize: 32, lineHeight: 36, fontWeight: "600" as const },
  display3: { fontSize: 24, lineHeight: 28, fontWeight: "600" as const },
  display4: { fontSize: 18, lineHeight: 22, fontWeight: "600" as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 1.5, textTransform: "uppercase" as const },
};
