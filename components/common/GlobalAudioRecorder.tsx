'use client';

import { useState } from 'react';
import AudioRecorder from './AudioRecorder';

interface GlobalAudioRecorderProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

export default function GlobalAudioRecorder({
  onTranscript,
  className = "fixed bottom-6 right-6 z-50"
}: GlobalAudioRecorderProps) {
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  const handleTranscript = (text: string) => {
    setLastTranscript(text);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    if (onTranscript) {
      onTranscript(text);
    }
  };

  return (
    <div className={`flex flex-col items-end gap-2 ${className}`}>
      {showToast && (
        <div className="bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs px-3 py-2 rounded-lg shadow-xl animate-fade-in max-w-xs truncate">
          ✨ تم تحويل الصوت: "{lastTranscript}"
        </div>
      )}

      <AudioRecorder onTranscriptChange={handleTranscript} />
    </div>
  );
}