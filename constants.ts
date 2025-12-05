
import { TarotCard } from './types';

const MAJOR_ARCANA: string[] = [
  "O Louco", "O Mago", "A Sacerdotisa", "A Imperatriz", "O Imperador", 
  "O Hierofante", "Os Enamorados", "O Carro", "A Força", "O Eremita", 
  "A Roda da Fortuna", "A Justiça", "O Enforcado", "A Morte", "A Temperança", 
  "O Diabo", "A Torre", "A Estrela", "A Lua", "O Sol", "O Julgamento", "O Mundo"
];

const SUITS = [
  { name: 'Paus', code: 'wa' },      // Wands
  { name: 'Copas', code: 'cu' },     // Cups
  { name: 'Espadas', code: 'sw' },   // Swords
  { name: 'Ouros', code: 'pe' }      // Pentacles
] as const;

// Mapping numbers/faces to file index: 01=Ace, 02-10, 11=Page, 12=Knight, 13=Queen, 14=King
const NUMBERS = [
  { name: 'Ás', val: '01' },
  { name: '2', val: '02' },
  { name: '3', val: '03' },
  { name: '4', val: '04' },
  { name: '5', val: '05' },
  { name: '6', val: '06' },
  { name: '7', val: '07' },
  { name: '8', val: '08' },
  { name: '9', val: '09' },
  { name: '10', val: '10' },
  { name: 'Valete', val: '11' },
  { name: 'Cavaleiro', val: '12' },
  { name: 'Rainha', val: '13' },
  { name: 'Rei', val: '14' }
];

export const generateDeck = (): TarotCard[] => {
  const deck: TarotCard[] = [];

  // Major Arcana
  // Files are usually ar00.jpg to ar21.jpg
  MAJOR_ARCANA.forEach((name, index) => {
    const code = `ar${index.toString().padStart(2, '0')}`;
    deck.push({
      id: `major-${index}`,
      name: name,
      arcana: 'Major',
      number: index,
      keywords: ['Arquétipo', 'Jornada', 'Destino'],
      imageCode: code
    });
  });

  // Minor Arcana
  SUITS.forEach(suit => {
    NUMBERS.forEach((numObj, index) => {
      const code = `${suit.code}${numObj.val}`;
      deck.push({
        id: `minor-${suit.name}-${index}`,
        name: `${numObj.name} de ${suit.name}`,
        arcana: 'Minor',
        suit: suit.name as any,
        number: numObj.name,
        keywords: [suit.name, 'Cotidiano'],
        imageCode: code
      });
    });
  });

  return deck;
};

export const TAROT_DECK = generateDeck();

// 60 Minutes Cooldown as requested
export const COOLDOWN_MINUTES = 60;
export const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;
export const MOCK_AD_DURATION_MS = 3000;

export const getZodiacSign = (day: number, month: number): string => {
  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricórnio";
  if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Aquário";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Peixes";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 20)) return "Áries";
  if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) return "Touro";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gêmeos";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Câncer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leão";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgem";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Escorpião";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagitário";
  return "Desconhecido";
};
