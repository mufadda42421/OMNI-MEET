import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMediaDevices } from './hooks/useMediaDevices';
import { useWebRTC } from './hooks/useWebRTC';
import { LandingPage } from './components/LandingPage';
import { MeetingLobby } from './components/MeetingLobby';
import { VideoGrid } from './components/VideoGrid';
import { ControlBar } from './components/ControlBar';
import { ChatPanel } from './components/ChatPanel';
import { PeoplePanel } from './components/PeoplePanel';
import { VirtualBackgroundModal } from './components/VirtualBackgroundModal';
import { SettingsModal } from './components/SettingsModal';
import { MeetingDetailsModal } from './components/MeetingDetailsModal';
import { ReactionsOverlay } from './components/ReactionsOverlay';
import { AddPeopleModal } from './components/AddPeopleModal';
import { MeetingReadyToast } from './components/MeetingReadyToast';
import { Participant } from './types';
import { Video, ShieldCheck, Lock, Copy, Check, UserPlus } from 'lucide-react';

const AVATAR_COLORS = ['#1a73e8', '#1e8e3e', '#d93025', '#f9ab00', '#9334e6', '#007b83'];

export default function App() {
  const [meetingState, setMeetingState] = useState<'landing' | 'lobby' | 'in-meeting'>('landing');
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('omni_meet_username') || localStorage.getItem('google_meet_username') || 'You';
  });
  const [userColor] = useState<string>(() => {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  });

  const [activePanel, setActivePanel] = useState<'chat' | 'people' | 'info' | 'bg' | 'settings' | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [showReadyToast, setShowReadyToast] = useState(true);

  // Media Devices hook
  const {
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
    initMedia,
    toggleMic,
    toggleCamera,
    changeVirtualBackground,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMic,
  } = useMediaDevices();

  // WebRTC hook
  const {
    participants,
    chatMessages,
    reactions,
    isHandRaised,
    isConnected,
    encryptionKeyFingerprint,
    pinnedParticipantId,
    setPinnedParticipantId,
    sendChatMessage,
    sendReaction,
    toggleHandRaise,
    addSimulatedParticipant,
    localPeerId,
  } = useWebRTC({
    roomId,
    userName,
    localStream,
    screenStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    avatarColor: userColor,
  });

  // URL query parameter check on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setMeetingState('lobby');
      initMedia();
    }
  }, [initMedia]);

  // Persist user name
  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem('omni_meet_username', userName.trim());
    }
  }, [userName]);

  // Handle unread chat notification
  useEffect(() => {
    if (activePanel !== 'chat' && chatMessages.length > 0) {
      const last = chatMessages[chatMessages.length - 1];
      if (last.senderId !== localPeerId) {
        setUnreadChatCount((prev) => prev + 1);
      }
    } else if (activePanel === 'chat') {
      setUnreadChatCount(0);
    }
  }, [activePanel, chatMessages, localPeerId]);

  // Keyboard shortcuts (Ctrl+D for mic, Ctrl+E for camera)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleMic();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleCamera();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMic, toggleCamera]);

  // Start Meeting Flow
  const handleStartMeetingFromLanding = useCallback(
    async (newRoomId?: string) => {
      const id = newRoomId || `meet-${Math.random().toString(36).substring(2, 6)}`;
      setRoomId(id);
      window.history.pushState({}, '', `?room=${id}`);
      setMeetingState('lobby');
      await initMedia();
    },
    [initMedia]
  );

  // Join Meeting Flow from Lobby
  const handleJoinFromLobby = useCallback(
    async (startWithScreenShare?: boolean) => {
      if (!localStream) {
        await initMedia();
      }
      setMeetingState('in-meeting');
      if (startWithScreenShare) {
        startScreenShare();
      }
    },
    [initMedia, localStream, startScreenShare]
  );

  // Leave Meeting
  const handleLeaveMeeting = useCallback(() => {
    stopScreenShare();
    setMeetingState('landing');
    window.history.pushState({}, '', window.location.pathname);
  }, [stopScreenShare]);

  // Toggle Screen Share
  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  // Local participant object
  const localParticipant: Participant = useMemo(() => {
    return {
      id: localPeerId,
      name: userName || 'You',
      avatarColor: userColor,
      isMuted,
      isVideoOff,
      isScreenSharing,
      isHandRaised,
      joinedAt: Date.now(),
      stream: isScreenSharing && screenStream ? screenStream : localStream || undefined,
      isLocal: true,
      audioLevel,
    };
  }, [audioLevel, isHandRaised, isMuted, isScreenSharing, isVideoOff, localPeerId, localStream, screenStream, userColor, userName]);

  // Array of remote participants
  const remoteParticipantsList = useMemo(() => {
    return Array.from(participants.values());
  }, [participants]);

  // Copy meeting link
  const copyMeetingCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Render current meeting view
  if (meetingState === 'landing') {
    return <LandingPage onStartMeeting={handleStartMeetingFromLanding} />;
  }

  if (meetingState === 'lobby') {
    return (
      <MeetingLobby
        roomId={roomId}
        userName={userName}
        setUserName={setUserName}
        localStream={localStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        audioLevel={audioLevel}
        virtualBg={virtualBg}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onSelectVirtualBg={changeVirtualBackground}
        onJoinMeeting={handleJoinFromLobby}
        availableCameras={availableCameras}
        availableMics={availableMics}
        selectedCameraId={selectedCameraId}
        selectedMicId={selectedMicId}
        onSelectCamera={switchCamera}
        onSelectMic={switchMic}
        onOpenAddPeople={() => setShowAddPeopleModal(true)}
      />
    );
  }

  // Active in-meeting stage
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-white flex flex-col overflow-hidden select-none">
      {/* Reactions Floating Overlay */}
      <ReactionsOverlay reactions={reactions} />

      {/* Top Meeting Header */}
      <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-[#1e1e1e] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a73e8] flex items-center justify-center font-bold text-white shadow-sm">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline font-['Google_Sans',sans-serif] text-sm font-medium text-white tracking-tight mr-1">
              Omni <span className="font-semibold text-[#8ab4f8]">Meet</span>
            </span>
          </div>
          <button
            onClick={copyMeetingCode}
            title="Click to copy meeting link"
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#282a2d] hover:bg-[#323438] text-xs font-medium text-slate-200 border border-white/5 transition-all"
          >
            <span className="font-mono text-white">{roomId}</span>
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Security / Encryption Badge & Add People Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddPeopleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add real people</span>
          </button>

          <button
            onClick={() => setActivePanel('info')}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full text-xs font-medium text-[#8ab4f8] transition-colors"
          >
            <Lock className="w-3 h-3 text-[#8ab4f8]" />
            <span className="hidden sm:inline">AES-256 E2E Encrypted</span>
            <span className="sm:hidden">E2EE</span>
          </button>
        </div>
      </header>

      {/* Center Body: Video Grid + Side Panel Drawer */}
      <div className="flex-1 w-full h-[calc(100vh-136px)] flex overflow-hidden relative">
        <VideoGrid
          localParticipant={localParticipant}
          remoteParticipants={remoteParticipantsList}
          pinnedId={pinnedParticipantId}
          onTogglePin={(id) => setPinnedParticipantId((prev) => (prev === id ? null : id))}
          localAudioLevel={audioLevel}
        />

        {/* Meeting Ready Toast (Google Meet style first join prompt) */}
        {showReadyToast && remoteParticipantsList.length === 0 && (
          <MeetingReadyToast
            roomId={roomId}
            onOpenAddPeople={() => setShowAddPeopleModal(true)}
            onDismiss={() => setShowReadyToast(false)}
          />
        )}

        {/* Side Panels */}
        {activePanel === 'chat' && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            onClose={() => setActivePanel(null)}
            encryptionFingerprint={encryptionKeyFingerprint}
          />
        )}

        {activePanel === 'people' && (
          <PeoplePanel
            localParticipant={localParticipant}
            remoteParticipants={remoteParticipantsList}
            onClose={() => setActivePanel(null)}
            roomId={roomId}
            onOpenAddPeople={() => setShowAddPeopleModal(true)}
          />
        )}

        {activePanel === 'info' && (
          <MeetingDetailsModal
            roomId={roomId}
            encryptionFingerprint={encryptionKeyFingerprint}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'bg' && (
          <VirtualBackgroundModal
            currentBg={virtualBg}
            onSelectBg={changeVirtualBackground}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        activePanel={activePanel}
        unreadChatCount={unreadChatCount}
        participantCount={remoteParticipantsList.length + 1}
        meetingTimeStr={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={toggleHandRaise}
        onTogglePanel={(panel) => setActivePanel((prev) => (prev === panel ? null : panel))}
        onSendReaction={sendReaction}
        onLeaveMeeting={handleLeaveMeeting}
        onAddTestColleague={addSimulatedParticipant}
        onOpenAddPeople={() => setShowAddPeopleModal(true)}
      />

      {/* Add Real People Modal Dialog */}
      {showAddPeopleModal && (
        <AddPeopleModal
          roomId={roomId}
          onClose={() => setShowAddPeopleModal(false)}
        />
      )}

      {/* Settings Modal Dialog */}
      {activePanel === 'settings' && (
        <SettingsModal
          availableCameras={availableCameras}
          availableMics={availableMics}
          selectedCameraId={selectedCameraId}
          selectedMicId={selectedMicId}
          onSelectCamera={switchCamera}
          onSelectMic={switchMic}
          audioLevel={audioLevel}
          onClose={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}
