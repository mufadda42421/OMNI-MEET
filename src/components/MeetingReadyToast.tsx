import React, { useState } from 'react';
import { X, Copy, Check, UserPlus } from 'lucide-react';
import { normalizeRoomId } from '../utils/roomUtils';

interface MeetingReadyToastProps {
  roomId: string;
  onOpenAddPeople: () => void;
  onDismiss: () => void;
}

export const MeetingReadyToast: React.FC<MeetingReadyToastProps> = ({
  roomId,
  onOpenAddPeople,
  onDismiss,
}) => {
  const [copied, setCopied] = useState(false);
  const cleanRoomId = normalizeRoomId(roomId);
  const meetingUrl = `${window.location.origin}?room=${cleanRoomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="absolute bottom-24 left-3 right-3 sm:right-auto sm:left-6 z-40 max-w-sm bg-[#202124] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white font-['Google_Sans',sans-serif]">
            Your meeting&apos;s ready
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Share this joining link with real people you want in the meeting.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <button
          onClick={onOpenAddPeople}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add real people</span>
        </button>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#282a2d] hover:bg-[#323438] text-slate-200 rounded-full text-xs font-medium border border-white/5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link copied!' : 'Copy joining info'}</span>
        </button>
      </div>
    </div>
  );
};
