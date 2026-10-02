import { useState, useEffect, useRef, useCallback } from 'react';
import { Participant, ChatMessage, ReactionEvent } from '../types';
import { deriveRoomKey, encryptPayload, decryptPayload, generateKeyFingerprint } from '../services/crypto';
import { soundEffects } from '../services/soundEffects';
import { normalizeRoomId } from '../utils/roomUtils';

interface UseWebRTCProps {
  roomId: string;
  userName: string;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  avatarColor: string;
  enabled: boolean; // only connect when user is actually in-meeting
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
};

export function useWebRTC({
  roomId,
  userName,
  localStream,
  screenStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  avatarColor,
  enabled,
}: UseWebRTCProps) {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [encryptionKeyFingerprint, setEncryptionKeyFingerprint] = useState<string>('');
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);

  // Stable peer ID for this tab session
  const localPeerIdRef = useRef<string>(`user-${Math.random().toString(36).substring(2, 9)}`);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const candidateQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const roomKeyRef = useRef<CryptoKey | null>(null);

  // Keep latest mutable references so callbacks don't recreate and trigger re-renders
  const localStreamRef = useRef<MediaStream | null>(localStream);
  localStreamRef.current = localStream;
  const screenStreamRef = useRef<MediaStream | null>(screenStream);
  screenStreamRef.current = screenStream;
  const isScreenSharingRef = useRef<boolean>(isScreenSharing);
  isScreenSharingRef.current = isScreenSharing;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const isVideoOffRef = useRef<boolean>(isVideoOff);
  isVideoOffRef.current = isVideoOff;
  const userNameRef = useRef<string>(userName);
  userNameRef.current = userName;
  const avatarColorRef = useRef<string>(avatarColor);
  avatarColorRef.current = avatarColor;

  const normalizedRoomId = normalizeRoomId(roomId);

  // Initialize room encryption key
  useEffect(() => {
    if (!normalizedRoomId) return;
    let isCancelled = false;
    const initCrypto = async () => {
      const key = await deriveRoomKey(normalizedRoomId);
      if (isCancelled) return;
      roomKeyRef.current = key;
      const fingerprint = await generateKeyFingerprint(key);
      setEncryptionKeyFingerprint(fingerprint);
    };
    initCrypto();
    return () => {
      isCancelled = true;
    };
  }, [normalizedRoomId]);

  // Create or retrieve an RTCPeerConnection for a remote peer
  const createPeerConnection = useCallback((remotePeerId: string, isInitiator: boolean) => {
    if (peerConnectionsRef.current.has(remotePeerId)) {
      return peerConnectionsRef.current.get(remotePeerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(remotePeerId, pc);

    // Send local tracks
    const activeStream = isScreenSharingRef.current && screenStreamRef.current ? screenStreamRef.current : localStreamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, activeStream);
        } catch {
          // Track already added
        }
      });
    }

    // Handle remote incoming tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        remoteStreamsRef.current.set(remotePeerId, remoteStream);
        setParticipants((prev) => {
          const next = new Map(prev);
          const p = next.get(remotePeerId);
          if (p) {
            next.set(remotePeerId, { ...p, stream: remoteStream });
          }
          return next;
        });
      }
    };

    // Relay ICE candidate to remote peer via WebSocket
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'signal',
            to: remotePeerId,
            from: localPeerIdRef.current,
            signal: { candidate: event.candidate.toJSON() },
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[Omni Meet] WebRTC connection state with ${remotePeerId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        // give peer connection a chance or clean up
      }
    };

    // If initiator, create offer
    if (isInitiator) {
      pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'signal',
                to: remotePeerId,
                from: localPeerIdRef.current,
                signal: { sdp: pc.localDescription },
              })
            );
          }
        })
        .catch((err) => console.error('Error creating WebRTC offer:', err));
    }

    return pc;
  }, []);

  // Handle incoming signals from peers
  const handleSignal = useCallback(async (fromPeerId: string, signal: { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
    let pc = peerConnectionsRef.current.get(fromPeerId);
    if (!pc) {
      pc = createPeerConnection(fromPeerId, false);
    }

    try {
      if (signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Flush any queued ICE candidates
        const queued = candidateQueueRef.current.get(fromPeerId);
        if (queued && queued.length > 0) {
          for (const cand of queued) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
          }
          candidateQueueRef.current.delete(fromPeerId);
        }

        if (signal.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'signal',
                to: fromPeerId,
                from: localPeerIdRef.current,
                signal: { sdp: pc.localDescription },
              })
            );
          }
        }
      } else if (signal.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          // Queue candidate until remote description is set
          const q = candidateQueueRef.current.get(fromPeerId) || [];
          q.push(signal.candidate);
          candidateQueueRef.current.set(fromPeerId, q);
        }
      }
    } catch (err) {
      console.error('Error handling WebRTC signal:', err);
    }
  }, [createPeerConnection]);

  // Main WebSocket Connection Effect: ONLY connects when enabled is true and room is valid!
  useEffect(() => {
    if (!enabled || !normalizedRoomId) {
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    console.log(`[Omni Meet] Connecting to signaling server for room: "${normalizedRoomId}"`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      soundEffects.playJoinChime();

      // Join room message
      ws.send(
        JSON.stringify({
          type: 'join-room',
          roomId: normalizedRoomId,
          peerId: localPeerIdRef.current,
          name: userNameRef.current || 'Guest User',
          avatarColor: avatarColorRef.current,
          isMuted: isMutedRef.current,
          isVideoOff: isVideoOffRef.current,
          isScreenSharing: isScreenSharingRef.current,
          isHandRaised: false,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'room-roster': {
            // Received existing participants from server
            const roster = msg.participants as Participant[];
            setParticipants((prev) => {
              const next = new Map(prev);
              roster.forEach((p) => {
                if (p.id !== localPeerIdRef.current) {
                  next.set(p.id, { ...p, isLocal: false });
                  // We are the joiner, initiate connection with each existing peer
                  createPeerConnection(p.id, true);
                }
              });
              return next;
            });
            break;
          }

          case 'peer-joined': {
            const peer = msg.peer as Participant;
            if (peer.id === localPeerIdRef.current) break;

            soundEffects.playJoinChime();
            setParticipants((prev) => {
              const next = new Map(prev);
              next.set(peer.id, { ...peer, isLocal: false });
              return next;
            });

            // Add system announcement in chat
            setChatMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Meeting Room',
                avatarColor: '#5f6368',
                timestamp: Date.now(),
                text: `${peer.name} joined the meeting.`,
                isEncrypted: false,
                isSystem: true,
              },
            ]);
            break;
          }

          case 'peer-left': {
            const leftId = msg.peerId;
            soundEffects.playLeaveChime();
            const leftPeer = participants.get(leftId);

            if (peerConnectionsRef.current.has(leftId)) {
              try {
                peerConnectionsRef.current.get(leftId)!.close();
              } catch {}
              peerConnectionsRef.current.delete(leftId);
            }
            remoteStreamsRef.current.delete(leftId);
            candidateQueueRef.current.delete(leftId);

            setParticipants((prev) => {
              const next = new Map(prev);
              next.delete(leftId);
              return next;
            });

            if (leftPeer) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `sys-${Date.now()}`,
                  senderId: 'system',
                  senderName: 'Meeting Room',
                  avatarColor: '#5f6368',
                  timestamp: Date.now(),
                  text: `${leftPeer.name} left the meeting.`,
                  isEncrypted: false,
                  isSystem: true,
                },
              ]);
            }
            break;
          }

          case 'signal': {
            await handleSignal(msg.from, msg.signal);
            break;
          }

          case 'user-updated': {
            const { peerId, updates } = msg;
            setParticipants((prev) => {
              const next = new Map(prev);
              const p = next.get(peerId);
              if (p) {
                if (updates.isHandRaised && !p.isHandRaised) {
                  soundEffects.playHandRaiseChime();
                }
                next.set(peerId, { ...p, ...updates });
              }
              return next;
            });
            break;
          }

          case 'chat-message': {
            const raw = msg.message;
            let decryptedText = raw.text;

            if (raw.isEncrypted && raw.ciphertext && raw.iv && roomKeyRef.current) {
              decryptedText = await decryptPayload(raw.ciphertext, raw.iv, roomKeyRef.current);
            }

            setChatMessages((prev) => [
              ...prev,
              {
                id: raw.id,
                senderId: raw.senderId,
                senderName: raw.senderName,
                avatarColor: raw.avatarColor,
                timestamp: raw.timestamp,
                text: decryptedText,
                isEncrypted: raw.isEncrypted,
                ciphertext: raw.ciphertext,
                iv: raw.iv,
              },
            ]);
            break;
          }

          case 'reaction': {
            soundEffects.playReactionPop();
            const newReaction: ReactionEvent = {
              id: msg.id,
              peerId: msg.peerId,
              name: msg.name,
              emoji: msg.emoji,
              x: 15 + Math.random() * 70,
            };
            setReactions((prev) => [...prev, newReaction]);

            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 3000);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WS event:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
      peerConnectionsRef.current.forEach((pc) => {
        try {
          pc.close();
        } catch {}
      });
      peerConnectionsRef.current.clear();
      remoteStreamsRef.current.clear();
      candidateQueueRef.current.clear();
    };
  }, [enabled, normalizedRoomId, createPeerConnection, handleSignal]);

  // Synchronize status updates with server without tearing down the WebSocket
  useEffect(() => {
    if (!enabled || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'user-update',
        isMuted,
        isVideoOff,
        isScreenSharing,
        isHandRaised,
        name: userName,
      })
    );
  }, [enabled, isMuted, isVideoOff, isScreenSharing, isHandRaised, userName]);

  // Track replacement when local video stream or screen share changes
  useEffect(() => {
    const activeStream = isScreenSharing && screenStream ? screenStream : localStream;
    if (!activeStream) return;

    const videoTrack = activeStream.getVideoTracks()[0];
    const audioTrack = activeStream.getAudioTracks()[0];

    peerConnectionsRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      if (videoTrack) {
        const videoSender = senders.find((s) => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(videoTrack).catch(console.warn);
        } else {
          try {
            pc.addTrack(videoTrack, activeStream);
          } catch {}
        }
      }
      if (audioTrack) {
        const audioSender = senders.find((s) => s.track?.kind === 'audio');
        if (audioSender) {
          audioSender.replaceTrack(audioTrack).catch(console.warn);
        } else {
          try {
            pc.addTrack(audioTrack, activeStream);
          } catch {}
        }
      }
    });
  }, [localStream, screenStream, isScreenSharing]);

  // Send Encrypted Chat Message
  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      let ciphertext = '';
      let iv = '';
      const isEncrypted = !!roomKeyRef.current;

      if (roomKeyRef.current) {
        const enc = await encryptPayload(text, roomKeyRef.current);
        ciphertext = enc.ciphertext;
        iv = enc.iv;
      }

      const messagePayload = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: localPeerIdRef.current,
        senderName: userNameRef.current || 'You',
        avatarColor: avatarColorRef.current,
        timestamp: Date.now(),
        text: isEncrypted ? '' : text,
        isEncrypted,
        ciphertext,
        iv,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat-message',
            message: messagePayload,
          })
        );
      }
    },
    []
  );

  // Send Reaction
  const sendReaction = useCallback((emoji: string) => {
    soundEffects.playReactionPop();
    const id = `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'reaction',
          id,
          emoji,
          name: userNameRef.current || 'Participant',
        })
      );
    }
  }, []);

  // Toggle Hand Raise
  const toggleHandRaise = useCallback(() => {
    setIsHandRaised((prev) => {
      const next = !prev;
      if (next) soundEffects.playHandRaiseChime();
      return next;
    });
  }, []);

  // Simulate a realistic remote colleague for immediate testing
  const addSimulatedParticipant = useCallback((simulatedName: string = 'Sarah Chen (Lead Engineer)') => {
    const simId = `sim-${Date.now()}`;
    const simColors = ['#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
    const chosenColor = simColors[Math.floor(Math.random() * simColors.length)];

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 360);

      ctx.fillStyle = '#334155';
      ctx.fillRect(60, 40, 180, 260);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(80, 80, 25, 60);
      ctx.fillRect(115, 70, 30, 70);

      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(400, 40, 180, 200);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 280, 640, 80);

      const bob = Math.sin(frame * 0.04) * 3;
      ctx.beginPath();
      ctx.arc(320, 160 + bob, 55, 0, Math.PI * 2);
      ctx.fillStyle = chosenColor;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Google Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(simulatedName.slice(0, 2).toUpperCase(), 320, 160 + bob);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(40, 40, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('1080p 60fps WebRTC', 55, 43);
    }, 1000 / 30);

    const stream = canvas.captureStream(30);

    const simParticipant: Participant = {
      id: simId,
      name: simulatedName,
      avatarColor: chosenColor,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isHandRaised: false,
      joinedAt: Date.now(),
      stream,
      isSimulated: true,
      audioLevel: 15,
    };

    soundEffects.playJoinChime();

    setParticipants((prev) => {
      const next = new Map(prev);
      next.set(simId, simParticipant);
      return next;
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Meeting Room',
        avatarColor: '#5f6368',
        timestamp: Date.now(),
        text: `${simulatedName} joined the meeting via WebRTC.`,
        isEncrypted: false,
        isSystem: true,
      },
    ]);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
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
    localPeerId: localPeerIdRef.current,
  };
}
