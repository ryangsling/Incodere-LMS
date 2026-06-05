"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SmoothScrollProvider
 *
 * Canonical Lenis + GSAP integration for AntiSlopUI.
 * This wires the Lenis scroll instance into the GSAP ticker to ensure
 * all GSAP animations (ScrollTrigger, etc) are perfectly synced with smooth scroll.
 */
export function SmoothScrollProvider({ children }) {
  useLayoutEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Wire Lenis to GSAP Ticker
    function update(time) {
      lenisInstance.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger on Lenis scroll
    lenisInstance.on("scroll", ScrollTrigger.update);

    // Cleanup
    return () => {
      gsap.ticker.remove(update);
      lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}

/**
 * useReducedMotion Bridge
 *
 * Returns true if the user has requested reduced motion at the OS level.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reducedMotion;
}
