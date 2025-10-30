"use client";

import { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioWaveform({ isRecording, size = 'md' }: AudioWaveformProps) {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (isRecording) {
      // Initialize random heights
      const initialHeights = Array.from({ length: 30 }, () => Math.random() * 100);
      setBars(initialHeights);

      // Animate bars
      const interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.random() * 100));
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Reset to flat
      setBars(Array.from({ length: 30 }, () => 10));
    }
  }, [isRecording]);

  const heights = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24'
  };

  return (
    <div className={`flex items-center justify-center gap-0.5 ${heights[size]} w-full`}>
      {bars.map((height, idx) => (
        <div
          key={idx}
          className="flex-1 bg-gradient-to-t from-[#c4dfc4] to-[#c8e0f5] rounded-full transition-all duration-100 ease-out"
          style={{
            height: `${height}%`,
            opacity: isRecording ? 0.6 + (height / 200) : 0.3,
          }}
        />
      ))}
    </div>
  );
}

