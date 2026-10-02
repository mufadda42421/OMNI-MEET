import mqtt, { MqttClient } from 'mqtt';
import { Participant } from '../types';

export interface SignalingMessage {
  type: 'announce' | 'presence' | 'signal' | 'user-update' | 'chat' | 'reaction' | 'leave';
  from: string;
  to?: string;
  roomId: string;
  peer?: Partial<Participant>;
  signal?: { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
  updates?: Partial<Participant>;
  chatMessage?: any;
  reaction?: any;
  timestamp?: number;
}

export type SignalingCallback = (msg: SignalingMessage) => void;

// Public high-reliability MQTT WebSocket brokers for global cross-device WebRTC signaling
const MQTT_BROKER_URLS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://test.mosquitto.org:8081',
];

export class SignalingService {
  private mqttClient: MqttClient | null = null;
  private localWs: WebSocket | null = null;
  private roomId: string = '';
  private localPeerId: string = '';
  private callback: SignalingCallback | null = null;
  private isDestroyed: boolean = false;

  connect({
    roomId,
    localPeerId,
    initialParticipant,
    onMessage,
  }: {
    roomId: string;
    localPeerId: string;
    initialParticipant: Partial<Participant>;
    onMessage: SignalingCallback;
  }) {
    this.isDestroyed = false;
    this.roomId = roomId;
    this.localPeerId = localPeerId;
    this.callback = onMessage;

    // 1. Connect to Public Global Relay Broker (EMQX)
    this.initMqtt(initialParticipant);

    // 2. Connect to Local Server WebSocket as concurrent channel
    this.initLocalWs(initialParticipant);
  }

  private initMqtt(initialParticipant: Partial<Participant>) {
    try {
      const brokerUrl = MQTT_BROKER_URLS[0];
      const client = mqtt.connect(brokerUrl, {
        clientId: `omni_${this.localPeerId}_${Math.random().toString(36).substring(2, 6)}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
        keepalive: 30,
        will: {
          topic: `omni/v2/${this.roomId}/leave`,
          payload: Buffer.from(
            JSON.stringify({
              type: 'leave',
              from: this.localPeerId,
              roomId: this.roomId,
            })
          ),
          qos: 1,
          retain: false,
        },
      });

      this.mqttClient = client;

      client.on('connect', () => {
        if (this.isDestroyed) {
          client.end(true);
          return;
        }

        const roomTopic = `omni/v2/${this.roomId}/#`;
        client.subscribe(roomTopic, { qos: 1 }, (err) => {
          if (!err) {
            // Broadcast presence announcement to all peers in room
            this.publish({
              type: 'announce',
              from: this.localPeerId,
              roomId: this.roomId,
              peer: {
                id: this.localPeerId,
                name: initialParticipant.name,
                avatarColor: initialParticipant.avatarColor,
                isMuted: initialParticipant.isMuted,
                isVideoOff: initialParticipant.isVideoOff,
                isScreenSharing: initialParticipant.isScreenSharing,
                isHandRaised: initialParticipant.isHandRaised,
              },
            });
          }
        });
      });

      client.on('message', (_topic, messageBuffer) => {
        try {
          const raw = JSON.parse(messageBuffer.toString()) as SignalingMessage;
          // Ignore own messages
          if (raw.from === this.localPeerId) return;
          // If targeted, ensure it's for this peer
          if (raw.to && raw.to !== this.localPeerId) return;

          if (this.callback) {
            this.callback(raw);
          }
        } catch (err) {
          // ignore malformed
        }
      });

      client.on('error', (err) => {
        console.warn('[Omni Meet] MQTT broker error, relying on local WebSocket:', err);
      });
    } catch (err) {
      console.warn('[Omni Meet] Failed to initialize MQTT signaling:', err);
    }
  }

  private initLocalWs(initialParticipant: Partial<Participant>) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      this.localWs = ws;

      ws.onopen = () => {
        if (this.isDestroyed) {
          ws.close();
          return;
        }
        ws.send(
          JSON.stringify({
            type: 'join-room',
            roomId: this.roomId,
            peerId: this.localPeerId,
            name: initialParticipant.name,
            avatarColor: initialParticipant.avatarColor,
            isMuted: initialParticipant.isMuted,
            isVideoOff: initialParticipant.isVideoOff,
            isScreenSharing: initialParticipant.isScreenSharing,
            isHandRaised: initialParticipant.isHandRaised,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'peer-joined' && msg.peer) {
            if (msg.peer.id !== this.localPeerId && this.callback) {
              this.callback({
                type: 'announce',
                from: msg.peer.id,
                roomId: this.roomId,
                peer: msg.peer,
              });
            }
          } else if (msg.type === 'peer-left' && msg.peerId) {
            if (this.callback) {
              this.callback({
                type: 'leave',
                from: msg.peerId,
                roomId: this.roomId,
              });
            }
          } else if (msg.type === 'signal') {
            if (this.callback) {
              this.callback({
                type: 'signal',
                from: msg.from,
                to: msg.to,
                roomId: this.roomId,
                signal: msg.signal,
              });
            }
          } else if (msg.type === 'user-updated') {
            if (this.callback) {
              this.callback({
                type: 'user-update',
                from: msg.peerId,
                roomId: this.roomId,
                updates: msg.updates,
              });
            }
          } else if (msg.type === 'chat-message') {
            if (this.callback) {
              this.callback({
                type: 'chat',
                from: msg.message.senderId,
                roomId: this.roomId,
                chatMessage: msg.message,
              });
            }
          } else if (msg.type === 'reaction') {
            if (this.callback) {
              this.callback({
                type: 'reaction',
                from: msg.peerId,
                roomId: this.roomId,
                reaction: msg,
              });
            }
          }
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn('[Omni Meet] Local WS init failed:', err);
    }
  }

  publish(msg: SignalingMessage) {
    if (this.isDestroyed) return;
    const payload = JSON.stringify({ ...msg, timestamp: Date.now() });

    // 1. Send via Global MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = msg.to
        ? `omni/v2/${this.roomId}/targeted/${msg.to}`
        : `omni/v2/${this.roomId}/${msg.type}`;
      this.mqttClient.publish(topic, payload, { qos: 1 });
    }

    // 2. Also send via Local WebSocket for redundancy
    if (this.localWs && this.localWs.readyState === WebSocket.OPEN) {
      if (msg.type === 'signal') {
        this.localWs.send(
          JSON.stringify({
            type: 'signal',
            from: msg.from,
            to: msg.to,
            signal: msg.signal,
          })
        );
      } else if (msg.type === 'user-update') {
        this.localWs.send(
          JSON.stringify({
            type: 'user-update',
            ...msg.updates,
          })
        );
      } else if (msg.type === 'chat') {
        this.localWs.send(
          JSON.stringify({
            type: 'chat-message',
            message: msg.chatMessage,
          })
        );
      } else if (msg.type === 'reaction') {
        this.localWs.send(
          JSON.stringify({
            type: 'reaction',
            ...msg.reaction,
          })
        );
      }
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.mqttClient) {
      try {
        this.publish({
          type: 'leave',
          from: this.localPeerId,
          roomId: this.roomId,
        });
        this.mqttClient.end(true);
      } catch {}
      this.mqttClient = null;
    }

    if (this.localWs) {
      try {
        this.localWs.close();
      } catch {}
      this.localWs = null;
    }
    this.callback = null;
  }
}
