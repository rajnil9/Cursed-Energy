const gestures = [
  { name: "Reverse Cursed Technique: Red", gesture: "☝️ Index finger up only", color: "#ff3333" },
  { name: "Infinite Void", gesture: "✌️ Index + Middle up", color: "#00ffff" },
  { name: "Malevolent Shrine", gesture: "🖖 Middle + Ring up", color: "#ff0000" },
  { name: "Hollow Purple", gesture: "🤏 Pinch + Middle up", color: "#bb00ff" },
  { name: "Self-Embodiment of Perfection", gesture: "🤙 Thumb + Pinky up", color: "#00ccaa" },
  { name: "Idle Death Gamble", gesture: "👍 Thumb up only", color: "#ffaa00" },
  { name: "Chimera Shadow Garden", gesture: "🤘 Index + Pinky up", color: "#6633aa" },
  { name: "Black Flash", gesture: "✊ Fist (all fingers closed)", color: "#ff1a1a" },
  { name: "Dismantle", gesture: "🤟 Index + Middle + Ring up", color: "#8b0000" },
  { name: "Blood Manipulation", gesture: "🖐️ All fingers + thumb up", color: "#6B0F1A" },
];

const GestureGuide = () => {
  return (
    <div className="gesture-guide-card gesture-guide-inner rounded-xl p-3 space-y-1.5">
      <h3 className="text-foreground font-bold text-[10px] tracking-[3px] uppercase mb-2 text-center opacity-70">
        Hand Gestures
      </h3>
      {gestures.map((g) => (
        <div key={g.name} className="flex items-start gap-2 text-[11px]">
          <span className="text-base leading-none shrink-0 pt-0.5">{g.gesture.split(" ")[0]}</span>
          <div className="min-w-0 flex-1 break-words">
            <div className="font-semibold leading-tight" style={{ color: g.color }}>
              {g.name}
            </div>
            <div className="text-muted-foreground text-[9px] leading-tight mt-0.5">
              {g.gesture.indexOf(" ") >= 0 ? g.gesture.substring(g.gesture.indexOf(" ") + 1) : g.gesture}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GestureGuide;
