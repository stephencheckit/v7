"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Connect stream to video element when both are available
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log('[useVideoRecording] useEffect: Connecting stream to video element...');
      videoRef.current.srcObject = stream;
      
      videoRef.current.onloadedmetadata = () => {
        console.log('[useVideoRecording] Video metadata loaded');
        console.log('[useVideoRecording] Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
      };
      
      videoRef.current.play().then(() => {
        console.log('[useVideoRecording] Video is playing');
      }).catch(err => {
        console.error('[useVideoRecording] Error playing video:', err);
      });
    }
  }, [stream, isCameraOn]);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      console.log('[useVideoRecording] Requesting camera access with facingMode:', facingMode);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: facingMode }
        },
        audio: false
      });
      
      console.log('[useVideoRecording] Got media stream:', mediaStream);
      console.log('[useVideoRecording] Video tracks:', mediaStream.getVideoTracks());
      
      // Set stream and camera state - useEffect will handle connecting to video element
      setStream(mediaStream);
      setIsCameraOn(true);
      
      return true;
    } catch (error) {
      console.error('[useVideoRecording] Failed to start camera:', error);
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

