import React, { useState } from 'react';
import { X, Mic, MicOff, Hand, Copy, Check, Search, Shield, UserPlus } from 'lucide-react';
import { Participant } from '../types';

interface PeoplePanelProps {
  localParticipant: Participant;
  remoteParticipants: Participant[];
  onClose: () => void;
  roomId: string;
  onOpenAddPeople?: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({
  localParticipant,
  remoteParticipants,
  onClose,
  roomId,
  onOpenAddPeople,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allParticipants = [localParticipant, ...remoteParticipants];
  const filtered = allParticipants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPeople = () => {
    if (onOpenAddPeople) {
      onOpenAddPeople();
    } else {
      const inviteUrl = `${window.location.origin}?room=${roomId}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto w-full sm:w-96 h-full bg-[#202124] border-l border-white/5 flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-base text-white">People</h2>
          <span className="text-xs bg-[#3c4043] text-slate-200 px-2 py-0.5 rounded-full font-semibold">
            {allParticipants.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invite Button Action */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={handleAddPeople}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add real people</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for people"
            className="w-full bg-[#282a2d] text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
          />
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          In Call ({filtered.length})
        </div>

        {filtered.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
                style={{ backgroundColor: participant.avatarColor || '#1a73e8' }}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & status */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-white truncate">
                    {participant.name}
                  </span>
                  {participant.isLocal && (
                    <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                  )}
                  {participant.id === localParticipant.id && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-blue-500/20 text-[#8ab4f8] rounded font-medium flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Host
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {participant.isScreenSharing
                    ? 'Presenting'
                    : participant.isHandRaised
                    ? 'Raised hand'
                    : 'Participant'}
                </div>
              </div>
            </div>

            {/* Mic and Hand status icons */}
            <div className="flex items-center gap-2 text-slate-400">
              {participant.isHandRaised && (
                <div className="p-1 rounded-full bg-[#1a73e8] text-white">
                  <Hand className="w-3.5 h-3.5" />
                </div>
              )}
              {participant.isMuted ? (
                <div className="p-1.5 rounded-full bg-red-500/10 text-red-400">
                  <MicOff className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 text-slate-300">
                  <Mic className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
