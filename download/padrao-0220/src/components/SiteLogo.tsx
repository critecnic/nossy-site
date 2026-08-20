"use client";

import React from 'react';
import Image from 'next/image';

export default function SiteLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="NOSSY"
      width={size}
      height={size}
      className="rounded-[22%] object-contain"
      priority
    />
  );
}
