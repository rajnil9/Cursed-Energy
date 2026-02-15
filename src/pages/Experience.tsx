import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JJKScene from "@/components/JJKScene";
import GestureGuide from "@/components/GestureGuide";
import type { HandScreenPoint } from "@/components/JJKScene";

const Experience = () => {
  const navigate = useNavigate();
  const [techniqueName, setTechniqueName] = useState("CURSED ENERGY");
  const [glowColor, setGlowColor] = useState("#00ffff");
  const [exiting, setExiting] = useState(false);
  const [exitMouseHover, setExitMouseHover] = useState(false);
  const [exitHandHover, setExitHandHover] = useState(false);
  const [menuMouseHover, setMenuMouseHover] = useState(false);
  const [menuHandHover, setMenuHandHover] = useState(false);
  const exitBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastExitHand = useRef(false);
  const lastMenuHand = useRef(false);

  const handleExitDomain = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 700);
  }, [exiting, navigate]);

  const handleHandScreenPositions = useCallback((points: HandScreenPoint[]) => {
    const exitEl = exitBtnRef.current;
    const menuEl = menuRef.current;
    let exitHit = false;
    let menuHit = false;
    for (const p of points) {
      if (exitEl) {
        const r = exitEl.getBoundingClientRect();
        if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) exitHit = true;
      }
      if (menuEl) {
        const r = menuEl.getBoundingClientRect();
        if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) menuHit = true;
      }
    }
    if (exitHit !== lastExitHand.current) {
      lastExitHand.current = exitHit;
      setExitHandHover(exitHit);
    }
    if (menuHit !== lastMenuHand.current) {
      lastMenuHand.current = menuHit;
      setMenuHandHover(menuHit);
    }
  }, []);

  useEffect(() => {
    return () => {
      lastExitHand.current = false;
      lastMenuHand.current = false;
    };
  }, []);

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-background ${techniqueName === "Blood Manipulation" ? "technique-blood" : ""}`}>
      <div className="grain-overlay" />

      {/* Back — top-right, mouse + hand hover glow */}
      <button
        ref={exitBtnRef}
        type="button"
        className={`experience-exit-btn ${exitMouseHover ? "mouse-hover" : ""} ${exitHandHover ? "hand-hover" : ""}`}
        onClick={handleExitDomain}
        disabled={exiting}
        onMouseEnter={() => setExitMouseHover(true)}
        onMouseLeave={() => setExitMouseHover(false)}
        aria-label="Go back to home"
      >
        <span className="experience-exit-btn-icon" aria-hidden>←</span>
        Back
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

      {/* Gesture Menu — side panel, mouse + hand hover glow */}
      <div
        ref={menuRef}
        className={`experience-gesture-menu ${menuMouseHover ? "mouse-hover" : ""} ${menuHandHover ? "hand-hover" : ""}`}
        onMouseEnter={() => setMenuMouseHover(true)}
        onMouseLeave={() => setMenuMouseHover(false)}
      >
        <GestureGuide />
      </div>

      {/* Three.js + Camera Scene */}
      <JJKScene
        onTechniqueChange={(name, color) => {
          setTechniqueName(name);
          setGlowColor(color);
        }}
        onHandScreenPositions={handleHandScreenPositions}
      />

      {/* Fade-out overlay when exiting */}
      <div className={`experience-exit-overlay ${exiting ? "active" : ""}`} aria-hidden />
    </div>
  );
};

export default Experience;
