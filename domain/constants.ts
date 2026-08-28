export const COLORS = {
  ink: "#18362f",
  corPadrao: "#005ca9",
  mint: "#d9e8f6",
  orange: "#ff774c",
  cream: "#f7f5ef",
  line: "#e3e4dc",
};

export const BREAKPOINTS = {
  tablet: 950,
  mobile: 600,
};

export const SIDEBAR_WIDTH = 240;
export const DRAWER_WIDTH = 260;
export const MOBILE_BREAKPOINT = 600;
export const WORKSPACE_MAX_WIDTH = 1500;

export const PHOTO = {
  maxPerQuestion: 4,
  preview: {
    width: 120,
    height: 68,
  },
  normalization: {
    width: 800,
    height: 450,
    format: "image/jpeg",
    quality: 0.6,
  },
  r2KeyPattern: "responses/{responseId}/{itemId}-{filename}",
  maxSizeBytes: 10 * 1024 * 1024,
};

export const OPTION = {
  min: 3,
  max: 6,
  outrosLabel: "Outros",
};

export const OBSERVATION = {
  minLength: 5,
};

export const CONFIRM_DELETE_PHRASE = "APAGAR_REGISTRO>>SIM";

export const SETTINGS = {
  logoMaxBytes: 2 * 1024 * 1024,
  logoBgDefault: "transparent",
  logoBgOptions: ["transparent", "#005ca9"],
  primaryColorDefault: "#005ca9",
};

export const LOGO_BG_LABELS: Record<string, string> = {
  transparent: "Transparente",
  "#005ca9": "Azul rgb(0, 92, 169)",
};

export const FILES = {
  allowedPrefixes: ["settings/", "responses/"],
};

export const METRIC_COLORS = {
  yes: "#22c55e",
  no: "#ef4444",
  other: "#eab308",
  pending: "#e3e4dc",
};

export const PDF = {
  pageSize: "A4",
  unit: "mm",
  headerHeight: 34,
  headerBg: "#005ca9",
  itemRow: {
    leftX: 14,
    width: 181,
    minHeight: 40,
    questionTextWidth: 108,
    imageX: 132,
    imageWidth: 58,
    imageHeight: 32,
  },
  noImage: {
    text: "Sem Imagens",
    fontSize: 13,
    angle: 24,
  },
  logo: {
    slotWidth: 30,
    slotHeight: 16,
    scale: 0.65,
  },
  signature: {
    lineFromX: 42,
    lineToX: 168,
  },
};

export const CIPA_SEED_ID = "cipa-areas-administrativas";
export const CIPA_SHARE_TOKEN = "cipa-administrativas";
