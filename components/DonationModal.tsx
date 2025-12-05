import React from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-mystic-800 border border-gold-600 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-mystic-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-serif text-gold-500 text-center mb-4">Apoie o Oráculo</h2>
        <p className="text-gray-300 text-center mb-6">
          O Tarot Verdadeiro é mantido pela energia do universo e por doações generosas. 
          Sua contribuição ajuda a manter a chama acesa.
        </p>

        <div className="space-y-3">
            {/* Mock Buttons for Demo */}
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-lg transition-all">
            <span>💠</span> Doar via PIX
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3 px-4 rounded-lg transition-all">
            <span>🅿️</span> Doar via PayPal
          </button>
          
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center border border-mystic-500 hover:bg-mystic-700 text-mystic-100 py-3 px-4 rounded-lg transition-all"
          >
            Outros métodos
          </a>
        </div>

        <p className="text-xs text-center text-gray-500 mt-6">
          Pagamentos seguros. Agradecemos sua generosidade.
        </p>
      </div>
    </div>
  );
};

export default DonationModal;