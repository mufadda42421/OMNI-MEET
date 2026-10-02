import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  ws: WebSocket;
  joinedAt: number;
}

// Map room code -> Map of peerId -> Participant
const rooms = new Map<string, Map<string, Participant>>();

// Helper to broadcast to everyone in a room except optionally the sender
function broadcastToRoom(
  roomId: string,
  message: object,
  excludePeerId?: string
) {
  const room = rooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify(message);
  for (const [peerId, participant] of room.entries()) {
    if (excludePeerId && peerId === excludePeerId) continue;
    if (participant.ws.readyState === WebSocket.OPEN) {
      participant.ws.send(payload);
    }
  }
}

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPeerId: string | null = null;

  ws.on('message', (raw: string) => {
    try {
      const data = JSON.parse(raw.toString());

      switch (data.type) {
        case 'join-room': {
          let { roomId, peerId, name, avatarColor, isMuted, isVideoOff, isScreenSharing, isHandRaised } = data;
          if (!roomId || typeof roomId !== 'string') return;
          
          // Normalize room ID: lowercase, trim, strip invalid chars
          roomId = roomId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
          if (!roomId) return;

          currentRoomId = roomId;
          currentPeerId = peerId;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }
          const room = rooms.get(roomId)!;

          // If peer already exists (e.g. page refreshed), clean up old socket
          const existingPeer = room.get(peerId);
          if (existingPeer && existingPeer.ws !== ws) {
            try {
              existingPeer.ws.close();
            } catch {}
          }

          const newParticipant: Participant = {
            id: peerId,
            name: name || 'Guest User',
            avatarColor: avatarColor || '#4285F4',
            isMuted: !!isMuted,
            isVideoOff: !!isVideoOff,
            isScreenSharing: !!isScreenSharing,
            isHandRaised: !!isHandRaised,
            ws,
            joinedAt: Date.now(),
          };

          // Existing participants list to return to the new peer (excluding self)
          const existingParticipants = Array.from(room.values())
            .filter(p => p.id !== peerId)
            .map(p => ({
              id: p.id,
              name: p.name,
              avatarColor: p.avatarColor,
              isMuted: p.isMuted,
              isVideoOff: p.isVideoOff,
              isScreenSharing: p.isScreenSharing,
              isHandRaised: p.isHandRaised,
              joinedAt: p.joinedAt,
            }));

          room.set(peerId, newParticipant);
          console.log(`[Omni Meet] Peer "${newParticipant.name}" (${peerId}) joined room: "${roomId}". Total participants: ${room.size}`);

          // Reply with current room roster
          ws.send(
            JSON.stringify({
              type: 'room-roster',
              participants: existingParticipants,
            })
          );

          // Inform others in the room
          broadcastToRoom(
            roomId,
            {
              type: 'peer-joined',
              peer: {
                id: newParticipant.id,
                name: newParticipant.name,
                avatarColor: newParticipant.avatarColor,
                isMuted: newParticipant.isMuted,
                isVideoOff: newParticipant.isVideoOff,
                isScreenSharing: newParticipant.isScreenSharing,
                isHandRaised: newParticipant.isHandRaised,
                joinedAt: newParticipant.joinedAt,
              },
            },
            peerId
          );
          break;
        }

        case 'signal': {
          // Relay WebRTC offer / answer / ice-candidate
          const { to, from, signal } = data;
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const recipient = room.get(to);
          if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
            recipient.ws.send(
              JSON.stringify({
                type: 'signal',
                from,
                signal,
              })
            );
          }
          break;
        }

        case 'user-update': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;
          const participant = room.get(currentPeerId);
          if (participant) {
            if (data.isMuted !== undefined) participant.isMuted = data.isMuted;
            if (data.isVideoOff !== undefined) participant.isVideoOff = data.isVideoOff;
            if (data.isScreenSharing !== undefined) participant.isScreenSharing = data.isScreenSharing;
            if (data.isHandRaised !== undefined) participant.isHandRaised = data.isHandRaised;
            if (data.name !== undefined) participant.name = data.name;

            broadcastToRoom(
              currentRoomId,
              {
                type: 'user-updated',
                peerId: currentPeerId,
                updates: data,
              },
              currentPeerId
            );
          }
          break;
        }

        case 'chat-message': {
          if (!currentRoomId) return;
          // data includes encryptedPayload, senderId, senderName, id, timestamp, iv
          broadcastToRoom(currentRoomId, {
            type: 'chat-message',
            message: data.message,
          });
          break;
        }

        case 'reaction': {
          if (!currentRoomId) return;
          broadcastToRoom(currentRoomId, {
            type: 'reaction',
            peerId: currentPeerId,
            emoji: data.emoji,
            id: data.id,
            name: data.name,
          });
          break;
        }

        case 'leave-room': {
          handleDisconnect();
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  const handleDisconnect = () => {
    if (currentRoomId && currentPeerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.delete(currentPeerId);
        broadcastToRoom(currentRoomId, {
          type: 'peer-left',
          peerId: currentPeerId,
        });
        if (room.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    }
    currentRoomId = null;
    currentPeerId = null;
  };

  ws.on('close', handleDisconnect);
  ws.on('error', handleDisconnect);
});

// Health check / API
app.use(express.json());
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    roomsActive: rooms.size,
    timestamp: Date.now(),
  });
});

// Dev or Production Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = parseInt(process.env.PORT || '3000', 10);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Omni Meet] Server listening on port ${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
