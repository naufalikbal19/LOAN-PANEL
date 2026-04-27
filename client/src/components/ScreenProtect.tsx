"use client";
import { useEffect, useState } from "react";

export default function ScreenProtect() {
  const [active, setActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    let blurTimer: ReturnType<typeof setTimeout>;

    const flashBlack = (duration = 1500) => {
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), duration);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        // Override clipboard with a black pixel image
        const canvas = document.createElement("canvas");
        canvas.width = window.screen.width;
        canvas.height = window.screen.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              navigator.clipboard
                .write([new ClipboardItem({ "image/png": blob })])
                .catch(() => {});
            }
          });
        }
        flashBlack(1500);
      }
      // Block Ctrl+P (print/save as PDF)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
      }
    };

    // Snipping Tool & Win+Shift+S blur the window before capturing
    const onBlur = () => {
      blurTimer = setTimeout(() => setShowOverlay(true), 80);
    };
    const onFocus = () => {
      clearTimeout(blurTimer);
      setShowOverlay(false);
    };

    // Mobile: when app goes to background
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setShowOverlay(true);
      else setTimeout(() => setShowOverlay(false), 300);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(blurTimer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active || !showOverlay) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "#333", fontSize: 12, userSelect: "none" }}>🔒</p>
    </div>
  );
}
