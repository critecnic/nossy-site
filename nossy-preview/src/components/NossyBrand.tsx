"use client";

import React from 'react';

export default function NossyBrand({ variant = 'dark', size = 28, className = '' }: { variant?: 'dark' | 'white'; size?: number; className?: string }) {
  const color = variant === 'white' ? '#ffffff' : '#0f172a';
  return (
    <svg viewBox="0 0 200 48" className={className} style={{ width: size * 3.5, height: size * 0.85 }} fill="none">
      <text x="0" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="38" fill={color} letterSpacing="-1">NOSSY</text>
    </svg>
  );
}
