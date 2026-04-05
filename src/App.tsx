import React, { useState, useEffect, useRef } from 'react';
import { Mic, Navigation, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import NavigationMap from './components/NavigationMap';
import CameraStream from './components/CameraStream';
import VoiceCommandCenter, { speak, vibratePattern } from './components/VoiceCommandCenter';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastInstruction, setLastInstruction] = useState('Welcome to AuraGuide AI. Tap and say "Navigate to..." or "What do you see?"');
  const [currentDestination, setCurrentDestination] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const lastAlertTime = useRef<number>(0);
  const currentObjects = useRef<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      speak('AuraGuide AI is active. I am your proactive guide. What is our destination?');
    }, 1000);
  }, []);

  const handleVoiceInput = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('navigate to')) {
      const destination = lowerText.split('navigate to')[1].trim();
      setCurrentDestination(destination);
      speak(`Routing to ${destination}. Haptic pulses will guide your turns.`);
    } 
    else if (lowerText.includes('what do you see') || lowerText.includes('describe')) {
      if (currentObjects.current.length === 0) {
        speak('The path ahead is clear.');
      } else {
        const description = `I see ${currentObjects.current.join(', ')} in front of you.`;
        speak(description);
        setLastInstruction(description);
      }
    }
    else if (lowerText.includes('emergency') || lowerText.includes('help')) {
      setIsEmergency(true);
      speak('Emergency mode activated. Sending your location to your emergency contact.');
      vibratePattern('emergency');
    }
  };

  const handleSpatialAlert = (object: string, position: string, allObjects: string[]) => {
    currentObjects.current = allObjects;
    const now = Date.now();
    
    if (now - lastAlertTime.current > 4000) {
      const alertMsg = `${object} ${position}.`;
      setLastInstruction(alertMsg);
      speak(alertMsg);
      vibratePattern('obstacle');
      lastAlertTime.current = now;
    }
  };

  return (
    <div className={`aura-container ${isEmergency ? 'emergency-bg' : ''}`} onClick={() => setIsListening(true)}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.8rem' }}>AuraGuide AI</h1>
        {isEmergency && <ShieldAlert size={32} color="var(--hazard)" />}
      </header>

      <div className="visual-feed">
        <CameraStream isActive={true} onAlert={handleSpatialAlert} />
      </div>

      <div className="status-panel">
        <div className="voice-indicator">
          <div className={isListening ? 'pulsing-dot' : ''} style={{ background: isListening ? 'var(--accent)' : '#444' }}></div>
          <span>{isListening ? 'Listening...' : (isEmergency ? 'EMERGENCY ACTIVE' : 'Aura Active')}</span>
        </div>

        <p className="instruction-text" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
          {lastInstruction}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Navigation size={32} color={currentDestination ? 'var(--success)' : '#444'} />
            <AlertTriangle size={32} color={currentObjects.current.length > 0 ? 'var(--hazard)' : '#444'} />
          </div>
          <div className="main-mic-btn">
            <Mic size={48} color={isListening ? 'var(--accent)' : '#fff'} />
          </div>
        </div>
      </div>

      <NavigationMap destination={currentDestination} onInstructionUpdate={setLastInstruction} />
      <VoiceCommandCenter isActive={isListening} onCommand={handleVoiceInput} onDone={() => setIsListening(false)} />
    </div>
  );
};

export default App;
