import React from 'react';

interface MuteDebugOverlayProps {
  isMuted: boolean;
  hasUserInteracted: boolean;
  showMuteIcon: boolean;
  videoIndex: number;
}

export function MuteDebugOverlay({ 
  isMuted, 
  hasUserInteracted, 
  showMuteIcon, 
  videoIndex 
}: MuteDebugOverlayProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs font-mono z-50">
      <div>Video #{videoIndex}</div>
      <div>Muted: {isMuted ? 'YES' : 'NO'}</div>
      <div>Interacted: {hasUserInteracted ? 'YES' : 'NO'}</div>
      <div>Icon: {showMuteIcon ? 'VISIBLE' : 'HIDDEN'}</div>
    </div>
  );
}