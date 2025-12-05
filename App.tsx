
import React, { useState, useEffect, useRef } from 'react';
import { TAROT_DECK, COOLDOWN_MS, getZodiacSign } from './constants';
import { DrawnCard, ReadingResult, UserPreferences } from './types';
import { interpretTarotReading, generateTarotAudio, generateHoroscopeContent } from './services/geminiService';
import { 
  getHistory, 
  saveReadingToHistory, 
  getUserPrefs, 
  updateUserPrefs, 
  normalizeQuestion 
} from './services/storageService';
import CardDisplay from './components/CardDisplay';
import PremiumModal from './components/PremiumModal';
import AdModal from './components/AdModal';
import RateModal from './components/RateModal';
import DonationModal from './components/DonationModal';
import ReactMarkdown from 'react-markdown';

// Icons
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const CrownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/></svg>
);

const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);

// Decorative Components
const CornerDecoration = ({ className }: { className?: string }) => (
  <svg className={`w-16 h-16 sm:w-24 sm:h-24 text-gold-600/30 absolute pointer-events-none ${className}`} viewBox="0 0 100 100" fill="currentColor">
    <path d="M10,10 L40,10 C35,15 30,25 30,40 L30,45 L10,45 L10,10 Z M10,45 L30,45 C30,60 35,70 40,75 L10,75 L10,45 Z" />
    <circle cx="20" cy="20" r="4" className="text-gold-500" />
    <path d="M15,15 L35,15 M15,35 L15,15" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const MandalaBackground = () => (
  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] opacity-10 pointer-events-none z-0">
     <svg viewBox="0 0 200 200" className="w-full h-full text-gold-500 animate-spin-slow">
        <g fill="none" stroke="currentColor" strokeWidth="1">
           <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
           <circle cx="100" cy="100" r="70" />
           <circle cx="100" cy="100" r="50" />
           <path d="M100 10 L100 190 M10 100 L190 100 M36 36 L164 164 M164 36 L36 164" opacity="0.5" />
           <path d="M100 20 L130 100 L100 180 L70 100 Z" opacity="0.5" />
           <path d="M20 100 L100 70 L180 100 L100 130 Z" opacity="0.5" />
        </g>
     </svg>
  </div>
);

