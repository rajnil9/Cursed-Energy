import { useEffect, useRef, useState } from "react";
import JJKScene from "@/components/JJKScene";
import GestureGuide from "@/components/GestureGuide";

const Index = () => {
  const [techniqueName, setTechniqueName] = useState("CURSED ENERGY");
  const [glowColor, setGlowColor] = useState("#00ffff");

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <div className="grain-overlay" />

      {/* UI Overlay */}
      <div className="absolute top-[8%] w-full text-center z-10 pointer-events-none">
        <h1 className="technique-title">呪術廻戦</h1>
        <div
          className="text-sm md:text-lg font-bold tracking-[4px] uppercase mt-4"
          style={{ color: glowColor, textShadow: `0 0 10px ${glowColor}50` }}
        >
          {techniqueName}
        </div>
      </div>

      {/* Gesture Guide */}
      <GestureGuide />

      {/* Three.js + Camera Scene */}
      <JJKScene
        onTechniqueChange={(name, color) => {
          setTechniqueName(name);
          setGlowColor(color);
        }}
      />
    </div>
  );
};

export default Index;
