import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { i18n, getLanguage, setLanguage, getSupportedLanguages, getLanguageDisplayName, getVoicesForLanguage, getLanguageCode } from '../i18n';
import { Language } from '../i18n/translations';
import { speechManager } from '../providers/speech';

export function useTranslation() {
  const { state, updateSettings } = useApp();
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getLanguage());
    };

    // 언어 변경 이벤트 리스너 등록
    window.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    return i18n(key, replacements);
  };

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setCurrentLang(newLang);
    
    // 음성 매니저 언어 코드 업데이트
    const languageCode = getLanguageCode(newLang);
    speechManager.setLanguageCode(languageCode);
    
    // AppContext의 사용자 설정도 업데이트
    updateSettings({
      language: newLang
    });
  };

  return {
    t,
    language: currentLang,
    changeLanguage,
    availableLanguages: getSupportedLanguages(),
    getLanguageDisplayName,
    getVoicesForLanguage: () => getVoicesForLanguage(currentLang),
    getLanguageCode: () => getLanguageCode(currentLang),
    isRTL: currentLang === 'hi', // 힌디어는 RTL 지원 필요시
  };
}