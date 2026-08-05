"use client";

import React from "react";

let _uid = 0;

/**
 * Work Versaly — Professional Logo Component
 * WV monogram with gradient on dark rounded square.
 */
export default function SiteLogo({ size = 40 }: { size?: number }) {
  const uid = typeof window !== "undefined" ? ++_uid : 0;
  const s = size;
  const gp = "wvP" + uid;
  const ga = "wvA" + uid;
  const gb = "wvBg" + uid;
  const gc = "wvC" + uid;
  const gcl = "wvCl" + uid;

  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gp} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={ga} x1="0" y1="0" x2="120" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <linearGradient id={gb} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0c1222" />
        </linearGradient>
        <clipPath id={gcl}>
          <rect width="120" height="120" rx="28" />
        </clipPath>
      </defs>

      {/* Dark rounded background */}
      <rect width="120" height="120" rx="28" fill={"url(#" + gb + ")"} />

      {/* Gradient border */}
      <rect x="1" y="1" width="118" height="118" rx="27" stroke={"url(#" + gp + ")"} strokeWidth="1.2" fill="none" opacity="0.4" />

      {/* Corner glow accents */}
      <g clipPath={"url(#" + gcl + ")"} opacity="0.08">
        <circle cx="130" cy="-10" r="70" fill="#818cf8" />
      </g>
      <g clipPath={"url(#" + gcl + ")"} opacity="0.06">
        <circle cx="-10" cy="130" r="60" fill="#22d3ee" />
      </g>

      {/* W letter - bold */}
      <text
        x="8" y="78"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="56"
        fontWeight="800"
        fill={"url(#" + gp + ")"}
        letterSpacing="-2"
      >W</text>

      {/* V letter - light */}
      <text
        x="54" y="78"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="56"
        fontWeight="300"
        fill={"url(#" + ga + ")"}
        letterSpacing="-2"
      >V</text>

      {/* Accent dot */}
      <circle cx="108" cy="16" r="3.5" fill="#38bdf8" opacity="0.7" />

      {/* Tagline */}
      <text
        x="60" y="106"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="rgba(129,140,248,0.5)"
        textAnchor="middle"
        letterSpacing="4"
      >WORK VERSALY</text>
    </svg>
  );
}