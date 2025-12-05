
import React, { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleBuy = () => {
    setIsProcessing(true);
    // Simulating payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSubscribe();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-mystic-900 to-mystic-800 border-2 border-gold-500 rounded-2xl max-w-md w-full p-8 relative shadow-[0_0_50px_rgba(255,215,0,0.2)] animate-slide-up overflow-hidden">
        
        {/* Shine effect background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-mystic-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="text-center mb-8 relative z-10">
          <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">👑</div>
          <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 font-bold mb-2">
            Plano Supremo
          </h2>
          <p className="text-mystic-300 text-sm uppercase tracking-widest">Conexão Divina Ilimitada</p>
        </div>

        <div className="space-y-3 mb-8 relative z-10 text-sm sm:text-base">
          <div className="flex items-center gap-3 p-2 bg-mystic-950/50 rounded-lg border border-gold-600/20">
            <span className="text-green-400 text-xl">✓</span>
            <span className="text-white font-medium">Tarot: Perguntas Ilimitadas</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-mystic-950/50 rounded-lg border border-gold-600/20">
            <span className="text-green-400 text-xl">✓</span>
            <span className="text-white font-medium">Horóscopo do Dia Completo</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-mystic-950/50 rounded-lg border border-gold-600/20">
            <span className="text-green-400 text-xl">✓</span>
            <span className="text-white font-medium">Mapa Astral & Cor da Sorte</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-mystic-950/50 rounded-lg border border-gold-600/20">
            <span className="text-green-400 text-xl">✓</span>
            <span className="text-white font-medium">Sem Anúncios / Sem Espera</span>
          </div>
        </div>

        <div className="text-center mb-6 relative z-10">
           <span className="text-4xl font-bold text-gold-400">R$ 14,99</span>
           <span className="text-mystic-400 text-sm"> / mês</span>
        </div>

        <button 
          onClick={handleBuy}
          disabled={isProcessing}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-gold-600 via-yellow-500 to-gold-600 text-mystic-950 font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {isProcessing ? (
             <span className="flex items-center justify-center gap-2">
               <span className="animate-spin h-5 w-5 border-2 border-mystic-900 border-t-transparent rounded-full"></span>
               Processando...
             </span>
          ) : (
             <span className="flex items-center justify-center gap-2 text-lg">
                ASSINAR AGORA ✨
             </span>
          )}
          
          {/* Shine animation */}
          <div className="absolute top-0 -left-full w-full h-full bg-white/30 skew-x-12 group-hover:animate-[shine_1s_ease-in-out_infinite]" />
        </button>

        <p className="text-xs text-center text-gray-500 mt-4 relative z-10">
          Cancele quando quiser. Pagamento seguro.
        </p>
      </div>
    </div>
  );
};

export default PremiumModal;
