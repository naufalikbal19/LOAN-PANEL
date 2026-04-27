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

    // iOS video trick: a playing <video> composited over the page
    // shows as a black rectangle in iOS screenshots
    try {
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 2, 2); }
        const stream = (canvas as any).captureStream(1);
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {}

    const show = () => setShowOverlay(true);
    const hide = () => setShowOverlay(false);

    const onKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (print/PDF)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); return; }

      if (e.key === "PrintScreen") {
        // Immediately black — overlay renders before OS snapshot completes in some tools
        show();
        // Override clipboard with a solid black image
        try {
          const c = document.createElement("canvas");
          c.width = window.screen.width;
          c.height = window.screen.height;
          const ctx = c.getContext("2d");
          if (ctx) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.width, c.height); }
          c.toBlob((blob) => {
            if (blob) navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).catch(() => {});
          });
        } catch {}
        setTimeout(hide, 2000);
      }
    };

    // No delay — black INSTANTLY when window loses focus
    // Catches: Snipping Tool, Win+Shift+S, Alt+PrintScreen, any tool that needs to click the screen
    const onBlur = () => show();
    const onFocus = () => hide();

    // Mobile: black when app goes to background (app switcher, notification shade, lock screen)
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
      {/* iOS video layer: shows as black in screenshots on some iOS Safari versions */}
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 99997,
          pointerEvents: "none",
          opacity: 0.002,
          objectFit: "cover",
        }}
      />
      {/* Black overlay for blur/visibility events */}
      {showOverlay && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 99999 }} />
      )}
    </>
  );
}
