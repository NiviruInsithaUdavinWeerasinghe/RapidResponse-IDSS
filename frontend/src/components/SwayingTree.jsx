import React from 'react';

export default function SwayingTree({ width = 36, height = 54, delay = "0s", className = "" }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 120" 
      className={`${className} animate-tree-sway overflow-visible`} 
      style={{ animationDelay: delay }}
    >
      {/* Lightened Trunk Structure for dark backgrounds */}
      <path 
        d="M50 42 L50 110 M20 112 H80 M50 60 C32 60, 22 58, 22 46 M50 72 C68 72, 78 70, 78 56" 
        fill="none" 
        stroke="#64748b" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Canopy with glowing bright neon cyan and semi-transparent filled slate */}
      <path 
        d="M16 42 C5 42, 2 30, 12 22 C8 10, 24 6, 30 12 C34 0, 48 -2, 50 -2 C52 -2, 66 0, 70 12 C76 6, 92 10, 88 22 C98 30, 95 42, 84 42 Z" 
        fill="#1e293b" 
        fillOpacity="0.8" 
        stroke="#22d3ee" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Inner canopy dividers */}
      <path 
        d="M30 12 C34 16, 44 16, 50 16 C56 16, 66 16, 70 12" 
        fill="none" 
        stroke="#22d3ee" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M16 28 C22 28, 28 22, 30 12" 
        fill="none" 
        stroke="#22d3ee" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M84 28 C78 28, 72 22, 70 12" 
        fill="none" 
        stroke="#22d3ee" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
