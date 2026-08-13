"use client";

import React from 'react';
import Image from 'next/image';

/**
 * NOSSY - Seek and you shall find.
 * Uses the official NOSSY logo image.
 */
export default function SiteLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="NOSSY - Seek and you shall find."
      width={size}
      height={size}
      className="rounded-[22%] object-contain"
      priority
    />
  );
}
