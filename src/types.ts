export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: number;
  stream?: MediaStream;
  isLocal?: boolean;
  isSimulated?: boolean;
  audioLevel?: number; // 0 to 100
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarColor: string;
  timestamp: number;
  text: string;
  isEncrypted: boolean;
  ciphertext?: string;
  iv?: string;
  keyFingerprint?: string;
  isSystem?: boolean;
}

export type VirtualBackgroundType = 
  | 'none'
  | 'blur-light'
  | 'blur-heavy'
  | 'office'
  | 'penthouse'
  | 'library'
  | 'cafe'
  | 'studio'
  | 'custom';

export interface VirtualBackgroundOption {
  id: VirtualBackgroundType;
  label: string;
  description: string;
  previewUrl?: string;
  iconName?: string;
}

export interface ReactionEvent {
  id: string;
  peerId: string;
  name: string;
  emoji: string;
  x: number;
}
