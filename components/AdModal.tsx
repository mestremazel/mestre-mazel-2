import React, { useEffect, useState } from 'react';

interface AdModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-white text-black rounded-lg max-w-sm w-full p-8 text-center shadow-2xl">
        <h3 className="text-xl font-bold mb-4">Patrocinador</h3>
        <div className="w-full h-32 bg-gray-200 flex items-center justify-center mb-4 rounded border-2 border-dashed border-gray-400">
          <span className="text-gray-500 font-bold">ANÚNCIO AQUI</span>
        </div>
        
        {timeLeft > 0 ? (
          <p className="text-gray-600 font-medium">O prêmio será liberado em {timeLeft}s...</p>
        ) : (
          <div className="flex flex-col gap-2 animate-fade-in">
             <p className="text-green-600 font-bold mb-2">Obrigado por assistir!</p>
             <button 
              onClick={onComplete}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 w-full"
            >
              Liberar Nova Pergunta
            </button>
          </div>
        )}
        
        {timeLeft > 0 && (
            <button onClick={onCancel} className="mt-4 text-sm text-gray-400 underline">
                Cancelar e esperar
            </button>
        )}
      </div>
    </div>
  );
};

export default AdModal;