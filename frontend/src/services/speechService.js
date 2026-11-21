// Web Speech Recognition & SpeechSynthesis service for Telugu
export const speechService = {
  // Speech-to-Text (Voice input in Telugu)
  isRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  createRecognizer(onResult, onError, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = 'te-IN'; // Telugu recognition

    recognizer.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        final: finalTranscript,
        interim: interimTranscript
      });
    };

    recognizer.onerror = (event) => {
      console.warn('[Speech Recognition] Error:', event.error);
      if (onError) onError(event.error);
    };

    recognizer.onend = () => {
      if (onEnd) onEnd();
    };

    return recognizer;
  },

  // Text-to-Speech (Audio explanation out loud)
  isSynthesisSupported() {
    return 'speechSynthesis' in window;
  },

  speakText(text, onStart, onEnd, rate = 0.9) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner voice speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // slightly slower for better Telugu educational clarity
    utterance.pitch = 1.0;

    // Try to find Telugu voice or Indian English/Hindi voice as fallback
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang.startsWith('te') || v.lang.includes('TEL'));
    const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.startsWith('hi'));

    if (teluguVoice) {
      utterance.voice = teluguVoice;
      utterance.lang = 'te-IN';
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('[Speech Synthesis] error:', err);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
