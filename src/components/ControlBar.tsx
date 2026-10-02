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
  MoreVertical,
  X,
  ShieldCheck,
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
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);

  return (
    <>
      <div className="relative w-full h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between bg-[#1e1e1e] select-none border-t border-white/5 z-30">
        {/* Desktop Left: Time & Add Real People */}
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

        {/* Center: Core Call Actions (Adaptive for Desktop and Mobile) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto">
          {/* Microphone Toggle */}
          <button
            onClick={onToggleMic}
            title={isMuted ? 'Turn on microphone (Ctrl + d)' : 'Turn off microphone (Ctrl + d)'}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center shrink-0 ${
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
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center shrink-0 ${
              isVideoOff
                ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Desktop-only: Visual Effects Button */}
          <button
            onClick={() => onTogglePanel('bg')}
            title="Apply visual effects & virtual backgrounds"
            className={`hidden sm:flex p-3 sm:p-3.5 rounded-full transition-all duration-150 items-center justify-center shrink-0 ${
              activePanel === 'bg'
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Desktop-only: Screen Share Toggle */}
          <button
            onClick={onToggleScreenShare}
            title={isScreenSharing ? 'Stop presenting' : 'Present now'}
            className={`hidden sm:flex p-3 sm:p-3.5 rounded-full transition-all duration-150 items-center justify-center shrink-0 ${
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
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-150 flex items-center justify-center shrink-0 ${
              isHandRaised
                ? 'bg-[#1a73e8] text-white ring-2 ring-blue-400'
                : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Desktop-only: Reactions Picker */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowReactionsMenu((prev) => !prev)}
              title="Send a reaction"
              className="p-3.5 rounded-full bg-[#3c4043] text-white hover:bg-[#43474b] transition-all flex items-center justify-center"
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

          {/* Desktop-only: Settings Button */}
          <button
            onClick={() => onTogglePanel('settings')}
            title="Meeting settings"
            className={`hidden sm:flex p-3 sm:p-3.5 rounded-full transition-all duration-150 items-center justify-center shrink-0 ${
              activePanel === 'settings'
                ? 'bg-[#8ab4f8] text-[#202124]'
                : 'bg-[#3c4043] text-white hover:bg-[#43474b]'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Mobile "More" Menu Button (3 dots) */}
          <button
            onClick={() => setShowMobileMoreSheet(true)}
            className="sm:hidden p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#43474b] transition-all flex items-center justify-center shrink-0"
            title="More call options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* End Call / Leave Meeting Button */}
          <button
            onClick={onLeaveMeeting}
            title="Leave call"
            className="px-4 sm:px-6 py-3 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white transition-all flex items-center gap-2 font-medium text-sm shadow-md shrink-0"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Right: Drawer Toggles */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
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

      {/* Mobile "More Options" Bottom Drawer Sheet */}
      {showMobileMoreSheet && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#202124] border-t border-white/10 rounded-t-3xl p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Drawer Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
              <button
                onClick={() => setShowMobileMoreSheet(false)}
                className="p-1 text-slate-400 hover:text-white absolute right-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Reactions Bar on Mobile */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Send Reaction
              </span>
              <div className="flex items-center justify-around bg-[#282a2d] p-2 rounded-2xl">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowMobileMoreSheet(false);
                    }}
                    className="text-2xl p-1 active:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Action Cards on Mobile */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Add Real People */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onOpenAddPeople();
                }}
                className="flex items-center gap-3 p-3 bg-[#1a73e8] text-white rounded-2xl text-left font-medium text-xs shadow-md"
              >
                <UserPlus className="w-5 h-5 shrink-0" />
                <span>Add real people</span>
              </button>

              {/* In-Call Chat */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onTogglePanel('chat');
                }}
                className="flex items-center justify-between p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-[#8ab4f8]" />
                  <span>In-call Chat</span>
                </div>
                {unreadChatCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#8ab4f8]" />
                )}
              </button>

              {/* People in Call */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onTogglePanel('people');
                }}
                className="flex items-center justify-between p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-[#8ab4f8]" />
                  <span>People</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-[#3c4043] text-[10px]">
                  {participantCount}
                </span>
              </button>

              {/* Visual Effects */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onTogglePanel('bg');
                }}
                className="flex items-center gap-2.5 p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <Sparkles className="w-5 h-5 text-[#8ab4f8]" />
                <span>Visual effects</span>
              </button>

              {/* Screen Share */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onToggleScreenShare();
                }}
                className="flex items-center gap-2.5 p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                {isScreenSharing ? (
                  <MonitorX className="w-5 h-5 text-red-400" />
                ) : (
                  <MonitorUp className="w-5 h-5 text-[#8ab4f8]" />
                )}
                <span>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</span>
              </button>

              {/* Meeting Details & Security */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onTogglePanel('info');
                }}
                className="flex items-center gap-2.5 p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span>Call security</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onTogglePanel('settings');
                }}
                className="flex items-center gap-2.5 p-3 bg-[#282a2d] text-white rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <Settings className="w-5 h-5 text-slate-300" />
                <span>Audio & Video</span>
              </button>

              {/* Test Peer */}
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  onAddTestColleague();
                }}
                className="flex items-center gap-2.5 p-3 bg-[#282a2d] text-slate-300 rounded-2xl text-left font-medium text-xs border border-white/5"
              >
                <UserPlus className="w-5 h-5 text-slate-400" />
                <span>Add Test Peer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
