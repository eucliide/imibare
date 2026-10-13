"use client";

import { useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function useMotionSafe() {
  const reduced = useReducedMotion();
  return {
    duration: reduced ? 0 : 0.5,
    durationFast: reduced ? 0 : 0.2,
    durationMed: reduced ? 0 : 0.3,
    ease: EASE,
    reduced: !!reduced,
  };
}
