import React from 'react';
import { ReactionEvent } from '../types';

interface ReactionsOverlayProps {
  reactions: ReactionEvent[];
}

export const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({ reactions }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-24 flex items-center gap-1.5 px-3 py-1.5 bg-[#202124]/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl animate-float-up"
          style={{
            left: `${r.x}%`,
          }}
        >
          <span className="text-2xl animate-bounce">{r.emoji}</span>
          <span className="text-xs font-medium text-white max-w-[100px] truncate">{r.name}</span>
        </div>
      ))}
    </div>
  );
};
