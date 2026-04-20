const Q_COLORS = {
  "SS": "#ff4aff", "S+": "#ff4aff", "S": "#c084fc",
  "A+": "#22d3ee", "A": "#22d3ee", "A-": "#38bdf8",
  "B+": "#4ade80", "B": "#4ade80", "B-": "#86efac",
  "C+": "#fbbf24", "C": "#fbbf24", "C-": "#fde68a",
  "D+": "#f87171", "D": "#f87171", "D-": "#fca5a5",
  "E": "#94a3b8",
};

const TIERED_OBBY = {
  14: { background: "#11496915", color: "#114969ff", border: "1px solid #11496930" },
  15: { background: "#61c5ff15", color: "#61c5ffff", border: "1px solid #61c5ff30" },
  16: { background: "#e9308615", color: "#e93086ff", border: "1px solid #e9308630" },
  17: { background: "#bbbbbb15", color: "#bbbbbbff", border: "1px solid #bbbbbb30" },
  18: { background: "#0f642815", color: "#0f6428ff", border: "1px solid #0f642830" },
  19: { background: "#0a3e6115", color: "#0a3e61ff", border: "1px solid #0a3e6130" },
  20: { background: "#dfad2315", color: "#dfad23ff", border: "1px solid #dfad2330" },
};

const DIFF_STYLES = {
  Unreal: { 
    background: "#94289415", 
    color: "#94289467", 
    border: "1px solid #94289467",
    image: "./images/Difficulty/UnrealIconModified100.webp"
  },
  Horrific: { 
    background: "#ff4aff15", 
    color: "#ff4aff", 
    border: "1px solid #ff4aff30",
    image: "./images/Difficulty/HorrificIconModified100.webp"
  },
  Catastrophic: { 
    background: "#ffffff15", 
    color: "#ffffff", 
    border: "1px solid #ffffff30",
    image: "./images/Difficulty/CatastrophicIcon.webp"
  },
  Terrifying: { 
    background: "#00ffff15", 
    color: "#00ffffff", 
    border: "1px solid #00ffff30",
    image: "./images/Difficulty/TerrifyingIcon.webp"
  },
  Extreme: { 
    background: "#3facf415", 
    color: "#3facf4ff", 
    border: "1px solid #3facf430",
    image: "./images/Difficulty/ExtremeIcon.webp"
  },
  Inasne: { 
    background: "#0d1dff15", 
    color: "#0d1dffff", 
    border: "1px solid #0d1dff30",
    image: "./images/Difficulty/InsaneIcon.webp"
  },
};

export { Q_COLORS, TIERED_OBBY, DIFF_STYLES };