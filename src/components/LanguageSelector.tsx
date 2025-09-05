import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Check } from 'lucide-react';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect: (languageCode: string) => void;
  currentLanguage: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'auto', name: 'Auto-detect', nativeName: '자동 감지' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];

export function LanguageSelector({ isOpen, onClose, onLanguageSelect, currentLanguage }: LanguageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(
    language =>
      language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageSelect(languageCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>언어 선택</DialogTitle>
        </DialogHeader>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="언어 검색하기"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 언어 목록 */}
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-1 p-1">
            {filteredLanguages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className="w-full justify-between h-12 px-3"
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm text-muted-foreground">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* 자동 감지 옵션 */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            className="w-full justify-between h-12 px-3"
            onClick={() => handleLanguageSelect('auto')}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">자동 감지</span>
              <span className="text-sm text-muted-foreground">브라우저 설정을 따릅니다</span>
            </div>
            {currentLanguage === 'auto' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}