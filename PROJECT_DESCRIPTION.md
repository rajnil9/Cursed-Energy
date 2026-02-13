# How the Project Works

**Cursed Energy** is a web app inspired by *Jujutsu Kaisen*. You use your **webcam and hand gestures** to “cast” different cursed techniques. Each gesture triggers a unique **3D particle effect** and updates the on-screen technique name.

---

## High-level flow

1. **Camera** — The app requests access to your webcam and streams the video.
2. **Hand tracking** — **MediaPipe Hands** (loaded from CDN) runs on each video frame and detects hand landmarks (finger positions).
3. **Gesture → technique** — Simple rules map finger states (which fingers are up/down, pinch) to a technique ID (e.g. index only → Red, peace sign → Infinite Void).
4. **3D scene** — **Three.js** renders ~20,000 particles. Each technique has its own particle layout and colors (e.g. Malevolent Shrine, Hollow Purple, Chimera Shadow Garden).
5. **UI** — The current technique name and a glow color are shown at the top; a **Gesture Guide** in the corner lists which hand shape triggers which technique.

---

## Main pieces

- **Index page** — Full-screen layout: title “呪術廻戦”, technique name (with glow), gesture guide overlay, and the `JJKScene` (3D + camera).
- **JJKScene** — Sets up the **Three.js** scene (particles + bloom), starts the **MediaPipe** camera and Hands pipeline, and in the `onResults` callback:
  - Draws hand landmarks on a canvas over the video.
  - Derives finger states (index up, middle up, pinch, etc.) and picks a technique (e.g. `red`, `void`, `shrine`).
  - Calls `updateState(tech)`, which updates particle targets (positions/colors/sizes) and notifies the parent via `onTechniqueChange(name, color)`.
- **GestureGuide** — A static list of technique names and the hand gesture (emoji + short text) that triggers each one.
- **App** — Wraps the app in Router, React Query, and toast/tooltip providers; the only route used in practice is the Index page (NotFound is the catch-all).

---

## Gesture → technique mapping (in code)

| Gesture (logic in `JJKScene`) | Technique |
|------------------------------|-----------|
| Pinch (thumb–index close) | Hollow Purple |
| Thumb + pinky up 🤙 | Self-Embodiment of Perfection (Mahito) |
| Index + pinky up 🤘 | Chimera Shadow Garden (Megumi) |
| Thumb only 👍 | Idle Death Gamble (Hakari) |
| All fingers extended 🖐️ | Malevolent Shrine |
| Index + middle up ✌️ | Infinite Void |
| Index only ☝️ | Reverse Cursed Technique: Red |
| No hand / default | Neutral (subtle blue particles) |

---

## Tech in this flow

- **MediaPipe** (camera + hands) → raw video + hand landmarks.
- **Custom logic** on landmarks → one technique ID per frame.
- **Three.js** (particles + UnrealBloomPass) → technique-specific 3D effect.
- **React state** (`techniqueName`, `glowColor`) → UI text and glow color from `onTechniqueChange`.

No backend: everything runs in the browser (camera, hand detection, 3D render).
