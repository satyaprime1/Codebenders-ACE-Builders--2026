import React, { useState, useEffect } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function TeluguAudioPlayer({ text, label = "వినండి (Audio)" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.9);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
    } else {
      speechService.speakText(
        text,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        speed
      );
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-full px-3 py-1 text-xs font-semibold text-orange-800 transition-all">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 cursor-pointer focus:outline-none"
        title={isPlaying ? "ఆపివేయండి (Stop)" : "స్పష్టంగా వినండి (Listen)"}
      >
        {isPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 fill-orange-600 text-orange-600 animate-pulse" />
            <span className="text-orange-700">ఆపండి</span>
            <span className="flex gap-0.5 items-end h-3 ml-1">
              <span className="w-0.5 h-3 bg-orange-500 animate-[bounce_0.6s_infinite]"></span>
              <span className="w-0.5 h-2 bg-orange-400 animate-[bounce_0.8s_infinite]"></span>
              <span className="w-0.5 h-3.5 bg-orange-600 animate-[bounce_0.5s_infinite]"></span>
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-orange-600" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Speed switcher */}
      <span className="text-orange-300">|</span>
      <button 
        onClick={() => setSpeed(s => s === 0.9 ? 1.1 : s === 1.1 ? 0.75 : 0.9)}
        className="text-[10px] text-orange-600 hover:text-orange-800 cursor-pointer font-bold px-1"
        title="ధ్వని వేగం మార్చుకోండి"
      >
        {speed}x
      </button>
    </div>
  );
}
