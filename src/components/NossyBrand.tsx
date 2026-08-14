"use client";

import React from 'react';
import Image from 'next/image';

/**
 * NOSSY brand name as image - prevents browser auto-translation.
 * Uses pre-rendered PNG text so the brand name is never altered.
 */
export default function NossyBrand({
  variant = 'dark',
  size = 24,
  className = '',
}: {
  /** 'dark' for light backgrounds, 'white' for dark backgrounds, 'sky' for accent */
  variant?: 'dark' | 'white' | 'sky';
  /** Font size in px (maps to image height) */
  size?: 20 | 24 | 28 | 32 | 36 | 40 | 48;
  /** Additional CSS classes */
  className?: string;
}) {
  const src = `/brand/nossy-${variant}-${size}.png`;
  // Approximate width based on size (NOSSY is ~4.5x wider than tall for DejaVu Bold)
  const widthMap: Record<number, number> = {
    20: 80, 24: 96, 28: 112, 32: 128, 36: 140, 40: 160, 48: 190,
  };
  const heightMap: Record<number, number> = {
    20: 24, 24: 28, 28: 32, 32: 36, 36: 40, 40: 44, 48: 52,
  };

  return (
    <Image
      src={src}
      alt="NOSSY"
      width={widthMap[size] || 96}
      height={heightMap[size] || 28}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
