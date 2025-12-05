
import React, { useState, useEffect } from 'react';
import { DrawnCard } from '../types';

interface CardDisplayProps {
  card: DrawnCard;
  delay: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, delay }) => {
  const [revealed, setRevealed] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [tryIndex, setTryIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Lista de fontes de alta disponibilidade via Proxy
  const sources = [
    // Source 1: Sacred Texts via wsrv.nl Proxy (HTTPS, Otimizado, CORS Friendly)
    `https://wsrv.nl/?url=https://sacred-texts.com/tarot/pkt/img/${card.imageCode}.jpg&w=400&q=85`,
    // Source 2: Tindogg GitHub CDN
    `https://cdn.jsdelivr.net/gh/tindogg/tarot-api@master/static/cards/${card.imageCode}.jpg`,
    // Source 3: Ekelen GitHub Pages Mirror
    `https://ekelen.github.io/tarot-api/static/cards/${card.imageCode}.jpg`
  ];

  useEffect(() => {
    // Reset para nova carta
    setTryIndex(0);
    setHasError(false);
    setImageSrc(sources[0]);
    setRevealed(false);

    const timer = setTimeout(() => {
      setRevealed(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [card.id, delay]); // Usando card.id para garantir reset correto

  const handleError = () => {
    const nextTry = tryIndex + 1;
    if (nextTry < sources.length) {
      console.log(`Retrying image for ${card.name} (Source ${nextTry})`);
      setTryIndex(nextTry);
      setImageSrc(sources[nextTry]);
    } else {
      console.error(`All image sources failed for card: ${card.name}`);
      setHasError(true);
    }
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-700 transform ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="mb-2 text-gold-400 font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold drop-shadow-md">{card.position}</div>
      
      <div 
        className="relative group perspective-1000 w-32 h-56 sm:w-48 sm:h-80 cursor-pointer"
        onClick={() => setRevealed(!revealed)}
      >
        <div 
          className={`relative w-full h-full duration-1000 transform-style-3d transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-xl ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}
        >
          {/* VERSO DA CARTA (Back) */}
          <div 
             className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border-2 border-gold-900 bg-mystic-950 rotate-y-180 flex items-center justify-center"
             style={{ 
               zIndex: revealed ? 0 : 2,
               backgroundImage: `radial-gradient(circle, #2d1b4e 20%, #0f0518 90%)`
             }} 
          >
            {/* Padrão Geométrico do Verso */}
            <div className="absolute inset-2 border border-gold-600/30 rounded-lg opacity-50"
                 style={{
                   backgroundImage: `
                     repeating-linear-gradient(45deg, transparent, transparent 10px, #432c7a 10px, #432c7a 11px),
                     repeating-linear-gradient(-45deg, transparent, transparent 10px, #432c7a 10px, #432c7a 11px)
                   `
                 }}>
            </div>
            <div className="relative z-10 text-4xl text-gold-500 opacity-80 animate-pulse-slow">
                ⚜️
            </div>
          </div>

          {/* FRENTE DA CARTA (Front) */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden bg-[#fffdf5] border-[6px] border-white ring-1 ring-gray-900"
            style={{ 
              zIndex: revealed ? 2 : 0,
              transform: 'rotateY(0deg)' // Explicitly set for Safari
            }}
          >
             {!hasError ? (
               <img 
                  src={imageSrc} 
                  alt={card.name} 
                  className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                  onError={handleError}
                  loading="eager"
               />
             ) : (
               /* Fallback Visual (Caso imagem falhe) */
               <div className={`w-full h-full flex flex-col items-center justify-between p-3 bg-[#f0e6d2] text-mystic-900 border-4 border-double border-gold-600/20 ${card.isReversed ? 'rotate-180' : ''}`}>
                 <div className="w-full text-center border-b border-black/10 pb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest block">{card.arcana === 'Major' ? 'Arcano' : card.suit}</span>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center flex-grow gap-2">
                    <span className="text-5xl opacity-80 filter drop-shadow-sm">
                        {card.arcana === 'Major' ? '🔮' : 
                         card.suit === 'Copas' ? '🍷' : 
                         card.suit === 'Espadas' ? '⚔️' : 
                         card.suit === 'Ouros' ? '🪙' : 
                         card.suit === 'Paus' ? '🌿' : '🃏'}
                    </span>
                    <span className="font-serif font-bold text-lg text-center leading-none px-1">{card.name}</span>
                 </div>
                 
                 <div className="w-full text-center border-t border-black/10 pt-1">
                    <span className="text-[10px] italic opacity-60">Rider-Waite</span>
                 </div>
               </div>
             )}
             
             {/* Efeito de envelhecimento (Overlay) */}
             <div className="absolute inset-0 bg-[#5c4018] mix-blend-multiply opacity-20 pointer-events-none"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
             
             {card.isReversed && (
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm z-20 border border-white/20">
                    Invertida
                 </div>
             )}
          </div>
        </div>
      </div>
      
      <div className={`mt-3 text-center transition-opacity duration-1000 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-gold-100 font-serif text-base font-bold leading-tight drop-shadow-lg max-w-[150px]">
            {card.name}
          </p>
      </div>
    </div>
  );
};

export default CardDisplay;
