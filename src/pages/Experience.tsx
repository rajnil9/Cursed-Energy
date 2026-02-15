import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import JJKScene from "@/components/JJKScene";
import GestureGuide from "@/components/GestureGuide";

const Experience = () => {
  const navigate = useNavigate();
  const [techniqueName, setTechniqueName] = useState("CURSED ENERGY");
  const [glowColor, setGlowColor] = useState("#00ffff");
  const [exiting, setExiting] = useState(false);

  const handleExitDomain = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 700);
  }, [exiting, navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <div className="grain-overlay" />

      {/* EXIT — top-right, returns to home and stops camera/gestures */}
      <button
        type="button"
        className="experience-exit-btn"
        onClick={handleExitDomain}
        disabled={exiting}
        aria-label="Exit and return to home"
      >
        <span className="experience-exit-btn-icon" aria-hidden>✖</span>
        EXIT
      </button>

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

      {/* Fade-out overlay when exiting */}
      <div className={`experience-exit-overlay ${exiting ? "active" : ""}`} aria-hidden />
    </div>
  );
};

export default Experience;
