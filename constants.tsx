
import React from 'react';

export const HeartIcon = ({ className = "w-5 h-5 inline-block mr-2 text-pink-300" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

/**
 * Renders an emoji using the Apple/iOS style from a reliable CDN.
 */
export const Emoji = ({ char, className = "" }: { char: string, className?: string }) => {
  const emojiUrl = `https://emojicdn.elk.sh/${encodeURIComponent(char)}?style=apple`;
  
  return (
    <img 
      src={emojiUrl} 
      alt={char}
      className={`inline-block emoji-no-outline align-middle pointer-events-none select-none ${className}`}
      style={{ width: '1em', height: '1em', minWidth: '1em' }}
    />
  );
};

export const TABLE_COLOR = "#E75480";
export const POCKET_RADIUS = 48;
export const BALL_RADIUS = 30;
