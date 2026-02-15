import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handlePlay = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/experience", { replace: true });
    }, 1400);
  }, [navigate]);

  const handleExit = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
      if (typeof window !== "undefined" && !(window as unknown as { closed?: boolean }).closed) {
        window.location.href = "about:blank";
      }
    }
  }, []);

  return (
    <div className="landing-root">
      {/* Cursed energy animated background – no image */}
      <div className="landing-bg">
        <div className="landing-bg-gradient" />
        <div className="landing-bg-glow landing-bg-glow-1" />
        <div className="landing-bg-glow landing-bg-glow-2" />
        <div className="landing-bg-glow landing-bg-glow-3" />
        <div className="landing-bg-energy" />
        <div className="landing-bg-grain" />
      </div>

      {/* Content: title at top center, buttons in center of screen */}
      <div className={`landing-content ${loaded ? "loaded" : ""}`}>
        <header className="landing-header">
          <h1 className="landing-title">「呪術廻戦」</h1>
          <p className="landing-subtitle">Cursed Energy Experience</p>
        </header>

        <div className="landing-buttons">
          <button
            type="button"
            className="landing-btn landing-btn-play"
            onClick={handlePlay}
            disabled={isTransitioning}
          >
            <span className="landing-btn-icon">▶</span> PLAY
          </button>
          <button
            type="button"
            className="landing-btn landing-btn-exit"
            onClick={handleExit}
            disabled={isTransitioning}
          >
            <span className="landing-btn-icon">✖</span> EXIT
          </button>
        </div>
      </div>

      {/* Transition: crack + fade to black */}
      <div className={`landing-transition ${isTransitioning ? "active" : ""}`}>
        <div className="landing-transition-crack" />
        <div className="landing-transition-black" />
      </div>
    </div>
  );
}
