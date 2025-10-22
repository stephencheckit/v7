"use client";

import { useState, useRef, useCallback } from 'react';

export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Play video to ensure it's displaying
        await videoRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Failed to access camera. Please ensure camera permissions are granted.');
      return false;
    }
  }, []);

  const captureSnapshot = useCallback((): string | null => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.warn('Cannot capture snapshot: video not ready');
      return null;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 JPEG (strip data URL prefix)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64Image = dataUrl.split(',')[1]; // Remove "data:image/jpeg;base64," prefix

    return base64Image;
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
    setIsRecording(false);
  }, [stream]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isCameraOn,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureSnapshot,
    startRecording,
    stopRecording,
  };
}

