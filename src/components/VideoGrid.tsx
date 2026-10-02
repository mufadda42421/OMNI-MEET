import React from 'react';
import { Participant } from '../types';
import { ParticipantTile } from './ParticipantTile';

interface VideoGridProps {
  localParticipant: Participant;
  remoteParticipants: Participant[];
  pinnedId: string | null;
  onTogglePin: (id: string) => void;
  localAudioLevel: number;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localParticipant,
  remoteParticipants,
  pinnedId,
  onTogglePin,
  localAudioLevel,
}) => {
  const allParticipants = [localParticipant, ...remoteParticipants];

  // Screen share check: is anyone presenting?
  const presentingParticipant = allParticipants.find((p) => p.isScreenSharing);
  const pinnedParticipant = allParticipants.find((p) => p.id === pinnedId);

  // Spotlight layout if someone is pinned or presenting
  const spotlightTarget = presentingParticipant || pinnedParticipant;

  if (spotlightTarget) {
    const filmstrip = allParticipants.filter((p) => p.id !== spotlightTarget.id);

    return (
      <div className="flex-1 w-full h-full p-3 sm:p-4 flex flex-col lg:flex-row gap-3 overflow-hidden">
        {/* Main Stage */}
        <div className="flex-1 h-full min-h-[300px] flex items-center justify-center">
          <ParticipantTile
            participant={spotlightTarget}
            isLocal={spotlightTarget.isLocal}
            isPinned={spotlightTarget.id === pinnedId}
            onTogglePin={onTogglePin}
            speakingLevel={spotlightTarget.isLocal ? localAudioLevel : 0}
          />
        </div>

        {/* Filmstrip (vertical on large screens, horizontal on mobile) */}
        {filmstrip.length > 0 && (
          <div className="w-full lg:w-72 h-40 lg:h-full flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 pb-1 lg:pb-0">
            {filmstrip.map((participant) => (
              <div
                key={participant.id}
                className="w-56 lg:w-full h-full lg:h-44 shrink-0"
              >
                <ParticipantTile
                  participant={participant}
                  isLocal={participant.isLocal}
                  isPinned={participant.id === pinnedId}
                  onTogglePin={onTogglePin}
                  speakingLevel={participant.isLocal ? localAudioLevel : 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dynamic grid layouts based on participant count
  const count = allParticipants.length;

  let gridClasses = 'grid-cols-1 grid-rows-1';
  if (count === 2) {
    gridClasses = 'grid-cols-1 sm:grid-cols-2 grid-rows-1 sm:grid-rows-1';
  } else if (count === 3) {
    gridClasses = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 sm:grid-rows-2 lg:grid-rows-1';
  } else if (count === 4) {
    gridClasses = 'grid-cols-2 grid-rows-2';
  } else if (count <= 6) {
    gridClasses = 'grid-cols-2 sm:grid-cols-3 grid-rows-2 sm:grid-rows-2';
  } else {
    gridClasses = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-2 sm:grid-rows-3';
  }

  return (
    <div className="flex-1 w-full h-full p-3 sm:p-4 flex items-center justify-center overflow-hidden">
      <div className={`grid ${gridClasses} gap-3 sm:gap-4 w-full h-full max-w-[1600px] max-h-[920px]`}>
        {allParticipants.map((participant) => (
          <div key={participant.id} className="w-full h-full min-h-0 min-w-0">
            <ParticipantTile
              participant={participant}
              isLocal={participant.isLocal}
              isPinned={participant.id === pinnedId}
              onTogglePin={onTogglePin}
              speakingLevel={participant.isLocal ? localAudioLevel : 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
