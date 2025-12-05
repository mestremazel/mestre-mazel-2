
import { GoogleGenAI, Modality } from "@google/genai";
import { DrawnCard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to decode base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const interpretTarotReading = async (
  question: string,
  cards: DrawnCard[]
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const cardsDescription = cards.map(c => 
    `${c.position}: ${c.name} ${c.isReversed ? '(Invertida)' : '(Reta)'}`
  ).join('\n');

  const prompt = `
    Atue como um leitor de Tarô experiente, porém EXTREMAMENTE OBJETIVO e DIRETO.
    Pergunta do consulente: "${question}"
    
    Cartas sorteadas:
    ${cardsDescription}
    
    Regras Estritas de Concisão:
    1. Para cada carta, escreva APENAS 1 ou 2 frases curtas e impactantes. Nada de textos longos.
    2. Conecte as cartas rapidamente.
    3. Dê um conselho final em no máximo 3 linhas.
    4. Vá direto ao ponto, sem rodeios ou explicações genéricas sobre o que é o Tarô.
    
    Formato de Resposta Obrigatório:
    **[Carta 1]**: [Interpretação curta]
    **[Carta 2]**: [Interpretação curta]
    **[Carta 3]**: [Interpretação curta]
    
    ✨ **Conselho do Oráculo**: [Resposta final direta e simbólica]
    
    (Use tom místico, emojis ocasionais, mas mantenha a brevidade).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on this creative task
      }
    });

    return response.text || "As energias estão nebulosas... Tente novamente mais tarde.";
  } catch (error) {
    console.error("Erro na leitura:", error);
    throw new Error("Não foi possível conectar com o plano espiritual (Erro de API).");
  }
};

export const generateHoroscopeContent = async (
  sign: string,
  birthDate: string,
  isPremium: boolean
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const premiumInstructions = isPremium 
    ? `
      3. **Mapa Astral Resumido**: Dê uma breve análise profunda baseada na posição solar (Signo: ${sign}).
      4. **Cor da Sorte de Hoje**: Indique uma cor para usar hoje e por quê.
      5. **Horóscopo Completo**: Previsão detalhada para Amor, Trabalho e Saúde.
    ` 
    : `
      3. **Mapa Astral**: (Apenas diga: "Disponível na versão Premium")
      4. **Cor da Sorte**: (Apenas diga: "Disponível na versão Premium")
      5. **Horóscopo**: Uma previsão geral e curta (máximo 2 linhas).
    `;

  const prompt = `
    Você é o Mestre Mazel, um astrólogo místico.
    Data de nascimento do usuário: ${birthDate}
    Signo Solar: ${sign}
    Usuário Premium: ${isPremium ? "SIM" : "NÃO"}

    Gere o conteúdo diário seguindo ESTRITAMENTE estas seções:

    1. **Mensagem do Dia**: Uma frase inspiradora e mística para hoje.
    2. **Energia do Dia**: Uma palavra-chave.
    ${premiumInstructions}

    Use formatação Markdown bonita com emojis. Seja místico, acolhedor e positivo.
  `;

  try {
     const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "As estrelas estão em silêncio hoje.";
  } catch (error) {
    console.error("Erro no horóscopo:", error);
    return "Não foi possível ler as estrelas agora.";
  }
};

export const generateTarotAudio = async (text: string): Promise<AudioBuffer> => {
  try {
    // 24kHz is standard for Gemini TTS preview
    const sampleRate = 24000;
    // Create a temporary context just for creating the buffer. 
    // The AudioBuffer can be used with other contexts.
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data generated");
    }

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx, sampleRate, 1);
    
    return audioBuffer;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};
