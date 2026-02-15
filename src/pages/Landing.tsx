import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const KANJI_BG = ["呪", "術", "廻", "戦", "闘", "域", "界", "縛", "獄"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  life: number;
}

interface CursorDot {
  x: number;
  y: number;
  t: number;
  id: number;
}

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const cursorDotsRef = useRef<CursorDot[]>([]);
  const dotIdRef = useRef(0);
  const [cursorDots, setCursorDots] = useState<CursorDot[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rafRef = useRef<number>(0);

  // Fade-in on load
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Heartbeat pulse sound on load (optional)
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const playPulse = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      };
      const t1 = setTimeout(playPulse, 400);
      const t2 = setTimeout(playPulse, 700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch {
      // ignore if AudioContext not supported
    }
  }, []);

  // Init particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const count = 120;
    const w = canvas.width;
    const h = canvas.height;
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 2,
        hue: Math.random() < 0.4 ? 0 : Math.random() < 0.7 ? 270 : 240,
        alpha: 0.15 + Math.random() * 0.25,
        life: Math.random(),
      });
    }
    particlesRef.current = arr;
  }, []);

  // Mouse move: cursor trail + particle attraction
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseRef.current = { x: clientX / w, y: clientY / h };
    cursorDotsRef.current = [
      ...cursorDotsRef.current.slice(-18),
      { x: clientX, y: clientY, t: 1, id: dotIdRef.current++ },
    ];
    setCursorDots(cursorDotsRef.current);
  }, []);

  // Animation loop: particles + cursor trail decay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;

      particlesRef.current.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(80 / dist, 2);
        p.vx += (dx / dist) * force * 0.012;
        p.vy += (dy / dist) * force * 0.012;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.008;
        if (p.life > 1) p.life = 0;
        if (p.x < 0 || p.x > w) p.vx *= -0.5;
        if (p.y < 0 || p.y > h) p.vy *= -0.5;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        const pulse = 0.7 + 0.3 * Math.sin(time * 1.5 + p.life * 6);
        const a = p.alpha * pulse;
        ctx.fillStyle = `hsla(${p.hue}, 85%, 55%, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Cursor trail decay (throttled state update)
  useEffect(() => {
    const iv = setInterval(() => {
      cursorDotsRef.current = cursorDotsRef.current
        .map((d) => ({ ...d, t: Math.max(0, d.t - 0.06) }))
        .filter((d) => d.t > 0);
      setCursorDots([...cursorDotsRef.current]);
    }, 60);
    return () => clearInterval(iv);
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
    <div
      className="landing-root"
      onMouseMove={onMouseMove}
    >
      {/* Cursor trail */}
      <div className="landing-cursor-trail" aria-hidden>
        {cursorDots.map((d) => (
          <div
            key={d.id}
            className="cursor-dot"
            style={{
              left: d.x,
              top: d.y,
              opacity: d.t,
              transform: `translate(-50%,-50%) scale(${d.t})`,
            }}
          />
        ))}
      </div>

      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="landing-canvas"
        aria-hidden
      />

      {/* Fog / gradient overlay */}
      <div className="landing-fog" />
      <div className="landing-gradient" />

      {/* Floating kanji */}
      <div className="landing-kanji">
        {KANJI_BG.map((k, i) => (
          <span key={i} className="landing-kanji-char" style={{ ["--i" as string]: i }}>
            {k}
          </span>
        ))}
      </div>

      {/* Ambient pulse overlay */}
      <div className="landing-pulse" />

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
