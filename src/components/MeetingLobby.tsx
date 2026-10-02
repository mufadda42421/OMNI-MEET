import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  MonitorUp,
  ShieldCheck,
  Settings,
  Volume2,
  UserPlus,
} from 'lucide-react';
import { VirtualBackgroundType } from '../types';
import { VirtualBackgroundModal } from './VirtualBackgroundModal';
import { SettingsModal } from './SettingsModal';
import { DeviceInfo } from '../hooks/useMediaDevices';

interface MeetingLobbyProps {
  roomId: string;
  userName: string;
  setUserName: (name: string) => void;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  audioLevel: number;
  virtualBg: VirtualBackgroundType;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSelectVirtualBg: (type: VirtualBackgroundType, customUrl?: string) => void;
  onJoinMeeting: (startWithScreenShare?: boolean) => void;
  availableCameras: DeviceInfo[];
  availableMics: DeviceInfo[];
  selectedCameraId: string;
  selectedMicId: string;
  onSelectCamera: (id: string) => void;
  onSelectMic: (id: string) => void;
  onOpenAddPeople?: () => void;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  roomId,
  userName,
  setUserName,
  localStream,
  isMuted,
  isVideoOff,
  audioLevel,
  virtualBg,
  onToggleMic,
  onToggleCamera,
  onSelectVirtualBg,
  onJoinMeeting,
  availableCameras,
  availableMics,
  selectedCameraId,
  selectedMicId,
  onSelectCamera,
  onSelectMic,
  onOpenAddPeople,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showBgModal, setShowBgModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="w-full h-full min-h-screen bg-[#202124] text-white flex flex-col justify-between overflow-y-auto">
      {/* Top Navbar */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center font-bold text-white shadow-sm">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white font-['Google_Sans',sans-serif]">
            Omni <span className="font-semibold text-[#8ab4f8]">Meet</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            title="Audio & Video Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14">
        {/* Left: Video Preview Card */}
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#131314] shadow-2xl border border-white/10 flex items-center justify-center group">
            {localStream && !isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full bg-[#1a73e8] flex items-center justify-center text-3xl font-semibold text-white shadow-xl">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-400">Camera is off</span>
              </div>
            )}

            {/* Bottom Floating Control Bar on Preview */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
              {/* Mic Toggle */}
              <button
                onClick={onToggleMic}
                title={isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                className={`p-3 rounded-full transition-all ${
                  isMuted
                    ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4f54]'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Toggle */}
              <button
                onClick={onToggleCamera}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                className={`p-3 rounded-full transition-all ${
                  isVideoOff
                    ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4f54]'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Visual Effects (Virtual Backgrounds) Toggle */}
              <button
                onClick={() => setShowBgModal(true)}
                title="Apply visual effects & virtual background"
                className={`p-3 rounded-full transition-all ${
                  virtualBg !== 'none'
                    ? 'bg-[#8ab4f8] text-[#202124]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4f54]'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {/* Live Mic Level wave badge on preview */}
            {!isMuted && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-slate-200 border border-white/10">
                <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="flex items-end gap-0.5 h-3">
                  <span
                    className="w-1 bg-[#10b981] rounded-full transition-all"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 12)}px` }}
                  />
                  <span
                    className="w-1 bg-[#10b981] rounded-full transition-all"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
                  />
                  <span
                    className="w-1 bg-[#10b981] rounded-full transition-all"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 10)}px` }}
                  />
                </span>
              </div>
            )}

            {/* Current Active Virtual Background Badge */}
            {virtualBg !== 'none' && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-[#8ab4f8]/20 backdrop-blur-md border border-[#8ab4f8]/40 rounded-full text-[11px] font-medium text-[#8ab4f8]">
                <Sparkles className="w-3 h-3" />
                <span className="capitalize">{virtualBg.replace('-', ' ')}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Encrypted WebRTC P2P Room Ready</span>
          </div>
        </div>

        {/* Right: Join Form Card */}
        <div className="w-full max-w-md space-y-6 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl font-normal text-white">Ready to join?</h1>
            <p className="text-sm text-slate-400">
              Meeting room: <span className="font-mono text-white font-medium">{roomId}</span>
            </p>
          </div>

          {/* Name input */}
          <div className="w-full space-y-1.5 text-left">
            <label className="text-xs text-slate-400 font-medium">Your display name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#2d2e30] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8ab4f8] transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onJoinMeeting(false)}
              disabled={!userName.trim()}
              className="flex-1 py-3 px-6 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-40 disabled:hover:bg-[#1a73e8] text-white rounded-full font-medium text-sm shadow-lg transition-all active:scale-95"
            >
              Join now
            </button>
            <button
              onClick={() => onJoinMeeting(true)}
              disabled={!userName.trim()}
              className="py-3 px-5 bg-[#3c4043] hover:bg-[#4a4f54] disabled:opacity-40 disabled:hover:bg-[#3c4043] text-white rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MonitorUp className="w-4 h-4 text-[#8ab4f8]" />
              <span>Present</span>
            </button>
          </div>

          {/* Invite Real People */}
          {onOpenAddPeople && (
            <button
              onClick={onOpenAddPeople}
              className="w-full py-2.5 px-4 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-[#8ab4f8] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite real people (Link, Phone QR & Email)</span>
            </button>
          )}

          {/* Security details hint */}
          <div className="p-4 rounded-2xl bg-[#282a2d] border border-white/5 w-full text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#8ab4f8]" />
              <span>Enterprise Grade Security</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your audio, video, screen share, and chat communications are protected by WebRTC DTLS/SRTP and client-side AES-256 encryption.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 px-6 flex items-center justify-center text-xs text-slate-500 border-t border-white/5">
        Omni Meet • WebRTC Cross-Browser Video Conferencing
      </footer>

      {/* Virtual Background Modal */}
      {showBgModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <VirtualBackgroundModal
            currentBg={virtualBg}
            onSelectBg={onSelectVirtualBg}
            onClose={() => setShowBgModal(false)}
          />
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          availableCameras={availableCameras}
          availableMics={availableMics}
          selectedCameraId={selectedCameraId}
          selectedMicId={selectedMicId}
          onSelectCamera={onSelectCamera}
          onSelectMic={onSelectMic}
          audioLevel={audioLevel}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
