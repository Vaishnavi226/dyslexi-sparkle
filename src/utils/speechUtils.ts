export class SpeechUtils {
  private static synthesis = window.speechSynthesis;
  private static recognition: any = null;

  static speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
    lang?: string;
    onEnd?: () => void;
    onStart?: () => void;
  } = {}) {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-IN'; // Default to Indian English
    
    // Try to find Indian English voice
    const voices = this.synthesis.getVoices();
    let selectedVoice = null;
    
    if (options.voice) {
      selectedVoice = voices.find(voice => voice.name.includes(options.voice!));
    } else {
      // Prioritize Indian English voices
      selectedVoice = voices.find(voice => 
        voice.lang === 'en-IN' || 
        voice.name.toLowerCase().includes('rishi') ||
        voice.name.toLowerCase().includes('indian')
      );
      
      // Fallback to any English voice if Indian not available
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en-') && 
          (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('male'))
        );
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
    }
    
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    
    this.synthesis.speak(utterance);
  }

  static stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  static async startListening(options: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
    language?: string;
    continuous?: boolean;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = true;
      this.recognition.lang = options.language || 'en-US';
      
      this.recognition.onstart = () => resolve();
      
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        
        if (options.onResult) {
          options.onResult(transcript.trim(), isFinal);
        }
      };
      
      this.recognition.onend = () => {
        this.recognition = null;
        if (options.onEnd) options.onEnd();
      };
      
      this.recognition.onerror = (event: any) => {
        if (options.onError) options.onError(event.error);
        reject(new Error(event.error));
      };
      
      this.recognition.start();
    });
  }

  static stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  static isListening() {
    return this.recognition !== null;
  }

  static getVoices() {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }
}