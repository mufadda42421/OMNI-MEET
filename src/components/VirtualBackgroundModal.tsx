import React, { useRef } from 'react';
import { X, Sparkles, Ban, Upload, Check } from 'lucide-react';
import { VirtualBackgroundType } from '../types';
import { BACKGROUND_PRESETS } from '../services/virtualBackground';

interface VirtualBackgroundModalProps {
  currentBg: VirtualBackgroundType;
  onSelectBg: (type: VirtualBackgroundType, customUrl?: string) => void;
  onClose: () => void;
}

interface BgItem {
  id: VirtualBackgroundType;
  label: string;
  category: 'blur' | 'preset' | 'custom' | 'none';
  svgUri?: string;
}

const BG_ITEMS: BgItem[] = [
  { id: 'none', label: 'No effect', category: 'none' },
  { id: 'blur-light', label: 'Slight blur', category: 'blur' },
  { id: 'blur-heavy', label: 'Heavy blur', category: 'blur' },
  { id: 'office', label: 'Modern Office', category: 'preset', svgUri: BACKGROUND_PRESETS.office },
  { id: 'penthouse', label: 'City Penthouse', category: 'preset', svgUri: BACKGROUND_PRESETS.penthouse },
  { id: 'library', label: 'Cozy Library', category: 'preset', svgUri: BACKGROUND_PRESETS.library },
  { id: 'cafe', label: 'Aesthetic Cafe', category: 'preset', svgUri: BACKGROUND_PRESETS.cafe },
  { id: 'studio', label: 'Neon Studio', category: 'preset', svgUri: BACKGROUND_PRESETS.studio },
];

export const VirtualBackgroundModal: React.FC<VirtualBackgroundModalProps> = ({
  currentBg,
  onSelectBg,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectBg('custom', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-[#202124] border-l border-white/5 flex flex-col z-30 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8ab4f8]" />
          <h2 className="font-medium text-base text-white">Visual effects</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Upload Custom */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCustomUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-3 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2.5 text-xs font-medium transition-all ${
              currentBg === 'custom'
                ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]'
                : 'border-white/20 text-slate-300 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload custom background</span>
            {currentBg === 'custom' && <Check className="w-4 h-4 ml-auto" />}
          </button>
        </div>

        {/* Blur & Default Options */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Blur & Privacy
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {/* None */}
            <button
              onClick={() => onSelectBg('none')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                currentBg === 'none'
                  ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]'
                  : 'border-white/10 hover:border-white/20 text-slate-300 bg-[#282a2d]'
              }`}
            >
              <Ban className="w-6 h-6 mb-1 text-slate-400" />
              <span className="text-[11px] font-medium">None</span>
            </button>

            {/* Slight Blur */}
            <button
              onClick={() => onSelectBg('blur-light')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                currentBg === 'blur-light'
                  ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]'
                  : 'border-white/10 hover:border-white/20 text-slate-300 bg-[#282a2d]'
              }`}
            >
              <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 mb-1 opacity-70" />
              <span className="text-[11px] font-medium">Slight</span>
            </button>

            {/* Heavy Blur */}
            <button
              onClick={() => onSelectBg('blur-heavy')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                currentBg === 'blur-heavy'
                  ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 text-[#8ab4f8]'
                  : 'border-white/10 hover:border-white/20 text-slate-300 bg-[#282a2d]'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-400/40 blur-xs mb-1" />
              <span className="text-[11px] font-medium">Heavy</span>
            </button>
          </div>
        </div>

        {/* Scenic Virtual Environments */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Professional Environments
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {BG_ITEMS.filter((item) => item.category === 'preset').map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectBg(item.id)}
                className={`group relative rounded-xl overflow-hidden border transition-all text-left ${
                  currentBg === item.id
                    ? 'border-[#8ab4f8] ring-2 ring-[#8ab4f8]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="h-20 w-full bg-slate-800 overflow-hidden relative">
                  {item.svgUri && (
                    <img
                      src={item.svgUri}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  {currentBg === item.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="p-2 bg-[#282a2d]">
                  <span className="text-xs font-medium text-white block truncate">
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
