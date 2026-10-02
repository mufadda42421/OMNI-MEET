import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Hand, Pin, PinOff, MonitorUp } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantTileProps {
  participant: Participant;
  isLocal?: boolean;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  speakingLevel?: number;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  isLocal = false,
  isPinned = false,
  onTogglePin,
  speakingLevel = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const isSpeaking = !participant.isMuted && (speakingLevel > 20 || (participant.audioLevel && participant.audioLevel > 20));

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#202124] transition-all duration-200 group flex items-center justify-center ${
        isSpeaking
          ? 'ring-2 ring-[#8ab4f8] shadow-lg shadow-blue-500/10'
          : 'ring-1 ring-white/5'
      }`}
    >
      {/* Video Element */}
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // always mute local audio to avoid feedback loop
          className={`w-full h-full ${
            participant.isScreenSharing ? 'object-contain bg-black' : 'object-cover'
          } ${isLocal && !participant.isScreenSharing ? '-scale-x-100' : ''}`}
        />
      ) : (
        /* Camera Off Fallback: Large Avatar with Speaker Glow */
        <div className="flex flex-col items-center justify-center p-6">
          <div
            className={`relative flex items-center justify-center rounded-full text-white font-medium text-3xl sm:text-4xl shadow-md transition-all duration-200 ${
              isSpeaking ? 'scale-105 ring-4 ring-[#8ab4f8]/50 ring-offset-4 ring-offset-[#202124]' : ''
            }`}
            style={{
              backgroundColor: participant.avatarColor || '#1a73e8',
              width: isPinned ? '120px' : '90px',
              height: isPinned ? '120px' : '90px',
            }}
          >
            {participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}

            {/* Speaking audio wave indicator around avatar */}
            {isSpeaking && (
              <span className="absolute -inset-2 rounded-full border-2 border-[#8ab4f8] animate-ping opacity-30" />
            )}
          </div>
        </div>
      )}

      {/* Screen Sharing Badge */}
      {participant.isScreenSharing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-blue-300 border border-blue-500/30">
          <MonitorUp className="w-3.5 h-3.5" />
          <span>Presenting</span>
        </div>
      )}

      {/* Hand Raised Floating Badge */}
      {participant.isHandRaised && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-[#1a73e8] text-white rounded-full text-xs font-medium shadow-lg animate-bounce">
          <Hand className="w-3.5 h-3.5" />
          <span>Raised hand</span>
        </div>
      )}

      {/* Hover Pin Button */}
      {onTogglePin && (
        <button
          onClick={() => onTogglePin(participant.id)}
          title={isPinned ? 'Unpin participant' : 'Pin participant'}
          className={`absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-opacity ${
            isPinned ? 'opacity-100 bg-[#1a73e8]' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
      )}

      {/* Bottom Name & Mic Pill (Google Meet signature style) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white max-w-[85%] border border-white/5">
        <span className="truncate">
          {participant.name} {isLocal && '(You)'}
        </span>
        {participant.isMuted ? (
          <div className="p-0.5 rounded-full bg-red-500/20 text-red-400">
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <Mic className={`w-3.5 h-3.5 ${isSpeaking ? 'text-[#8ab4f8]' : 'text-slate-300'}`} />
            {isSpeaking && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#8ab4f8] rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-[#8ab4f8] rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#8ab4f8] rounded-full animate-pulse delay-150" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
