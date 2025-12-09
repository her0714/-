import React from 'react';
import { AppMode } from '../types';

interface UIProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeCard: string | null;
  onCloseCard: () => void;
}

const CardOverlay = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 animate-[fadeIn_0.5s_ease-out]" 
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="relative bg-[#FDFBF7] max-w-md w-full aspect-[4/3] shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform animate-[fadeInDown_0.6s_ease-out] border-8 border-double border-yellow-600/30 p-8 flex flex-col items-center justify-center text-center">
        
        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-yellow-600/50" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-yellow-600/50" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-yellow-600/50" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-yellow-600/50" />

        {/* Content */}
        <div className="mb-6 text-yellow-700/80 text-4xl">
          ❄
        </div>
        
        <h2 className="text-3xl font-serif text-emerald-900 mb-6 tracking-wide italic">
            圣诞祝福
        </h2>
        
        <p className="font-serif text-xl md:text-2xl text-gray-800 leading-relaxed italic border-t border-b border-yellow-600/20 py-6 w-full whitespace-pre-wrap">
          "{message}"
        </p>

        <button 
          onClick={onClose}
          className="mt-8 px-8 py-2 border border-emerald-900/20 text-emerald-900 font-sans text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 hover:text-white transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const UI: React.FC<UIProps> = ({ mode, setMode, activeCard, onCloseCard }) => {
  const isTree = mode === AppMode.TREE_SHAPE;

  const toggleMode = () => {
    setMode(isTree ? AppMode.SCATTERED : AppMode.TREE_SHAPE);
  };

  return (
    <>
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between items-center p-8">
        {/* Header */}
        <header className="text-center animate-fade-in-down mt-4">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] text-yellow-100 uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" style={{ fontFamily: 'serif' }}>
            Noël
          </h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-4"></div>
          <p className="text-emerald-400 text-xs md:text-sm tracking-widest mt-2 font-sans opacity-80">
            MERRY CHRISTMAS
          </p>
        </header>

        {/* Footer Controls */}
        <div className="pointer-events-auto mb-8 flex flex-col items-center gap-4">
          <p className="text-yellow-100/50 text-xs tracking-widest uppercase mb-2">
            {isTree ? 'Assemble Sequence Complete' : 'Awaiting Assembly'}
          </p>
          
          <button
            onClick={toggleMode}
            className={`
              group relative px-8 py-3 overflow-hidden rounded-full transition-all duration-500 ease-out
              border border-yellow-500/30 backdrop-blur-md
              ${isTree ? 'bg-emerald-900/40' : 'bg-transparent'}
              hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]
            `}
          >
            {/* Button Background Gradient */}
            <div className={`
              absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent
              transform transition-transform duration-700
              ${isTree ? 'translate-x-full' : '-translate-x-full group-hover:translate-x-full'}
            `} />

            <span className="relative flex items-center gap-3 text-yellow-100 font-sans tracking-widest text-sm uppercase">
              <span className={`w-2 h-2 rounded-full ${isTree ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'}`}></span>
              {isTree ? 'Disperse' : 'Assemble'}
            </span>
          </button>
        </div>
      </div>

      {/* Card Overlay (Z-index 50) */}
      {activeCard && <CardOverlay message={activeCard} onClose={onCloseCard} />}
    </>
  );
};

export default UI;