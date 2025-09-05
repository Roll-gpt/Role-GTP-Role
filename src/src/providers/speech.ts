// Web Speech API 타입 정의
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: ((event: any) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// 음성 관리자 클래스
class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  private currentLanguage: string = 'ko';
  private enabled: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // 음성 합성 초기화
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      
      // 음성 인식 초기화
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ko-KR';
      }
    }
  }

  setLanguageCode(languageCode: string) {
    this.currentLanguage = languageCode;
    
    // 음성 인식 언어도 업데이트
    if (this.recognition) {
      const languageMap: { [key: string]: string } = {
        ko: 'ko-KR',
        en: 'en-US',
        ja: 'ja-JP',
        es: 'es-ES',
        pt: 'pt-BR',
        hi: 'hi-IN'
      };
      this.recognition.lang = languageMap[languageCode] || 'ko-KR';
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async speak(text: string) {
    if (!this.synth || !this.enabled || !text.trim()) {
      return;
    }

    // 이전 음성 중지
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 언어 설정
    const languageMap: { [key: string]: string } = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      es: 'es-ES',
      pt: 'pt-BR',
      hi: 'hi-IN'
    };
    
    utterance.lang = languageMap[this.currentLanguage] || 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  isSupported() {
    return !!this.synth;
  }

  // 음성 인식 관련 메서드들
  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  startListening(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    try {
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('음성 인식 시작');
      };

      this.recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('음성 인식 결과:', transcript);
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('음성 인식 오류:', event.error);
        onError(event.error || '음성 인식 오류가 발생했습니다.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('음성 인식 종료');
      };

      this.recognition.start();
      return true;
    } catch (error) {
      console.error('음성 인식 시작 실패:', error);
      this.isListening = false;
      onError('음성 인식을 시작할 수 없습니다.');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('음성 인식 중지 실패:', error);
        this.isListening = false;
      }
    }
  }
}

// 전역 인스턴스
export const speechManager = new SpeechManager();