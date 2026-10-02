import React from 'react';
import { X, Mic, Video, Volume2, ShieldCheck } from 'lucide-react';
import { DeviceInfo } from '../hooks/useMediaDevices';

interface SettingsModalProps {
  availableCameras: DeviceInfo[];
  availableMics: DeviceInfo[];
  selectedCameraId: string;
  selectedMicId: string;
  onSelectCamera: (id: string) => void;
  onSelectMic: (id: string) => void;
  audioLevel: number;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  availableCameras,
  availableMics,
  selectedCameraId,
  selectedMicId,
  onSelectCamera,
  onSelectMic,
  audioLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202124] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Audio Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Mic className="w-4 h-4 text-[#8ab4f8]" />
              <span>Audio</span>
            </div>

            {/* Microphone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Microphone</label>
              <select
                value={selectedMicId}
                onChange={(e) => onSelectMic(e.target.value)}
                className="w-full bg-[#282a2d] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
              >
                {availableMics.length > 0 ? (
                  availableMics.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </option>
                  ))
                ) : (
                  <option value="">Default Microphone</option>
                )}
              </select>
            </div>

            {/* Live Mic Level Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Microphone Level</span>
                <span className="font-mono">{audioLevel}%</span>
              </div>
              <div className="w-full h-2 bg-[#282a2d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10b981] transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Video className="w-4 h-4 text-[#8ab4f8]" />
              <span>Video</span>
            </div>

            {/* Camera Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Camera</label>
              <select
                value={selectedCameraId}
                onChange={(e) => onSelectCamera(e.target.value)}
                className="w-full bg-[#282a2d] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
              >
                {availableCameras.length > 0 ? (
                  availableCameras.map((cam) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label}
                    </option>
                  ))
                ) : (
                  <option value="">Default Web Camera</option>
                )}
              </select>
            </div>

            {/* Video Resolution */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Send resolution (maximum)</label>
              <select
                defaultValue="720p"
                className="w-full bg-[#282a2d] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
              >
                <option value="720p">High definition (720p)</option>
                <option value="1080p">Full high definition (1080p)</option>
                <option value="360p">Standard definition (360p)</option>
              </select>
            </div>
          </div>

          {/* Audio Features Status */}
          <div className="p-3 bg-[#282a2d] rounded-xl flex items-center justify-between text-xs text-slate-300 border border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8ab4f8]" />
              <span>Noise Cancellation & Echo Cancellation</span>
            </div>
            <span className="text-[#8ab4f8] font-medium">Active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1e1e1e] flex justify-end border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
