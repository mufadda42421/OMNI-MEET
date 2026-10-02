import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  MonitorUp,
  MonitorX,
  Hand,
  Smile,
  Settings,
  PhoneOff,
  Info,
  Users,
  MessageSquare,
  UserPlus,
} from 'lucide-react';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  activePanel: 'chat' | 'people' | 'info' | 'bg' | 'settings' | null;
  unreadChatCount: number;
  participantCount: number;
  meetingTimeStr: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onTogglePanel: (panel: 'chat' | 'people' | 'info' | 'bg' | 'settings') => void;
  onSendReaction: (emoji: string) => void;
  onLeaveMeeting: () => void;
  onAddTestColleague: () => void;
  onOpenAddPeople: () => void;
}

const EMOJIS = ['💖', '👍', '👏', '😂', '😮', '🎉', '🔥'];

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  activePanel,
  unreadChatCount,
  participantCount,
  meetingTimeStr,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleHandRaise,
  onTogglePanel,
  onSendReaction,
  onLeaveMeeting,
  onAddTestColleague,
  onOpenAddPeople,
}) => {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  return (
    <div className="relative w-full h-20 px-4 sm:px-6 flex items-center justify-between bg-[#1e1e1e] select-none border-t border-white/5">
      {/* Left: Meeting Time & Add Real People & Add Test Peer */}
      <div className="hidden md:flex items-center gap-3 text-sm font-medium text-slate-300">
        <span className="font-mono text-xs">{meetingTimeStr}</span>
        <span className="text-white/20">|</span>
        <button
          onClick={onOpenAddPeople}
          title="Add real people via link, QR code, or email"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Real People</span>
        </button>
        <button
          onClick={onAddTestColleague}
          title="Add a simulated peer to test multi-participant grid & audio"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#2a2b2e] hover:bg-[#35373b] text-slate-300 border border-white/10 transition-all"
        >
          <span>Test Peer</span>
        </button>
      </div>

      {/* Center: Core Call Actions */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          title={isMuted ? 'Turn on microphone (Ctrl + d)' : 'Turn off microphone (Ctrl + d)'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            isMuted
              ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          title={isVideoOff ? 'Turn on camera (Ctrl + e)' : 'Turn off camera (Ctrl + e)'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            isVideoOff
              ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Virtual Background Drawer Button */}
        <button
          onClick={() => onTogglePanel('bg')}
          title="Apply visual effects & virtual backgrounds"
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            activePanel === 'bg'
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop presenting' : 'Present now'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            isScreenSharing
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          {isScreenSharing ? <MonitorX className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </button>

        {/* Raise Hand Toggle */}
        <button
          onClick={onToggleHandRaise}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            isHandRaised
              ? 'bg-[#1a73e8] text-white ring-2 ring-blue-400'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Reactions Picker */}
        <div className="relative">
          <button
            onClick={() => setShowReactionsMenu((prev) => !prev)}
            title="Send a reaction"
            className="p-3 sm:p-3.5 rounded-full bg-[#3c4043] text-white hover:bg-[#43474b] transition-all flex items-center justify-center"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Reactions Popover */}
          {showReactionsMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 bg-[#282a2d] border border-white/10 rounded-full shadow-2xl z-50">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactionsMenu(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => onTogglePanel('settings')}
          title="Meeting settings"
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center ${
            activePanel === 'settings'
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* End Call / Leave Meeting Button */}
        <button
          onClick={onLeaveMeeting}
          title="Leave call"
          className="px-5 sm:px-6 py-3 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white transition-all flex items-center gap-2 font-medium text-sm shadow-md"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Right: Drawer Toggles */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Info */}
        <button
          onClick={() => onTogglePanel('info')}
          title="Meeting details & security"
          className={`p-2.5 rounded-full transition-all ${
            activePanel === 'info'
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'text-slate-300 hover:bg-[#3c4043] hover:text-white'
          }`}
        >
          <Info className="w-5 h-5" />
        </button>

        {/* People List */}
        <button
          onClick={() => onTogglePanel('people')}
          title="People in meeting"
          className={`relative p-2.5 rounded-full transition-all ${
            activePanel === 'people'
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'text-slate-300 hover:bg-[#3c4043] hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[10px] font-bold bg-[#1a73e8] text-white rounded-full text-center">
              {participantCount}
            </span>
          )}
        </button>

        {/* Encrypted Chat */}
        <button
          onClick={() => onTogglePanel('chat')}
          title="Encrypted in-call messages"
          className={`relative p-2.5 rounded-full transition-all ${
            activePanel === 'chat'
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'text-slate-300 hover:bg-[#3c4043] hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#8ab4f8] rounded-full ring-2 ring-[#1e1e1e]" />
          )}
        </button>
      </div>
    </div>
  );
};
