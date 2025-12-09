import React, { useState } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SCATTERED);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Scene mode={mode} onOpenCard={setActiveCard} />
      <UI 
        mode={mode} 
        setMode={setMode} 
        activeCard={activeCard}
        onCloseCard={() => setActiveCard(null)}
      />
    </div>
  );
};

export default App;