# 🩸 Cursed Energy

 A fan-inspired creative showcase of **Domain Expansions** and **Cursed
 Techniques**\
 from *Jujutsu Kaisen*, visualized through symbolic hand gestures and
 cinematic presentation.

------------------------------------------------------------------------
## ⚡ Project Overview

**Cursed Energy** is a creative project that explores iconic Domain
Expansions and cursed techniques from *Jujutsu Kaisen*.

The objective is to visually demonstrate how specific **hand gestures
activate different cursed techniques**, inspired by the anime's power
system.

------------------------------------------------------------------------

## 🎥 Demonstration Video
<p>

https://github.com/user-attachments/assets/f923b0ec-2e8a-469a-b7ce-ec4d07f6d624

</p>

------------------------------------------------------------------------

## High-level flow

1. **Camera** — The app requests access to your webcam and streams the video.
2. **Hand tracking** — **MediaPipe Hands** (loaded from CDN) runs on each video frame and detects hand landmarks (finger positions).
3. **Gesture → technique** — Simple rules map finger states (which fingers are up/down, pinch) to a technique ID (e.g. index only → Red, peace sign → Infinite Void).
4. **3D scene** — **Three.js** renders ~20,000 particles. Each technique has its own particle layout and colors (e.g. Malevolent Shrine, Hollow Purple, Chimera Shadow Garden).
5. **UI** — The current technique name and a glow color are shown at the top; a **Gesture Guide** in the corner lists which hand shape triggers which technique.

------------------------------------------------------------------------

## 🧿 Techniques & Domain Expansions

| Hand Gesture | Technique |
|--------------|-----------|
| ☝️ Index finger up only | 🔴 **Reverse Cursed Technique: Red** |
| ✌️ Index + Middle up | ♾️ **Infinite Void** |
| 🖖 Middle + Ring up | 🏯 **Malevolent Shrine** |
| 🤏 Pinch + Middle up | 🟣 **Hollow Purple** |
| 🤙 Thumb + Pinky up | 🧬 **Self-Embodiment of Perfection** |
| 👍 Thumbs up (fist + thumb up) | 🎰 **Idle Death Gamble** |
| 🤘 Index + Pinky up | 🌑 **Chimera Shadow Garden** |
| ✊ Fist (all fingers closed) | ⚫ **Black Flash** |
| 🤟 Index + Middle + Ring up | 🔥 **Dismantle** |
| 🖐️ All fingers + thumb up | 🩸 **Blood Manipulation** |
| No hand / default | 🔵 **Neutral (subtle blue particles)** |

------------------------------------------------------------------------




## 🚀 Tech Stack

-   **Build Tool:** Vite
-   **Frontend:** React 18 + TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui (Radix UI)
-   **3D Graphics:** Three.js
-   **Hand Tracking:** MediaPipe Hands

------------------------------------------------------------------------

## 🤖 Powered By

This documentation and conceptual structuring was assisted by **Gemini
3** .

------------------------------------------------------------------------

## ⚠️ Disclaimer

This is a fan-made project inspired by *Jujutsu Kaisen*.\
All original characters and intellectual property belong to their
respective creators.\
This repository is not affiliated with or endorsed by the official
creators.
