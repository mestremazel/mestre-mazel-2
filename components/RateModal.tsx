
import React from 'react';

interface RateModalProps {
  isOpen: boolean;
  onRate: () => void;
  onClose: () => void;
}

const RateModal: React.FC<RateModalProps> = ({ isOpen, onRate, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-mystic-900 to-black border border-gold-500 rounded-2xl max-w-sm w-full p-6 relative shadow-[0_0_60px_rgba(255,215,0,0.3)] text-center">
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-6xl drop-shadow-lg">
            ⭐
        </div>

        <h2 className="mt-8 text-2xl font-serif text-gold-400 font-bold mb-2">
          Gostou da sua leitura?
        </h2>
        
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Ajude o <strong className="text-white">Tarot Verdadeiro</strong> a crescer! 
          Dê 5 estrelas e ganhe <span className="text-gold-400 font-bold">1 HORA DE PREMIUM GRÁTIS</span> imediatamente.
        </p>

        <div className="flex justify-center gap-2 mb-6 text-2xl text-gold-500">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onRate}
            className="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg transform hover:scale-105"
          >
            ⭐⭐⭐⭐⭐ Avaliar e Ganhar
          </button>
          
          <button 
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-300 underline mt-2"
          >
            Não, obrigado. Quero continuar na versão grátis.
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateModal;
