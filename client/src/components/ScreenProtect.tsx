"use client";
import { useEffect, useRef, useState } from "react";

export default function ScreenProtect() {
  const [active, setActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    // --- iOS video layer trick ---
    // iOS Safari renders <video> in a separate hardware compositor layer.
    // When OS takes a screenshot, this layer is excluded → shows as black.
    // Same principle Netflix uses (but Netflix adds DRM on top).
    // mix-blend-mode: screen with a black source = visually transparent on screen,
    // but the video layer is still composited separately so iOS captures it as black.
    const setupVideo = () => {
      const vid = videoRef.current;
      if (!vid) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Black source + screen blend-mode = visually transparent on screen
          // but iOS screenshot compositor sees a black layer
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 2, 2);
        }
        const stream = (canvas as any).captureStream(30);
        vid.srcObject = stream;
        vid.play().catch(() => {});
      } catch {}
    };
    setupVideo();

    // --- PC: instant black on any window blur ---
    // Catches Snipping Tool, Win+Shift+S, Alt+Tab screenshot tools
    const show = () => setShowOverlay(true);
    const hide = () => setShowOverlay(false);

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        return;
      }
      if (e.key === "PrintScreen") {
        show();
        // Replace clipboard with solid black image
        try {
          const c = document.createElement("canvas");
          c.width = window.screen.width;
          c.height = window.screen.height;
          const ctx = c.getContext("2d");
          if (ctx) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.width, c.height); }
          c.toBlob((blob) => {
            if (blob) {
              navigator.clipboard
                .write([new ClipboardItem({ "image/png": blob })])
                .catch(() => {});
            }
          });
        } catch {}
        setTimeout(hide, 2000);
      }
    };

    // No delay — instant black when window loses focus
    const onBlur = () => show();
    const onFocus = () => hide();

    // Mobile: black when app goes to background / notification shade / app switcher
    const onVisibility = () => {
      if (document.visibilityState === "hidden") show();
      else hide();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/*
        iOS screenshot protection via video layer.
        mix-blend-mode: screen + black source = invisible to human eye on screen.
        BUT: iOS compositor captures video layers separately — screenshot shows black.
        This does NOT work on Android (hardware screenshot bypasses compositor events).
        Android requires a native app with FLAG_SECURE — not achievable from web browser.
      */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        loop
        disablePictureInPicture
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 99998,
          pointerEvents: "none",
          objectFit: "cover",
          // screen blend: black + screen = transparent → page visible normally
          mixBlendMode: "screen",
        }}
      />

      {/* Black overlay for blur / visibility events (PC + mobile background) */}
      {showOverlay && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 99999 }} />
      )}
    </>
  );
}
