export const COLORS = {
  ink: '#18362f',
  green: '#005ca9',
  mint: '#d9e8f6',
  orange: '#ff774c',
  cream: '#f7f5ef',
  line: '#e3e4dc',
};

export const BREAKPOINTS = {
  tablet: 950,
  mobile: 600,
};

export const SIDEBAR_WIDTH = 240;
export const WORKSPACE_MAX_WIDTH = 1500;

export const PHOTO = {
  maxPerQuestion: 4,
  preview: {
    width: 120,
    height: 68,
  },
  normalization: {
    width: 960,
    height: 540,
    format: 'image/jpeg',
    quality: 0.78,
  },
  r2KeyPattern: 'responses/{responseId}/{itemId}-{filename}',
  maxSizeBytes: 10 * 1024 * 1024,
};

export const OPTION = {
  min: 3,
  max: 6,
  outrosLabel: 'Outros',
};

export const OBSERVATION = {
  minLength: 5,
};

export const METRIC_COLORS = {
  yes: '#22c55e',
  no: '#ef4444',
  other: '#eab308',
  pending: '#e3e4dc',
};

export const PDF = {
  pageSize: 'A4',
  unit: 'mm',
  headerHeight: 34,
  headerBg: '#005ca9',
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
    text: 'Sem Imagens',
    fontSize: 13,
    angle: 24,
  },
  signature: {
    lineFromX: 42,
    lineToX: 168,
  },
};

export const CIPA_SEED_ID = 'cipa-areas-administrativas';
export const CIPA_SHARE_TOKEN = 'cipa-administrativas';
