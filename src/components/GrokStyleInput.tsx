import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Mic, MicOff, Send, Paperclip, ChevronDown, SlidersHorizontal, ChevronRight, Square } from 'lucide-react';
import { speechManager } from '../src/providers/speech';
import { useApp } from '../src/context/AppContext';
import { ConversationSettingsModal } from './ConversationSettingsModal';
import { FileAttachmentModal } from './FileAttachmentModal';
import { useIsMobile } from './ui/use-mobile';
import { toast } from "sonner@2.0.3";

interface GrokStyleInputProps {
  onSendMessage: (message: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  isInCenter?: boolean;
  selectedRole?: {
    name: string;
    description: string;
    prompt: string;
    category: string;
  } | null;
  onAccountModalOpen?: () => void;
}

export function GrokStyleInput({ onSendMessage, value, onChange, isInCenter = false, selectedRole, onAccountModalOpen }: GrokStyleInputProps) {
  const { state, updateSettings, stopGeneration, setSelectedAiModel } = useApp();
  const isMobile = useIsMobile();
  const [internalMessage, setInternalMessage] = useState('');
  const [showModeModal, setShowModeModal] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [showConversationSettings, setShowConversationSettings] = useState(false);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  const message = value !== undefined ? value : internalMessage;
  const setMessage = onChange || setInternalMessage;



  // 모드 변경 감지
  useEffect(() => {
    setForceRenderKey(prev => prev + 1);
  }, [state.userSettings.mode]);



  // 음성 인식 상태 ��기화
  useEffect(() => {
    const checkListeningState = () => {
      if (speechManager && typeof speechManager.getIsListening === 'function') {
        setIsListening(speechManager.getIsListening());
      }
    };
    
    const interval = setInterval(checkListeningState, 100);
    return () => clearInterval(interval);
  }, []);



  // 음성 인식 토글
  const toggleVoiceRecognition = () => {
    try {
      if (!speechManager || typeof speechManager.getIsListening !== 'function') {
        alert('음성 인식 기능을 사용할 수 없습니다.');
        return;
      }

      if (!speechManager.getIsListening()) {
        if (typeof speechManager.isRecognitionSupported !== 'function' || !speechManager.isRecognitionSupported()) {
          alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
          return;
        }

        if (typeof speechManager.startListening === 'function') {
          const success = speechManager.startListening(
            (text) => {
              setMessage(message + text);
              setIsListening(false);
            },
            (error) => {
              console.error('Voice recognition error:', error);
              setIsListening(false);
              alert(`음성 인식 오류: ${error}`);
            }
          );
          setIsListening(success);
        }
      } else {
        if (typeof speechManager.stopListening === 'function') {
          speechManager.stopListening();
        }
        setIsListening(false);
      }
    } catch (error) {
      console.error('음성 인식 토글 오류:', error);
      setIsListening(false);
      alert('음성 인식 기능에 오류가 발생했습니다.');
    }
  };
  
  // Role에 따른 플레이스홀더 설정
  const getPlaceholder = () => {
    if (selectedRole) {
      return `${selectedRole.name}에게 메시지 보내기...`;
    }
    return "Buddy에게 메시지 보내기...";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.isLoading) {
      // AI가 응답 중이면 중지
      stopGeneration();
      toast.success('AI 응답이 중지되었습니다');
    } else if (message.trim()) {
      // 메시지 전송
      onSendMessage(message);
      if (onChange) {
        onChange('');
      } else {
        setMessage('');
      }
    }
  };

  const handleStopGeneration = () => {
    stopGeneration();
    toast.success('AI 응답이 중지되었습니다');
  };

  const containerClass = isInCenter 
    ? "w-full max-w-4xl mx-auto px-4" 
    : "w-full max-w-4xl mx-auto px-4 py-4";

  // 현재 모드 표시 이름 가져오기
  const getCurrentModeName = () => {
    switch (state.userSettings.mode) {
      case 'standard': return 'Standard';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return 'Standard';
    }
  };



