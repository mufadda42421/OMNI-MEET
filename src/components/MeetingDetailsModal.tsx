import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Lock, Link as LinkIcon, Radio } from 'lucide-react';

interface MeetingDetailsModalProps {
  roomId: string;
  encryptionFingerprint: string;
  onClose: () => void;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  roomId,
  encryptionFingerprint,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const meetingUrl = `${window.location.origin}?room=${roomId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-[#202124] border-l border-white/5 flex flex-col z-30 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <h2 className="font-medium text-base text-white">Meeting details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Joining Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Joining info
          </h3>
          <div className="p-3 bg-[#282a2d] rounded-xl border border-white/5 space-y-2">
            <div className="text-xs text-slate-300 break-all select-all font-mono">
              {meetingUrl}
            </div>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 text-xs font-medium text-[#8ab4f8] hover:text-blue-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link copied' : 'Copy joining info'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-medium text-slate-300">Meeting code:</span>
            <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-white">{roomId}</span>
          </div>
        </div>

        {/* Security & WebRTC Status */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8ab4f8]" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Security & Encryption
            </h3>
          </div>

          <div className="p-3 bg-[#282a2d] rounded-xl border border-blue-500/20 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-medium">
              <Lock className="w-4 h-4 text-[#8ab4f8]" />
              <span>End-to-End Encrypted Session</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Video & audio streams are encrypted end-to-end via WebRTC DTLS/SRTP protocols.
              Chat messages are client-encrypted with AES-256-GCM.
            </p>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                Security Key Fingerprint
              </span>
              <div className="font-mono text-xs text-[#8ab4f8] bg-black/40 p-2 rounded tracking-widest break-all select-all">
                {encryptionFingerprint || 'GENERATING-KEY-FINGERPRINT'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-green-400 pt-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Signaling WebSocket: Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
