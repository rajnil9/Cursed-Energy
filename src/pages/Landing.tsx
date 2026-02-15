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
      {/* Split background: Gojo (left) + Sukuna (right) */}
      <div className="landing-bg-split">
        <div className="landing-side landing-gojo">
          <div className="landing-aura landing-aura-gojo" />
          <div className="landing-figure landing-figure-gojo" aria-hidden />
        </div>
        <div className="landing-side landing-sukuna">
          <div className="landing-aura landing-aura-sukuna" />
          <div className="landing-figure landing-figure-sukuna" aria-hidden />
        </div>
      </div>

      {/* Center vignette so middle stays clear for title/buttons */}
      <div className="landing-vignette" />

      {/* Content */}
      <div className={`landing-content ${loaded ? "loaded" : ""}`}>
        <h1 className="landing-title">「呪術廻戦」</h1>
        <p className="landing-subtitle">Cursed Energy Experience</p>

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
