const Q_COLORS = {
  SS: "#ff4aff",
  "S+": "#ff4aff",
  S: "#c084fc",
  "A+": "#22d3ee",
  A: "#22d3ee",
  "A-": "#38bdf8",
  "B+": "#4ade80",
  B: "#4ade80",
  "B-": "#86efac",
  "C+": "#fbbf24",
  C: "#fbbf24",
  "C-": "#fde68a",
  "D+": "#f87171",
  D: "#f87171",
  "D-": "#fca5a5",
  E: "#94a3b8",
  F: "#94a3b8",
};

const TIERED_OBBY = {
  14: {
    background: "#11496915",
    color: "#114969ff",
    border: "1px solid #11496930",
    image: "/images/Tiered/14.png",
  },
  15: {
    background: "#61c5ff15",
    color: "#61c5ffff",
    border: "1px solid #61c5ff30",
    image: "/images/Tiered/15.png",
  },
  16: {
    background: "#e9308615",
    color: "#e93086ff",
    border: "1px solid #e9308630",
    image: "/images/Tiered/16.png",
  },
  17: {
    background: "#bbbbbb15",
    color: "#bbbbbbff",
    border: "1px solid #bbbbbb30",
    image: "/images/Tiered/17.png",
  },
  18: {
    background: "#0f642815",
    color: "#0f6428ff",
    border: "1px solid #0f642830",
    image: "/images/Tiered/18.png",
  },
};

const DIFF_STYLES = {
  Unreal: {
    background: "#7d3ef321",
    color: "#7b34ffee",
    border: "1px solid #7d3ef3ee",
    image: "/images/Difficulty/UnrealIconModified100.webp",
    diffnum: 13,
  },
  Horrific: {
    background: "#ff4aff15",
    color: "#e48dff",
    border: "1px solid #ff4aff30",
    image: "/images/Difficulty/HorrificIconModified100.webp",
    diffnum: 12,
  },
  Catastrophic: {
    background: "#ffffff15",
    color: "#ebebebff",
    border: "1px solid #ffffff30",
    image: "/images/Difficulty/CatastrophicIcon.webp",
    diffnum: 11,
  },
  Terrifying: {
    background: "#00ffff15",
    color: "#00ffffff",
    border: "1px solid #00ffff30",
    image: "/images/Difficulty/TerrifyingIcon.webp",
    diffnum: 10,
  },
  Extreme: {
    background: "#3facf415",
    color: "#3facf4ff",
    border: "1px solid #3facf430",
    image: "/images/Difficulty/ExtremeIcon.webp",
    diffnum: 9,
  },
  Insane: {
    background: "#0d1dff15",
    color: "#0d1dffff",
    border: "1px solid #0d1dff30",
    image: "/images/Difficulty/InsaneIcon.webp",
    diffnum: 8,
  },
};

const Pace_Based_STYLES = {
  Ethereal: {
    background: "#c3c3c421",
    color: "#bebebeee",
    border: "1px solid #e3e3e4ee",
    image: "/images/PaceBased/Ethereal.png",
    diffnum: 9,
  },

  Legendary: {
    background: "#3facf421",
    color: "#3facf4ee",
    border: "1px solid #3facf4ee",
    image: "/images/PaceBased/Legendary.png",
    diffnum: 8,
  },

  Extreme: {
    background: "#f746eb21",
    color: "#cd99f2ee",
    border: "1px solid #f38afaee",
    image: "/images/PaceBased/Extreme_PB.png",
    diffnum: 7,
  }
};

export { Q_COLORS, TIERED_OBBY, DIFF_STYLES, Pace_Based_STYLES };
