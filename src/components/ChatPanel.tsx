import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShieldCheck, Lock, Code2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  encryptionFingerprint: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClose,
  encryptionFingerprint,
}) => {
  const [inputText, setInputText] = useState('');
  const [inspectMessage, setInspectMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-[#202124] border-l border-white/5 flex flex-col z-30 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-base text-white">In-call messages</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Encryption Banner */}
      <div className="m-3 p-3 rounded-xl bg-[#282a2d] border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#8ab4f8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <span>End-to-End Encrypted (AES-256)</span>
            <Lock className="w-3 h-3 text-[#8ab4f8]" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Messages are encrypted on your device. Only active participants hold the decryption key.
          </p>
          <div className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded inline-block">
            Key: {encryptionFingerprint || 'Initializing...'}
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
            <Lock className="w-8 h-8 text-slate-500 mb-1" />
            <p>No messages yet.</p>
            <p className="text-slate-500">Messages sent in this call are end-to-end encrypted.</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center text-[11px] text-slate-400 py-1 font-medium">
                  {msg.text}
                </div>
              );
            }

            return (
              <div key={msg.id} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ backgroundColor: msg.avatarColor || '#1a73e8' }}
                    >
                      {msg.senderName.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-slate-200">{msg.senderName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.ciphertext && (
                      <button
                        onClick={() => setInspectMessage(msg)}
                        title="Inspect cryptographic payload"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#8ab4f8] transition-opacity"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-7 text-sm text-slate-100 bg-[#2d2e30] p-2.5 rounded-2xl rounded-tl-sm break-words border border-white/5">
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send an encrypted message..."
          className="flex-1 bg-[#282a2d] hover:bg-[#303236] focus:bg-[#303236] text-sm text-white placeholder-slate-400 px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8ab4f8] transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          title="Send message"
          className="p-3 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white disabled:opacity-40 disabled:hover:bg-[#1a73e8] transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Cryptographic Inspector Modal */}
      {inspectMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#202124] border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8ab4f8]" />
                <h3 className="font-semibold text-sm text-white">Cryptographic Payload Inspector</h3>
              </div>
              <button
                onClick={() => setInspectMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Algorithm</label>
                <div className="p-2 bg-black/40 rounded text-[#8ab4f8]">AES-GCM 256-bit</div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Decrypted Plaintext</label>
                <div className="p-2 bg-black/40 rounded text-green-400">{inspectMessage.text}</div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Raw Ciphertext (Over the wire)</label>
                <div className="p-2 bg-black/40 rounded text-slate-300 break-all max-h-24 overflow-y-auto">
                  {inspectMessage.ciphertext}
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Initialization Vector (IV)</label>
                <div className="p-2 bg-black/40 rounded text-slate-300 break-all">
                  {inspectMessage.iv}
                </div>
              </div>
            </div>
            <button
              onClick={() => setInspectMessage(null)}
              className="w-full py-2 bg-[#3c4043] hover:bg-[#4a4f54] text-white rounded-lg text-xs font-medium transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