const App: React.FC = () => {
  // State
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ReadingResult | null>(null);
  const [history, setHistory] = useState<ReadingResult[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPrefs());
  const [cooldownLeft, setCooldownLeft] = useState(0);
  
  // Horoscope State
  const [birthDateInput, setBirthDateInput] = useState(prefs.birthDate || '');
  const [horoscopeContent, setHoroscopeContent] = useState<string | null>(null);
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Modals
  const [showPremium, setShowPremium] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // Refs
  const resultRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    setHistory(getHistory());
    checkPremiumExpiry();
    
    // Check for cached horoscope
    const today = new Date().toISOString().split('T')[0];
    if (prefs.cachedHoroscope && prefs.cachedHoroscope.date === today) {
      setHoroscopeContent(prefs.cachedHoroscope.content);
    }
    
    // Timer for cooldown and premium check
    const timer = setInterval(() => {
        updateCooldown();
        checkPremiumExpiry();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkPremiumExpiry = () => {
    const currentPrefs = getUserPrefs();
    setPrefs(currentPrefs); // Sync state

    if (currentPrefs.isPremium && currentPrefs.premiumExpiry) {
        if (Date.now() > currentPrefs.premiumExpiry) {
            // Expired
            const updated = updateUserPrefs({ isPremium: false, premiumExpiry: null });
            setPrefs(updated);
            alert("Seu período Premium gratuito encerrou. Esperamos que tenha aproveitado!");
        }
    }
  };

  const updateCooldown = () => {
    const currentPrefs = getUserPrefs();
    
    // Premium users have no cooldown
    if (currentPrefs.isPremium) {
      setCooldownLeft(0);
      return;
    }

    const now = Date.now();
    const elapsed = now - currentPrefs.lastReadingTime;
    const remaining = Math.max(0, COOLDOWN_MS - elapsed);
    setCooldownLeft(remaining);
  };

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${totalMinutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  // --- TAROT LOGIC ---

  const handleThrowCards = async () => {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const qHash = normalizeQuestion(question);
    const isPremium = prefs.isPremium;

    if (!question.trim()) {
      alert("Por favor, concentre-se e digite sua pergunta.");
      return;
    }

    if (!isPremium && cooldownLeft > 0) {
      const confirmAd = window.confirm(`Mestre Mazel descansa. Aguarde ${formatTime(cooldownLeft)} ou assista a um anúncio para perguntar agora.\n\nAssine o Premium para perguntas ilimitadas!`);
      if (confirmAd) {
        setShowAd(true);
      }
      return;
    }

    setIsLoading(true);
    setCurrentResult(null);
    setIsPlayingAudio(false);
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    try {
      const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
      const selectedCards: DrawnCard[] = shuffled.slice(0, 3).map((card, index) => ({
        ...card,
        isReversed: Math.random() < 0.3,
        position: index === 0 ? 'Passado' : index === 1 ? 'Presente' : 'Futuro'
      }));

      const interpretation = await interpretTarotReading(question, selectedCards);

      const result: ReadingResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        question: question,
        cards: selectedCards,
        interpretation: interpretation
      };

      setCurrentResult(result);
      const previousHistoryLength = history.length;
      const newHistory = saveReadingToHistory(result);
      setHistory(newHistory);
      
      const newPrefs = updateUserPrefs({
        lastReadingTime: Date.now()
      });
      setPrefs(newPrefs);
      
      if (!isPremium) {
        setCooldownLeft(COOLDOWN_MS);
      } else {
        setCooldownLeft(0);
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

      if (previousHistoryLength === 0 && !prefs.hasRedeemedTrial && !prefs.isPremium) {
          setTimeout(() => {
              setShowRateModal(true);
          }, 8000);
      }

    } catch (error) {
      alert("Houve uma perturbação no éter. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!currentResult) return;
    if (isPlayingAudio) return;
    
    setIsPlayingAudio(true);
    try {
        const audioBuffer = await generateTarotAudio(currentResult.interpretation);
        
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } else if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start(0);

    } catch (error) {
        console.error("Audio error", error);
        alert("Mestre Mazel está em silêncio agora. Tente novamente.");
        setIsPlayingAudio(false);
    }
  };

  // --- HOROSCOPE LOGIC ---

  const handleSaveBirthDate = () => {
    if(!birthDateInput) return;
    const newPrefs = updateUserPrefs({ birthDate: birthDateInput });
    setPrefs(newPrefs);
    // Clear cache if date changes to force new reading logic if needed, 
    // but here we just allow them to click the button
  };

  const handleGetHoroscope = async () => {
    if (!prefs.birthDate) {
      alert("Por favor, preencha sua data de nascimento.");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check cache first
    if (prefs.cachedHoroscope && prefs.cachedHoroscope.date === today && horoscopeContent) {
      return; // Already showing
    }

    setIsLoadingHoroscope(true);
    try {
      const dateParts = prefs.birthDate.split('-');
      const day = parseInt(dateParts[2]);
      const month = parseInt(dateParts[1]);
      const sign = getZodiacSign(day, month);

      const content = await generateHoroscopeContent(sign, prefs.birthDate, prefs.isPremium);
      
      setHoroscopeContent(content);
      
      const newPrefs = updateUserPrefs({
        cachedHoroscope: {
          date: today,
          content: content
        }
      });
      setPrefs(newPrefs);

    } catch (error) {
      console.error(error);
      alert("Erro ao consultar os astros.");
    } finally {
      setIsLoadingHoroscope(false);
    }
  };


  // --- ADS & PREMIUM ---

  const handleAdComplete = () => {
    const newPrefs = updateUserPrefs({ lastReadingTime: 0 }); 
    setPrefs(newPrefs);
    setCooldownLeft(0);
    setShowAd(false);
  };

  const handleSubscribe = () => {
    const newPrefs = updateUserPrefs({ isPremium: true, lastReadingTime: 0, premiumExpiry: null });
    setPrefs(newPrefs);
    setCooldownLeft(0);
    setShowPremium(false);
    // Re-fetch horoscope if visible to update content to premium version? 
    // Simplified: User can click again tomorrow or clear cache manually. 
    // Ideally we would invalidate cache here, but let's keep simple.
    alert("✨ Parabéns! Você agora é Premium Definitivo.");
  };

  const handleRate5Stars = () => {
    const oneHour = 60 * 60 * 1000;
    const expiry = Date.now() + oneHour;
    
    const newPrefs = updateUserPrefs({ 
        isPremium: true, 
        premiumExpiry: expiry,
        hasRedeemedTrial: true,
        lastReadingTime: 0 
    });
    setPrefs(newPrefs);
    setCooldownLeft(0);
    setShowRateModal(false);
    alert("🌟 Obrigado! Você ganhou 1 HORA DE PREMIUM GRÁTIS! Pergunte à vontade.");
  };

  const handleShare = async () => {
    if (!currentResult) return;
    const text = `🔮 TAROT VERDADEIRO 🔮\n\nPergunta: ${currentResult.question}\n\nInterpretação:\n${currentResult.interpretation.substring(0, 100)}...\n\nLeia mais no app!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Leitura de Tarot',
          text: text,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Leitura copiada para a área de transferência!");
    }
  };

  const restoreHistoryItem = (item: ReadingResult) => {
    setCurrentResult(item);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans text-mystic-100 pb-12 relative overflow-hidden">
      
      {/* Background Decor */}
      <MandalaBackground />
      <CornerDecoration className="top-0 left-0" />
      <CornerDecoration className="top-0 right-0 rotate-90" />
      <CornerDecoration className="bottom-0 right-0 rotate-180" />
      <CornerDecoration className="bottom-0 left-0 -rotate-90" />

      {/* Header */}
      <header className="p-4 bg-mystic-950/80 sticky top-0 z-40 backdrop-blur-md border-b border-gold-600/30 shadow-lg flex justify-between items-center relative">
        <h1 className="text-xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400 drop-shadow-sm tracking-wide">
          TAROT VERDADEIRO
        </h1>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-full bg-mystic-800 border border-gold-600/50 hover:bg-mystic-700 hover:border-gold-500 transition-colors group"
                title="Histórico"
            >
                <div className="group-hover:text-gold-400 text-mystic-300">
                    <HistoryIcon />
                </div>
            </button>
            
            {!prefs.isPremium ? (
              <button 
                  onClick={() => setShowPremium(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-500 text-white font-bold py-1 px-4 rounded-full text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400"
              >
              <CrownIcon /> Premium
              </button>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-gold-500/50 bg-gold-900/20">
                <span className="text-gold-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                   <CrownIcon /> {prefs.premiumExpiry ? 'VIP (Temp)' : 'VIP'}
                </span>
              </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 space-y-8 relative z-10">
        
        {/* Intro Text */}
        <section className="text-center mt-6">
           <p className="text-gold-100/90 italic font-serif text-lg">
              "O destino não é um caminho pré-definido,<br/>mas um reflexo de suas escolhas."
           </p>
        </section>

        {/* --- HOROSCOPE SECTION --- */}
        <section className="bg-mystic-900/60 p-6 rounded-xl border border-mystic-600/50 shadow-xl backdrop-blur-sm transition-all">
          <h2 className="text-xl font-serif text-gold-400 mb-4 flex items-center gap-2">
            <span>✨</span> Mensagem do Dia & Horóscopo
          </h2>

          {!prefs.birthDate ? (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-mystic-300">Informe sua data de nascimento para revelar:</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  className="bg-mystic-950 border border-mystic-600 rounded p-2 text-white w-full"
                />
                <button 
                  onClick={handleSaveBirthDate}
                  className="bg-gold-600 text-black font-bold px-4 rounded hover:bg-gold-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
             <div className="space-y-4">
                {!horoscopeContent ? (
                  <button 
                    onClick={handleGetHoroscope}
                    disabled={isLoadingHoroscope}
                    className="w-full bg-gradient-to-r from-blue-900 to-mystic-800 border border-blue-500/30 text-blue-100 py-3 rounded-lg font-bold hover:brightness-110 flex justify-center gap-2"
                  >
                     {isLoadingHoroscope ? 'Consultando as Estrelas...' : '🌌 Ver Minha Mensagem de Hoje'}
                  </button>
                ) : (
                  <div className="bg-mystic-950/80 p-4 rounded-lg border border-gold-600/20 animate-fade-in">
                     <div className="prose prose-invert prose-sm prose-p:text-mystic-200">
                        <ReactMarkdown>{horoscopeContent}</ReactMarkdown>
                     </div>
                     {!prefs.isPremium && (
                        <div className="mt-4 pt-4 border-t border-mystic-800 text-center">
                           <p className="text-xs text-gray-400 mb-2">Quer saber seu Mapa Astral completo e Cor da Sorte?</p>
                           <button onClick={() => setShowPremium(true)} className="text-gold-400 text-sm underline font-bold">
                             Desbloquear com Premium
                           </button>
                        </div>
                     )}
                  </div>
                )}
             </div>
          )}
        </section>
        
        {/* --- TAROT SECTION --- */}
        <section className="bg-mystic-900/80 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gold-600/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
            
            <label className="block text-left text-sm font-bold mb-3 text-gold-500 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg">🔮</span> Sua Pergunta ao Oráculo
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Concentre-se e pergunte... (Ex: O que o futuro reserva para minha carreira?)"
              className="w-full bg-mystic-950/60 border border-mystic-600 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all resize-none h-32 placeholder-mystic-500 font-serif"
              maxLength={200}
            />
            
            <div className="mt-6 flex flex-col gap-3">
                <button
                onClick={handleThrowCards}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg tracking-widest uppercase transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg border border-transparent
                    ${isLoading 
                    ? 'bg-mystic-800 cursor-wait text-mystic-400 border-mystic-700' 
                    : (!prefs.isPremium && cooldownLeft > 0)
                        ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-mystic-600 to-mystic-800 hover:from-mystic-500 hover:to-mystic-700 text-gold-100 border-gold-600/50 shadow-[0_4px_20px_rgba(91,62,168,0.4)]'
                    }`}
                >
                {isLoading ? (
                    <span className="animate-pulse flex items-center justify-center gap-2">
                        <span className="animate-spin text-xl">🔮</span> Consultando os astros...
                    </span>
                ) : (!prefs.isPremium && cooldownLeft > 0) ? (
                    `Aguarde ${formatTime(cooldownLeft)}`
                ) : (
                    "Jogar as Cartas"
                )}
                </button>
                
                {(!prefs.isPremium && cooldownLeft > 0 && !isLoading) && (
                    <div className="flex justify-between items-center text-xs sm:text-sm px-2">
                        <button 
                            onClick={() => setShowAd(true)}
                            className="text-gray-400 hover:text-white underline decoration-dotted"
                        >
                            Ver anúncio para liberar
                        </button>
                        <button 
                            onClick={() => setShowPremium(true)}
                            className="text-gold-500 hover:text-gold-300 font-bold flex items-center gap-1"
                        >
                            <CrownIcon /> Liberar tudo com Premium
                        </button>
                    </div>
                )}
            </div>
        </section>

        {/* Results Section */}
        {currentResult && (
          <div ref={resultRef} className="animate-slide-up space-y-8 pb-10">
            
            <div className="flex justify-center items-end gap-2 sm:gap-6 perspective-container py-6 flex-wrap sm:flex-nowrap min-h-[350px]">
              {currentResult.cards.map((card, idx) => (
                <CardDisplay key={`${card.id}-${idx}`} card={card} delay={idx * 300} />
              ))}
            </div>

            <div className="bg-mystic-900/90 backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-gold-600/40 shadow-2xl relative">
               <h3 className="text-center font-serif text-2xl text-gold-500 mb-6 border-b border-mystic-700 pb-4">A Interpretação de Mestre Mazel</h3>

              <div className="prose prose-invert prose-purple prose-p:text-mystic-100 prose-strong:text-gold-400 max-w-none font-serif text-lg leading-relaxed">
                <ReactMarkdown>{currentResult.interpretation}</ReactMarkdown>
              </div>
              
              <div className="mt-6 flex justify-center">
                 <button 
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg border border-gold-600/30
                        ${isPlayingAudio 
                            ? 'bg-gold-600/20 text-gold-400 animate-pulse cursor-wait' 
                            : 'bg-mystic-800 text-gold-500 hover:bg-gold-600 hover:text-black'
                        }`}
                 >
                    <VolumeIcon /> 
                    {isPlayingAudio ? "Mestre Mazel falando..." : "Ouvir Mestre Mazel"}
                 </button>
              </div>

              <div className="mt-10 pt-6 border-t border-mystic-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gold-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider bg-mystic-800 px-4 py-2 rounded-lg border border-gold-600/30 hover:bg-gold-600 hover:border-transparent"
                >
                  <ShareIcon /> Compartilhar Leitura
                </button>
                <span className="text-xs text-mystic-400/60 italic">O destino sugere, mas você decide.</span>
              </div>
            </div>
          </div>
        )}
        
        {/* History Overlay */}
        {showHistory && (
             <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in flex justify-center">
                <div className="max-w-xl w-full mt-12 mb-12">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                        <h2 className="text-2xl font-serif text-gold-500">Histórico de Visões</h2>
                        <button onClick={() => setShowHistory(false)} className="text-white hover:text-red-400 transition-colors text-3xl leading-none">&times;</button>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                            <span className="text-4xl mb-4 opacity-30">🎴</span>
                            <p>O livro do destino ainda está em branco.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => restoreHistoryItem(item)}
                                    className="bg-mystic-900/80 p-5 rounded-xl border border-mystic-700 cursor-pointer hover:border-gold-600 hover:bg-mystic-800 transition-all group shadow-lg"
                                >
                                    <div className="flex justify-between text-xs text-gold-600/70 mb-2 font-mono uppercase tracking-wider">
                                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="font-serif font-medium text-white mb-3 line-clamp-2 text-lg group-hover:text-gold-100 transition-colors">"{item.question}"</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.cards.map((c, i) => (
                                            <span key={i} className="text-xs py-1 px-2 bg-mystic-950 rounded text-purple-300 border border-mystic-700">
                                                {c.name} {c.isReversed ? '↺' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
        )}

      </main>

      {/* Modals */}
      <PremiumModal 
        isOpen={showPremium} 
        onClose={() => setShowPremium(false)} 
        onSubscribe={handleSubscribe} 
      />
      <AdModal 
        isOpen={showAd} 
        onComplete={handleAdComplete} 
        onCancel={() => setShowAd(false)} 
      />
      <RateModal 
        isOpen={showRateModal}
        onRate={handleRate5Stars}
        onClose={() => setShowRateModal(false)}
      />
    </div>
  );
};

export default App;
