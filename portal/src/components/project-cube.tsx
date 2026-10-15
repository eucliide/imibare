"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";

type Props = {
  name: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  accent: "emerald" | "blue";
  index: number;
};

const accentColors = {
  emerald: "#10b981",
  blue: "#3b82f6",
};

export function ProjectCube({
  name,
  description,
  href,
  imageSrc,
  imageAlt,
  accent,
  index,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth motion
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], ["6deg", "-6deg"]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], ["-6deg", "6deg"]),
    springConfig
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    mouseX.set(xPct);
    mouseY.set(yPct);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Entrance animation
  const entranceDelay = index * 0.12;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: entranceDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformStyle: "preserve-3d",
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
      }}
    >
      <motion.a
        href={href}
        aria-label={`Open ${name}`}
        className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      >
        {/* Image section — top 65% */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 m-6 mb-0">
          {/* 
            Using plain <img> instead of Next.js <Image>.
            Reason: On Vercel with two static preview images, next/image adds unnecessary
            complexity. Plain <img> with lazy loading is simpler and performs identically
            for these small, unchanging assets.
          */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />

          {/* Accent glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${accentColors[accent]}20, transparent 70%)`,
            }}
          />
        </div>

        {/* Text section — bottom ~35% */}
        <div className="relative flex-none p-6">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <motion.span
          className="absolute right-6 top-6 text-zinc-500 transition-colors group-hover:text-white"
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUpRight size={16} />
        </motion.span>
      </motion.a>
    </motion.div>
  );
}
