"use client";

import React from "react";

let gradientId = 0;

/**
 * Work Versely — Modern Logo Component
 * A sleek WV monogram inside a rounded dark square with gradient accents.
 */
export default function SiteLogo({ size = 40 }: { size?: number }) {
  // Unique gradient IDs per instance to avoid SVG ID collisions
  const uid = typeof window !== "undefined" ? ++gradientId : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wv-grad-a-${uid}`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`wv-grad-b-${uid}`} x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={`wv-bg-${uid}`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <clipPath id={`wv-clip-${uid}`}>
          <rect width="120" height="120" rx="26" />
        </clipPath>
      </defs>
      {/* Background */}
      <rect width="120" height="120" rx="26" fill={`url(#wv-bg-${uid})`} />
      {/* Subtle border glow */}
      <rect x="0.5" y="0.5" width="119" height="119" rx="25.5" stroke="url(#wv-grad-a-${uid})" strokeWidth="1" fill="none" opacity="0.35" />
      {/* Geometric accent — top-right arc */}
      <g clipPath={`url(#wv-clip-${uid})`} opacity="0.12">
        <circle cx="120" cy="0" r="60" fill="#6366f1" />
      </g>
      {/* W letter */}
      <text
        x="10" y="80"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="58"
        fontWeight="800"
        fill={`url(#wv-grad-a-${uid})`}
        letterSpacing="-1"
      >W</text>
      {/* V letter */}
      <text
        x="56" y="80"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="58"
        fontWeight="300"
        fill={`url(#wv-grad-b-${uid})`}
        letterSpacing="-1"
      >V</text>
      {/* Accent dot */}
      <circle cx="107" cy="18" r="4" fill="#0ea5e9">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Tagline */}
      <text
        x="60" y="108"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="8.5"
        fontWeight="600"
        fill="rgba(99,102,241,0.55)"
        textAnchor="middle"
        letterSpacing="3.5"
      >WORK VERSELY</text>
    </svg>
  );
}
