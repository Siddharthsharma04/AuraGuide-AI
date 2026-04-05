import React, { useEffect, useState } from 'react';

interface VoiceCommandCenterProps {
  isActive: boolean;
  onCommand: (text: string) => void;
  onDone: () => void;
}

const VoiceCommandCenter: React.FC<VoiceCommandCenterProps> = ({ isActive, onCommand, onDone }) => {
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log('Voice Command:', text);
        onCommand(text);
        onDone();
      };

      recognizer.onerror = (err: any) => {
        console.error('Speech error:', err);
        onDone();
      };

      setRecognition(recognizer);
    }
  }, []);

  useEffect(() => {
    if (isActive && recognition) {
      recognition.start();
    }
  }, [isActive, recognition]);

  return null; // Logic only component
};

export const speak = (text: string) => {
  const synth = window.speechSynthesis;
  if (synth.speaking) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  synth.speak(utterance);
};

export const vibratePattern = (pattern: 'left' | 'right' | 'obstacle' | 'emergency') => {
  if (!navigator.vibrate) return;
  
  switch (pattern) {
    case 'left':
      navigator.vibrate([100, 50, 100]); // Two short pulses
      break;
    case 'right':
      navigator.vibrate([500]); // One long pulse
      break;
    case 'obstacle':
      navigator.vibrate([100, 50, 100, 50, 100]); // Rapid pulses
      break;
    case 'emergency':
      navigator.vibrate([1000, 500, 1000]); // Very long pulses
      break;
  }
};

export default VoiceCommandCenter;
