import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JJKScene from "@/components/JJKScene";
import GestureGuide from "@/components/GestureGuide";
import type { HandScreenPoint } from "@/components/JJKScene";

type VideoDevice = { deviceId: string; label: string };

const Experience = () => {
  const navigate = useNavigate();
  const [techniqueName, setTechniqueName] = useState("CURSED ENERGY");
  const [glowColor, setGlowColor] = useState("#00ffff");
  const [exiting, setExiting] = useState(false);
  const [exitMouseHover, setExitMouseHover] = useState(false);
  const [exitHandHover, setExitHandHover] = useState(false);
  const [menuMouseHover, setMenuMouseHover] = useState(false);
  const [menuHandHover, setMenuHandHover] = useState(false);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [cameraDeviceId, setCameraDeviceId] = useState<string | null>(null);
  const [cameraStreamUrl, setCameraStreamUrl] = useState<string | null>(null);
  const [streamUrlInput, setStreamUrlInput] = useState("");
  const [cameraPanelOpen, setCameraPanelOpen] = useState(false);
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

  useEffect(() => {
    const list = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(
          devices
            .filter((d) => d.kind === "videoinput")
            .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }))
        );
      } catch {
        setVideoDevices([]);
      }
    };
    list();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
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

      {/* Camera source — phone as webcam (bottom-left) */}
      <div className="absolute bottom-[2%] left-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setCameraPanelOpen((o) => !o)}
          className="experience-exit-btn text-xs py-1 px-2"
          aria-expanded={cameraPanelOpen}
        >
          {cameraPanelOpen ? "▼ Camera" : "▶ Camera (phone as webcam)"}
        </button>
        {cameraPanelOpen && (
          <div className="experience-gesture-menu w-72 p-3 space-y-3">
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Camera device
            </label>
            <p className="text-[9px] text-muted-foreground mb-1">
              Install DroidCam (Android) or EpocCam (iPhone) to use your phone as a webcam; it will appear here.
            </p>
            <select
              value={cameraDeviceId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setCameraDeviceId(v || null);
                if (v) setCameraStreamUrl(null);
              }}
              className="w-full bg-background/80 border border-border rounded px-2 py-1.5 text-sm text-foreground"
            >
              <option value="">Default (built-in)</option>
              {videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
            <div className="border-t border-border pt-2">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Or IP Webcam URL (phone app)
              </label>
              <div className="flex gap-1">
                <input
                  type="url"
                  placeholder="http://192.168.1.x:8080/video"
                  value={streamUrlInput}
                  onChange={(e) => setStreamUrlInput(e.target.value)}
                  className="flex-1 min-w-0 bg-background/80 border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = streamUrlInput.trim() || null;
                    setCameraStreamUrl(url);
                    if (url) setCameraDeviceId(null);
                  }}
                  className="experience-exit-btn text-xs py-1 px-2 shrink-0"
                >
                  Use
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">
                Use IP Webcam (Android) or similar; enter the video URL and tap Use. Scene will reload.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Three.js + Camera Scene */}
      <JJKScene
        onTechniqueChange={(name, color) => {
          setTechniqueName(name);
          setGlowColor(color);
        }}
        onHandScreenPositions={handleHandScreenPositions}
        cameraDeviceId={cameraDeviceId}
        cameraStreamUrl={cameraStreamUrl}
      />

      {/* Fade-out overlay when exiting */}
      <div className={`experience-exit-overlay ${exiting ? "active" : ""}`} aria-hidden />
    </div>
  );
};

export default Experience;
