"use client";

import React from 'react';

let _uid = 0;

/**
 * Work Versaly - Professional Logo
 * Modern WV monogram with gradient accents on dark rounded square.
 */
export default function SiteLogo({ size = 40 }: { size?: number }) {
  const uid = typeof window !== "undefined" ? ++_uid : 0;
  const s = size;
  const gp = "wvP" + uid;
  const ga = "wvA" + uid;
  const gb = "wvBg" + uid;
  const gcl = "wvCl" + uid;

  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gp} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={ga} x1="0" y1="0" x2="120" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id={gb} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <clipPath id={gcl}>
          <rect width="120" height="120" rx="26" />
        </clipPath>
      </defs>
      <rect width="120" height="120" rx="26" fill={"url(#" + gb + ")"} />
      <rect x="1.5" y="1.5" width="117" height="117" rx="25" stroke={"url(#" + gp + ")"} strokeWidth="1.5" fill="none" opacity="0.5" />
      <g clipPath={"url(#" + gcl + ")"} opacity="0.1">
        <circle cx="125" cy="-5" r="65" fill="#3b82f6" />
      </g>
      <g clipPath={"url(#" + gcl + ")"} opacity="0.08">
        <circle cx="-5" cy="125" r="55" fill="#22d3ee" />
      </g>
      <text x="6" y="80" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="58" fontWeight="800" fill={"url(#" + gp + ")"} letterSpacing="-3">W</text>
      <text x="52" y="80" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="58" fontWeight="300" fill={"url(#" + ga + ")"} letterSpacing="-3">V</text>
      <text x="60" y="106" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="7.5" fontWeight="700" fill="rgba(59,130,246,0.45)" textAnchor="middle" letterSpacing="4.5">WORK VERSALY</text>
    </svg>
  );
}