  return (
    <div className={containerClass} key={`grok-input-${state.userSettings.mode}-${forceRenderKey}`}>
      <form onSubmit={handleSubmit} className="relative">

        
        <div className="bg-muted/50 backdrop-blur-md border border-border/50 rounded-3xl px-6 py-5 shadow-2xl">
          {/* 상단 입력 영역 */}
          <div className="flex items-center gap-3 mb-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getPlaceholder()}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg px-0 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="flex items-center gap-2">
              {/* 음성 입력 버튼 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleVoiceRecognition}
                className={`w-10 h-10 hover:bg-background/20 rounded-xl transition-all duration-200 ${
                  isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : ''
                }`}
                title={isListening ? '음성 인식 중지 (클���)' : '음성 인식 시작'}
                disabled={!speechManager || typeof speechManager.isRecognitionSupported !== 'function' || !speechManager.isRecognitionSupported()}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                type="submit"
                size="icon"
                className={`w-10 h-10 rounded-xl transition-all duration-300 transform ${ 
                  state.isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-100 animate-pulse' 
                    : message.trim() 
                      ? 'bg-foreground text-background hover:bg-foreground/90 scale-100' 
                      : 'bg-muted text-muted-foreground scale-95 cursor-not-allowed'
                }`}
                disabled={!state.isLoading && !message.trim()}
                title={state.isLoading ? 'AI 응답 중지' : '메시지 전송'}
              >
                <div className={`transition-all duration-300 transform ${
                  state.isLoading ? 'rotate-0' : 'rotate-0'
                }`}>
                  {state.isLoading ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </div>
              </Button>
            </div>
          </div>
          
          {/* 하단 파일 첨부 및 설정 영역 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* 첨부 버튼 - 동그라미 테두리 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowFileAttachment(true)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  showFileAttachment 
                    ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'border-border/50 hover:border-border hover:bg-background/20'
                }`}
                title="파일 첨부"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              

              
              {/* 모드 선택 버튼 */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModeModal(!showModeModal)}
                className="h-8 px-3 hover:bg-background/20 rounded-lg flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span>{getCurrentModeName()} 모드</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>



          {/* 모드 선택 모달 - 웹/모바일 구분 */}
          {showModeModal && (
            <>
              {/* 배경 오버레이 (모바일만) */}
              {isMobile && (
                <div 
                  className="fixed inset-0 bg-black/0 z-[150]"
                  onClick={() => setShowModeModal(false)}
                />
              )}
              
              {/* 모달 컨텐츠 */}
              <div className={`${
                isMobile 
                  ? 'fixed bottom-6 left-4 right-4 z-[200]' 
                  : 'absolute bottom-full left-0 w-64 mb-2 z-[200]'
              } bg-background border border-border rounded-xl shadow-lg`}>
                <div className="p-3">
                  {/* 컴팩트한 모드 버튼들 */}
                  <div className="space-y-1">
                    {/* Standard */}
                    <div
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        state.userSettings.mode === 'standard' 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        updateSettings({ mode: 'standard' });
                        setShowModeModal(false);
                        toast.success('Standard ���드로 변경');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Standard</span>
                        {state.userSettings.mode === 'standard' && <span className="text-xs">●</span>}
                      </div>
                    </div>

                    {/* Advanced */}
                    <div
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        state.userSettings.mode === 'advanced' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        updateSettings({ mode: 'advanced' });
                        setShowModeModal(false);
                        toast.success('Advanced 모드로 변경');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Advanced</span>
                        {state.userSettings.mode === 'advanced' && <span className="text-xs text-blue-600 dark:text-blue-400">●</span>}
                      </div>
                    </div>

                    {/* Expert */}
                    <div
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        state.userSettings.mode === 'expert' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        updateSettings({ mode: 'expert' });
                        setShowModeModal(false);
                        toast.success('Expert 모드로 변경');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expert</span>
                        {state.userSettings.mode === 'expert' && <span className="text-xs text-purple-600 dark:text-purple-400">●</span>}
                      </div>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="h-px bg-border/30 my-2"></div>

                  {/* 대화 설정 버튼 */}
                  <div
                    className="px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setShowConversationSettings(true);
                      setShowModeModal(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="text-sm">대화 설정</span>
                      </div>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </form>

      {/* 대화창 설정 모달 */}
      <ConversationSettingsModal
        isOpen={showConversationSettings}
        onClose={() => setShowConversationSettings(false)}
        chatId={state.activeChatId || undefined}
      />

      {/* 파일 첨부 모달 */}
      <FileAttachmentModal
        isOpen={showFileAttachment}
        onClose={() => setShowFileAttachment(false)}
        onFileAttach={(files) => {
          // TODO: 실제 파일 첨부 로직 구현
          console.log('Files attached:', files);
          toast.success(`${files.length}개 파일이 첨부되었습니다.`);
        }}
        onTextAttach={(title, content) => {
          // TODO: 텍스트 첨부 로직 구현
          console.log('Text attached:', { title, content });
          toast.success('텍스트가 첨부되었습니다.');
        }}
        onDriveConnect={() => {
          // TODO: Google Drive 연결 로직 구현
          console.log('Google Drive connection requested');
          toast.info('Google Drive 연결 기능을 곧 지원할 예정입니다.');
        }}
        onConnectorFileSelect={(connector, files) => {
          // TODO: 커넥터 파일 선택 로직 구현
          console.log('Connector files selected:', { connector, files });
          toast.success(`${connector}에서 ${files.length}개 항목을 가져왔습니다.`);
        }}
      />
    </div>
  );
}