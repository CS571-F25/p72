import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Minimal accessible Tooltip: shows on hover/focus, hidden otherwise.
const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);
  const targetRef = useRef<HTMLSpanElement | null>(null);
  const idRef = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    placement: "top" | "bottom";
  } | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!visible) return;
    const el = targetRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const preferTop = spaceAbove > spaceBelow;
      const placement = preferTop ? "top" : "bottom";
      const left = rect.left + rect.width / 2;
      const top = placement === "top" ? rect.top - 8 : rect.bottom + 8;
      setPos({ left, top, placement });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    // hide on pointerdown anywhere (covers cases where tooltip remains)
    function onPointerDown() {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(false);
      setPos(null);
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("pointerdown", onPointerDown);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [visible]);

  const tooltipNode = (
    <span
      id={idRef.current}
      role="tooltip"
      className="z-50 w-max max-w-xs rounded-md bg-gray-900 text-white text-xs leading-snug px-2 py-1 shadow-lg"
      style={
        visible && pos
          ? {
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform:
                pos.placement === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
              pointerEvents: "none",
            }
          : {
              position: "fixed",
              left: -9999,
              top: -9999,
              pointerEvents: "none",
            }
      }
      aria-hidden={!visible}
    >
      {content}
    </span>
  );

  return (
    <span className={`inline-flex ${className ?? ""}`}>
      <span
        ref={targetRef}
        tabIndex={0}
        aria-describedby={idRef.current}
        onPointerEnter={() => {
          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          setVisible(true);
        }}
        onPointerLeave={() => {
          hideTimerRef.current = window.setTimeout(() => {
            setVisible(false);
            setPos(null);
          }, 80);
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => {
          setVisible(false);
          setPos(null);
        }}
        className="inline-flex items-center"
      >
        {children}
      </span>

      {typeof document !== "undefined"
        ? createPortal(tooltipNode, document.body)
        : null}
    </span>
  );
};

export default Tooltip;
