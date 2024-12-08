// src/types/global.d.ts

declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  
    // Déclarez le type SpeechRecognition
    interface SpeechRecognition {
      new (): SpeechRecognition;
      interimResults: boolean;
      lang: string;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: (event: SpeechRecognitionError) => void;
      start(): void;
      stop(): void;
    }
  
    interface SpeechRecognitionEvent {
      results: SpeechRecognitionResultList;
    }
  
    interface SpeechRecognitionError {
      error: string;
    }
  }
  
  export {};
  