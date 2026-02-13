# 🩸 Cursed Energy

> A fan-inspired creative showcase of **Domain Expansions** and **Cursed
> Techniques**\
> from *Jujutsu Kaisen*, visualized through symbolic hand gestures and
> cinematic presentation.

------------------------------------------------------------------------

## ⚡ Project Overview

**Cursed Energy** is a creative project that explores iconic Domain
Expansions and cursed techniques from *Jujutsu Kaisen*.

The objective is to visually demonstrate how specific **hand gestures
activate different cursed techniques**, inspired by the anime's power
system.

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
|------------------------------|-----------|
| Pinch (thumb–index close) | 🟣Hollow Purple |
| Thumb + pinky up 🤙 | 🧬Self-Embodiment of Perfection |
| Index + pinky up 🤘 | 🌑Chimera Shadow Garden |
| Thumb only 👍 | 🎰 Idle Death Gamble |
| All fingers extended 🖐️ | 🏯Malevolent Shrine |
| Index + middle up ✌️ | ♾️Infinite Void |
| Index only ☝️ | 🔴Reverse Cursed Technique: Red |
| No hand / default | Neutral (subtle blue particles) |
------------------------------------------------------------------------

## 🎥 Demonstration Video

You can attach your demo video like this:

    ## 🎥 Demo

    [Watch the Demo](./jjk.mp4)

Or embed a YouTube video:

    [![Watch the video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)]
    (https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **Build Tool:** Vite
-   **Frontend:** React 18 + TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui (Radix UI)
-   **3D Graphics:** Three.js
-   **Hand Tracking:** MediaPipe Hands
-   **Routing:** React Router
-   **State & Data:** TanStack Query
-   **Forms:** React Hook Form
-   **Validation:** Zod

------------------------------------------------------------------------

## 🤖 Powered By

This documentation and conceptual structuring was assisted by **Gemini
3** and **Cursor**.

------------------------------------------------------------------------

## ⚠️ Disclaimer

This is a fan-made project inspired by *Jujutsu Kaisen*.\
All original characters and intellectual property belong to their
respective creators.\
This repository is not affiliated with or endorsed by the official
creators.
