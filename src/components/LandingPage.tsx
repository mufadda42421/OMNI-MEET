import React, { useState } from 'react';
import {
  Video,
  Keyboard,
  Sparkles,
  ShieldCheck,
  MonitorUp,
  MessageSquare,
  Lock,
  ArrowRight,
  Plus,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { normalizeRoomId, generateRoomId } from '../utils/roomUtils';

interface LandingPageProps {
  onStartMeeting: (roomId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartMeeting }) => {
  const [meetingInput, setMeetingInput] = useState('');
  const [showNewMeetingMenu, setShowNewMeetingMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleStartInstant = () => {
    const code = generateRoomId();
    onStartMeeting(code);
  };

  const handleCreateForLater = () => {
    const code = generateRoomId();
    const link = `${window.location.origin}?room=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => {
      setCopiedLink(null);
      setShowNewMeetingMenu(false);
    }, 4000);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeRoomId(meetingInput);
    if (normalized) {
      onStartMeeting(normalized);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col justify-between selection:bg-[#8ab4f8] selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a73e8] flex items-center justify-center font-bold text-white shadow-md">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white font-['Google_Sans',sans-serif]">
            Omni <span className="font-semibold text-[#8ab4f8]">Meet</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 font-medium">
          <span className="hidden sm:inline text-slate-400">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
            {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[#8ab4f8]">
            <Lock className="w-3.5 h-3.5" />
            <span>WebRTC AES-256 E2EE</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-10 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Actions */}
        <div className="w-full lg:max-w-xl space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white font-['Google_Sans',sans-serif] leading-tight">
              Premium video meetings. Now free for everyone.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
              We engineered Omni Meet with WebRTC peer-to-peer technology, encrypted in-call chat, 
              screen sharing, and AI virtual backgrounds for modern remote collaboration.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            {/* New Meeting Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowNewMeetingMenu((prev) => !prev)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-sm rounded-full shadow-lg transition-all active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>New meeting</span>
              </button>

              {/* Menu */}
              {showNewMeetingMenu && (
                <div className="absolute top-14 left-0 sm:left-auto w-72 bg-[#282a2d] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleStartInstant}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-left transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#8ab4f8]" />
                    <div>
                      <div className="text-white font-medium">Start an instant meeting</div>
                      <div className="text-[11px] text-slate-400">Join room immediately</div>
                    </div>
                  </button>

                  <button
                    onClick={handleCreateForLater}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-left transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-[#8ab4f8]" />
                    <div>
                      <div className="text-white font-medium">Create a meeting for later</div>
                      <div className="text-[11px] text-slate-400">Copy invitation link</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Enter Code or Link */}
            <form onSubmit={handleJoinWithCode} className="w-full sm:w-auto flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={meetingInput}
                  onChange={(e) => setMeetingInput(e.target.value)}
                  placeholder="Enter code or link"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#282a2d] hover:bg-[#303236] focus:bg-[#303236] border border-white/10 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8ab4f8] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!meetingInput.trim()}
                className="px-5 py-3.5 text-sm font-semibold text-[#8ab4f8] hover:text-white disabled:text-slate-500 disabled:hover:text-slate-500 transition-colors"
              >
                Join
              </button>
            </form>
          </div>

          {/* Copy Notification Toast */}
          {copiedLink && (
            <div className="p-3 bg-[#137333]/90 text-white rounded-xl border border-green-400/30 flex items-center gap-2 text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-green-300" />
              <span>Meeting link copied to clipboard: {copiedLink}</span>
            </div>
          )}

          {/* Feature Badges */}
          <div className="pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Virtual BG</span>
              </div>
              <p className="text-[11px] text-slate-400">Blur & professional studios</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>E2E Encrypted</span>
              </div>
              <p className="text-[11px] text-slate-400">AES-256 chat & DTLS</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-semibold text-white">
                <MonitorUp className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Screen Share</span>
              </div>
              <p className="text-[11px] text-slate-400">Crystal clear 1080p stream</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-semibold text-white">
                <MessageSquare className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Real-Time</span>
              </div>
              <p className="text-[11px] text-slate-400">Reactions & active speaker</p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Feature Showcase */}
        <div className="w-full lg:max-w-lg">
          <div className="relative rounded-3xl overflow-hidden bg-[#202124] border border-white/10 shadow-2xl p-6 space-y-6">
            {/* Mock Call Preview Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">meet.google.com/pro-live</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8ab4f8] bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>AES-256 E2EE</span>
              </div>
            </div>

            {/* Mock Grid Preview */}
            <div className="grid grid-cols-2 gap-3 aspect-video">
              {/* Tile 1 */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5 flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-[#1a73e8] text-white font-semibold flex items-center justify-center text-xl shadow-lg ring-2 ring-[#8ab4f8]/40 animate-pulse">
                  AL
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white flex items-center gap-1">
                  <span>Alex Rivera (Product Lead)</span>
                </div>
              </div>

              {/* Tile 2 with Virtual Background */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-tr from-[#312e81] via-[#1e1b4b] to-[#0f172a] border border-white/5 flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-[#10b981] text-white font-semibold flex items-center justify-center text-xl shadow-lg">
                  SC
                </div>
                <div className="absolute top-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-[#8ab4f8] flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Executive Office</span>
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white">
                  <span>Sarah Chen (Engineering)</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Launch */}
            <div className="pt-2">
              <button
                onClick={handleStartInstant}
                className="w-full py-3 bg-[#2d2e30] hover:bg-[#36383b] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-colors group"
              >
                <span>Launch Interactive Video Room</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 sm:px-12 flex items-center justify-between text-xs text-slate-500 border-t border-white/5">
        <span>Omni Meet • Engineered with WebRTC & Web Crypto API</span>
        <div className="flex items-center gap-4">
          <span className="text-[#8ab4f8]">Zero-Lag P2P Mesh</span>
        </div>
      </footer>
    </div>
  );
};
