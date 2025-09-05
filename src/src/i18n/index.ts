import { translations, Language, CURATED_VOICES } from './translations';

let currentLanguage: Language = 'en';

/**
 * 브라우저 언어를 기반으로 지원되는 언어를 감지합니다
 */
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0] as Language;
  const supportedLanguages: Language[] = ['en', 'ko', 'ja', 'es', 'pt', 'hi'];
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
}

/**
 * 현재 언어를 가져옵니다
 */
export function getLanguage(): Language {
  const savedLang = localStorage.getItem('roleGtp_language');
  if (savedLang && ['en', 'ko', 'ja', 'es', 'pt', 'hi'].includes(savedLang)) {
    currentLanguage = savedLang as Language;
    return currentLanguage;
  }
  
  // 브라우저 언어 자동 감지
  currentLanguage = detectBrowserLanguage();
  localStorage.setItem('roleGtp_language', currentLanguage);
  return currentLanguage;
}

/**
 * 언어를 설정합니다
 */
export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem('roleGtp_language', lang);
  document.documentElement.lang = lang;
  
  // HTML 요소 자동 번역
  translateUI();
}

/**
 * 번역 키를 기반으로 현재 언어의 텍스트를 반환합니다
 */
export function i18n(key: string, replacements: { [key: string]: string | number } = {}): string {
  const lang = getLanguage();
  const translationSet = translations[lang] || translations.en;
  let text = (translationSet as any)[key] || (translations.en as any)[key] || `[${key}]`;

  if (typeof text === 'string') {
    text = text.replace(/{(\w+)}/g, (match, placeholder) => {
      return replacements[placeholder] !== undefined ? String(replacements[placeholder]) : match;
    });
  }
  return text;
}

/**
 * DOM 요소들을 자동으로 번역합니다
 */
export function translateUI() {
  // data-i18n 속성을 가진 요소들을 번역
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!;
    el.innerHTML = i18n(key);
  });
  
  // placeholder 속성 번역
  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder!;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.placeholder = i18n(key);
    }
  });
  
  // title 속성 번역
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle!;
    el.title = i18n(key);
  });
}

/**
 * 현재 언어에 맞는 음성 목록을 가져옵니다
 */
export function getVoicesForLanguage(lang?: Language): string[] {
  const targetLang = lang || getLanguage();
  return CURATED_VOICES[targetLang] || CURATED_VOICES.en;
}

/**
 * 언어 이름을 현재 언어로 번역하여 반환합니다
 */
export function getLanguageDisplayName(lang: Language): string {
  const displayNames: { [key in Language]: string } = {
    en: i18n('english'),
    ko: i18n('korean'),
    ja: i18n('japanese'),
    es: i18n('spanish'),
    pt: i18n('portuguese'),
    hi: i18n('hindi')
  };
  
  return displayNames[lang] || lang;
}

/**
 * 지원되는 모든 언어 목록을 반환합니다
 */
export function getSupportedLanguages(): Language[] {
  return ['en', 'ko', 'ja', 'es', 'pt', 'hi'];
}

/**
 * 언어별 음성 인식/합성을 위한 언어 코드를 반환합니다
 */
export function getLanguageCode(lang?: Language): string {
  const targetLang = lang || getLanguage();
  const languageCodes: { [key in Language]: string } = {
    en: 'en-US',
    ko: 'ko-KR', 
    ja: 'ja-JP',
    es: 'es-ES',
    pt: 'pt-BR',
    hi: 'hi-IN'
  };
  
  return languageCodes[targetLang] || 'en-US';
}

/**
 * 초기화 함수 - 앱 시작시 호출
 */
export function initializeLanguage() {
  try {
    const lang = getLanguage();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
      translateUI();
    }
    
    // 브라우저 언어 변경 감지 (브라우저 환경에서만)
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('languagechange', () => {
        try {
          const newLang = detectBrowserLanguage();
          if (newLang !== currentLanguage) {
            setLanguage(newLang);
          }
        } catch (error) {
          console.warn('Error handling language change:', error);
        }
      });
    }
  } catch (error) {
    console.error('Language initialization failed:', error);
    // 기본값으로 fallback
    currentLanguage = 'en';
  }
}