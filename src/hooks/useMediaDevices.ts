import { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualBackgroundType } from '../types';
import { VirtualBackgroundProcessor } from '../services/virtualBackground';
import { soundEffects } from '../services/soundEffects';

export interface DeviceInfo {
  deviceId: string;
  label: string;
}

export function useMediaDevices() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [virtualBg, setVirtualBg] = useState<VirtualBackgroundType>('none');
  const [availableCameras, setAvailableCameras] = useState<DeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<DeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const rawStreamRef = useRef<MediaStream | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const bgProcessorRef = useRef<VirtualBackgroundProcessor | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize devices list
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({ deviceId: d.deviceId, label: d.label || `Camera ${index + 1}` }));
      const mics = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${index + 1}` }));

      setAvailableCameras(cameras);
      setAvailableMics(mics);

      if (cameras.length > 0 && !selectedCameraId) setSelectedCameraId(cameras[0].deviceId);
      if (mics.length > 0 && !selectedMicId) setSelectedMicId(mics[0].deviceId);
    } catch (err) {
      console.warn('Could not enumerate devices:', err);
    }
  }, [selectedCameraId, selectedMicId]);

  // Setup Web Audio Analyser for speaking level
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        // Normalize 0 to 100
        const level = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(level);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // AudioContext may not be permitted immediately
    }
  }, []);

  // Synthetic fallback stream if camera is unavailable (e.g. denied or virtual environment)
  const createFallbackStream = useCallback((): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    let frame = 0;
    const draw = () => {
      frame++;
      // Nice subtle animated studio gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Avatar circle
      ctx.beginPath();
      ctx.arc(320, 240, 80 + Math.sin(frame * 0.05) * 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // User initials
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ME', 320, 240);

      requestAnimationFrame(draw);
    };
    draw();

    const videoStream = canvas.captureStream(30);

    // Create dummy silent audio track
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctxAudio = new AudioCtx();
    const osc = ctxAudio.createOscillator();
    const dest = ctxAudio.createMediaStreamDestination();
    const gain = ctxAudio.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    return new MediaStream([videoStream.getVideoTracks()[0], dest.stream.getAudioTracks()[0]]);
  }, []);

  // Initialize camera and mic
  const initMedia = useCallback(async (cameraId?: string, micId?: string) => {
    try {
      if (rawStreamRef.current) {
        rawStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: cameraId ? { deviceId: { exact: cameraId } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: micId ? { deviceId: { exact: micId } } : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasPermission(true);
      } catch (mediaErr) {
        console.warn('getUserMedia failed, using camera fallback:', mediaErr);
        stream = createFallbackStream();
        setHasPermission(false);
      }

      rawStreamRef.current = stream;

      // Initialize background processor
      if (!bgProcessorRef.current) {
        bgProcessorRef.current = new VirtualBackgroundProcessor();
      }

      const processedStream = await bgProcessorRef.current.setInputStream(stream);
      activeStreamRef.current = processedStream;
      setLocalStream(processedStream);

      setupAudioAnalyser(stream);
      await enumerateDevices();
    } catch (err) {
      console.error('Failed to initialize media:', err);
      const fallback = createFallbackStream();
      rawStreamRef.current = fallback;
      activeStreamRef.current = fallback;
      setLocalStream(fallback);
      setHasPermission(false);
    }
  }, [createFallbackStream, enumerateDevices, setupAudioAnalyser]);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (!rawStreamRef.current) return;
    const audioTrack = rawStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      const nextState = !audioTrack.enabled;
      audioTrack.enabled = nextState;
      setIsMuted(!nextState);
      soundEffects.playToggleClick(nextState);
    }
  }, []);

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    if (!rawStreamRef.current) return;
    const videoTrack = rawStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const nextState = !videoTrack.enabled;
      videoTrack.enabled = nextState;
      setIsVideoOff(!nextState);
      soundEffects.playToggleClick(nextState);
    }
  }, []);

  // Set Virtual Background
  const changeVirtualBackground = useCallback((mode: VirtualBackgroundType, customDataUrl?: string) => {
    setVirtualBg(mode);
    if (bgProcessorRef.current) {
      bgProcessorRef.current.setMode(mode, customDataUrl);
    }
  }, []);

  // Screen Sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as MediaTrackConstraints,
        audio: true,
      });

      const videoTrack = screen.getVideoTracks()[0];
      videoTrack.onended = () => {
        stopScreenShare();
      };

      setScreenStream(screen);
      setIsScreenSharing(true);
      return screen;
    } catch (err) {
      console.warn('Screen share cancelled or failed:', err);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  }, [screenStream]);

  // Device switching
  const switchCamera = useCallback(async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    await initMedia(deviceId, selectedMicId);
  }, [initMedia, selectedMicId]);

  const switchMic = useCallback(async (deviceId: string) => {
    setSelectedMicId(deviceId);
    await initMedia(selectedCameraId, deviceId);
  }, [initMedia, selectedCameraId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rawStreamRef.current) rawStreamRef.current.getTracks().forEach((t) => t.stop());
      if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
      if (bgProcessorRef.current) bgProcessorRef.current.destroy();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [screenStream]);

  return {
    localStream,
    screenStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    audioLevel,
    virtualBg,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    hasPermission,
    initMedia,
    toggleMic,
    toggleCamera,
    changeVirtualBackground,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMic,
  };
}
