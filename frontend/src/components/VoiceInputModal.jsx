import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Send, Sparkles, Volume2 } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function VoiceInputModal({ isOpen, onClose, onSendQuestion }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognizerRef = useRef(null);

  const sampleVoicePrompts = [
    "భిన్నాలు అంటే ఏమిటి? ఉదాహరణ చెప్పండి",
    "2x + 5 = 15 సమీకరణాన్ని ఎలా సాధించాలి?",
    "వర్గమూలం 144 విలువ ఎంత?",
    "చతుర్భుజంలో నాలుగు కోణాల మొత్తం ఎంత?",
    "అకరణీయ సంఖ్యల గుణకార తత్సమం ఏమిటి?"
  ];

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setInterimText('');
      setErrorMessage('');
      startVoiceListening();
    } else {
      stopVoiceListening();
    }

    return () => {
      stopVoiceListening();
    };
  }, [isOpen]);

  const startVoiceListening = () => {
    if (!speechService.isRecognitionSupported()) {
      setErrorMessage('మీ బ్రౌజర్‌లో మైక్రోఫోన్ ఆటో-రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి క్రింది ప్రశ్నలను ఎంచుకోండి లేదా టైప్ చేయండి.');
      return;
    }

    try {
      const rec = speechService.createRecognizer(
        (data) => {
          if (data.final) {
            setTranscript((prev) => (prev ? prev + ' ' : '') + data.final);
            setInterimText('');
          } else if (data.interim) {
            setInterimText(data.interim);
          }
        },
        (error) => {
          console.warn('Speech error:', error);
          if (error === 'not-allowed') {
            setErrorMessage('దయచేసి బ్రౌజర్‌లో మైక్రోఫోన్ అనుమతి (Microphone Permission) ఇవ్వండి.');
          } else {
            setErrorMessage('శబ్దం స్పష్టంగా వినపడలేదు. దయచేసి మరోసారి ప్రయత్నించండి.');
          }
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setIsRecording(true);
        setErrorMessage('');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('మైక్ ప్రారంభించడంలో సమస్య ఏర్పడింది.');
      setIsRecording(false);
    }
  };

  const stopVoiceListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
      recognizerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    const finalQuery = (transcript + ' ' + interimText).trim();
    if (!finalQuery) return;
    stopVoiceListening();
    onSendQuestion(finalQuery, 'voice');
    onClose();
  };

  const handleSelectSample = (sample) => {
    setTranscript(sample);
    setInterimText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 flex flex-col items-center relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>తెలుగు వాయిస్ ప్రశ్న (Voice Question)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            మీ ప్రశ్నను తెలుగులో అడగండి
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            మైక్ ఆన్‌లో ఉన్నప్పుడు స్పష్టంగా మాట్లాడండి
          </p>
        </div>

        {/* Animated Microphone Area */}
        <div className="relative my-4 flex flex-col items-center">
          <button
            onClick={() => {
              if (isRecording) stopVoiceListening();
              else startVoiceListening();
            }}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isRecording
                ? 'bg-orange-600 text-white glow-recording scale-105'
                : 'bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-600'
            }`}
          >
            {isRecording ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>

          <span className="mt-3 text-xs font-semibold text-slate-600">
            {isRecording ? '🎙️ వింటున్నాను... మాట్లాడండి' : 'మైక్ ఆపబడింది (నొక్కండి)'}
          </span>
        </div>

        {/* Transcript Box */}
        <div className="w-full min-h-[90px] max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 mb-4 focus-within:border-orange-500 transition-colors">
          {transcript || interimText ? (
            <p>
              <span className="font-medium">{transcript}</span>
              <span className="text-orange-600 italic"> {interimText}</span>
            </p>
          ) : (
            <p className="text-slate-400 text-center italic text-xs mt-3">
              "భిన్నాలు అంటే ఏమిటి?", "2x + 5 = 15 ను ఎలా సాధించాలి?" అని అడగండి...
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2 w-full text-center mb-3">
            {errorMessage}
          </p>
        )}

        {/* Quick Sample Voice Prompts */}
        <div className="w-full mb-5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>లేదా ఒక ఉదాహరణ ప్రశ్నను ఎంచుకోండి:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleVoicePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(p)}
                className="text-[11px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            రద్దు చేయండి
          </button>
          <button
            onClick={handleSend}
            disabled={!transcript.trim() && !interimText.trim()}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>AI గురువుని అడగండి</span>
          </button>
        </div>

      </div>
    </div>
  );
}
