import React from 'react';

export default function SurvivorVisual({ width = 28, height = 28, className = "" }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 40 40"
      className={`${className} animate-survival-bob overflow-visible`}
    >
      {/* Wavy Arms waving for help */}
      <path d="M10 14 L5 8 M30 14 L35 8" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" className="animate-arms-wave" />
      {/* Body torso */}
      <path d="M20 14.5 v8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
      {/* Waving Person Head */}
      <circle cx="20" cy="10" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      {/* Orange rescue buoy ring floating on water */}
      <ellipse cx="20" cy="21" rx="10" ry="5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
