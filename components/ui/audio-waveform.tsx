"use client";

import { useEffect, useState, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioWaveform({ isRecording, size = 'md' }: AudioWaveformProps) {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 30 }, () => 10));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Initialize Web Audio API for real mic input
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);

          analyser.fftSize = 64; // 32 frequency bins
          const bufferLength = analyser.frequencyBinCount;
          const dataArray: Uint8Array<ArrayBuffer> = new Uint8Array(bufferLength);

          source.connect(analyser);

          // Store references for cleanup
          streamRef.current = stream;
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;

          // Animate bars based on real audio input
          const animate = () => {
            if (!analyserRef.current || !dataArrayRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // Map frequency data to 30 bars
            const newBars = Array.from({ length: 30 }, (_, i) => {
              const dataIndex = Math.floor((i / 30) * dataArrayRef.current!.length);
              const value = dataArrayRef.current![dataIndex];
              // Normalize to 0-100 with minimum height
              return Math.max(10, (value / 255) * 100);
            });

            setBars(newBars);
            animationFrameRef.current = requestAnimationFrame(animate);
          };

          animate();
        } catch (error) {
          console.error('Error accessing microphone:', error);
          // Fallback to random animation if mic access fails
          const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.random() * 100));
          }, 100);
          return () => clearInterval(interval);
        }
      };

      initAudio();

      return () => {
        // Cleanup: Stop all audio
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        // CRITICAL: Stop all microphone tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    } else {
      // Reset to flat when not recording
      setBars(Array.from({ length: 30 }, () => 10));

      // Also cleanup any active streams when switching to not recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
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

