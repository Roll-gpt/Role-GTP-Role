import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  X, 
  Crown, 
  Settings, 
  Globe, 
  Volume2, 
  Palette, 
  User, 
  Bell, 
  Shield, 
  Key,
  Mic,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Bot,
  Zap,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Mail,
  Lock,
  Brain,
  Sparkles,
  Link2,
  Cloud,
  FileText
} from 'lucide-react';
import { useApp } from '../src/context/AppContext';

interface SafeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 고도화된 API Provider 설정
const API_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT 모델 시리즈', 
    icon: '🤖',
    defaultEndpoint: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '최신 GPT-4 모델' },
      { id: 'gpt-4', name: 'GPT-4', description: '고성능 범용 모델' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠르고 효율적' }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude 모델 시리즈', 
    icon: '🧠',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: '최고 성능 모델' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: '균형잡힌 성능' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '빠른 응답' }
    ]
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    description: 'Gemini 모델 시리즈', 
    icon: '🔮',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', description: '고성능 분석 모델' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: '멀티모달 모델' }
    ]
  },
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    description: '다양한 모델 라우터', 
    icon: '🌐',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'via OpenRouter' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'via OpenRouter' },
      { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B', description: 'Meta 모델' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', description: 'Mistral 모델' }
    ]
  },
  { 
    id: 'groq', 
    name: 'Groq', 
    description: '초고속 추론 엔진', 
    icon: '⚡',
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama2-70b-4096', name: 'Llama 2 70B', description: '고성능 오픈소스' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mistral 혼합 모델' },
      { id: 'gemma-7b-it', name: 'Gemma 7B', description: 'Google 오픈소스' }
    ]
  },
  { 
    id: 'xai', 
    name: 'xAI', 
    description: 'Grok 모델 시리즈', 
    icon: '🚀',
    defaultEndpoint: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI의 최신 모델' }
    ]
  },
  { 
    id: 'custom', 
    name: 'Custom API', 
    description: '커스텀 엔드포인트', 
    icon: '🔧',
    defaultEndpoint: '',
    models: []
  }
];

export function SafeSettingsModal({ isOpen, onClose }: SafeSettingsModalProps) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // 커넥터 상태 관리
  const [connectorStatus, setConnectorStatus] = useState<Record<string, {
    isConnected: boolean;
    lastSync?: Date;
    error?: string;
  }>>({
    'gdrive': { isConnected: false },
    'gmail': { isConnected: false },
    'gdocs': { isConnected: false },
    'notion': { isConnected: false },
    'slack': { isConnected: false }
  });
  
  // 고도화된 API 설정 구조
  const [apiConfigs, setApiConfigs] = useState<Record<string, {
    apiKey: string;
    endpoint: string;
    selectedModels: string[];
    isActive: boolean;
  }>>({});

  // 로컬 스토리지에서 API 설정 로드
  useEffect(() => {
    const savedConfigs = localStorage.getItem('role-gpt-api-configs');
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        setApiConfigs(parsed);
      } catch (error) {
        console.error('Failed to parse API configs:', error);
      }
    } else {
      // 기본 설정 초기화
      const defaultConfigs: typeof apiConfigs = {};
      API_PROVIDERS.forEach(provider => {
        defaultConfigs[provider.id] = {
          apiKey: '',
          endpoint: provider.defaultEndpoint,
          selectedModels: [],
          isActive: false
        };
      });
      setApiConfigs(defaultConfigs);
      localStorage.setItem('role-gpt-api-configs', JSON.stringify(defaultConfigs));
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleApiKeyToggle = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  // API 설정 업데이트 핸들러
  const updateApiConfig = (providerId: string, updates: Partial<typeof apiConfigs[string]>) => {
    setApiConfigs(prev => {
      const updated = {
        ...prev,
        [providerId]: {
          ...prev[providerId],
          ...updates
        }
      };
      
      // 로컬 스토리지에 저장
      localStorage.setItem('role-gpt-api-configs', JSON.stringify(updated));
      
      // 기존 형식도 유지 (하위 호환성)
      const simpleKeys: Record<string, string> = {};
      Object.entries(updated).forEach(([id, config]) => {
        simpleKeys[id] = config.apiKey;
      });
      localStorage.setItem('role-gpt-api-keys', JSON.stringify(simpleKeys));
      
      return updated;
    });
  };

  const toggleProviderActive = (providerId: string) => {
    const config = apiConfigs[providerId];
    if (config?.apiKey.trim()) {
      updateApiConfig(providerId, { isActive: !config.isActive });
    }
  };

  const toggleModel = (providerId: string, modelId: string) => {
    const config = apiConfigs[providerId];
    if (!config) return;
    
    const selectedModels = config.selectedModels.includes(modelId)
      ? config.selectedModels.filter(id => id !== modelId)
      : [...config.selectedModels, modelId];
    
    updateApiConfig(providerId, { selectedModels });
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-4xl bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">설정</h2>
              <p className="text-sm text-muted-foreground">Role GPT 개인화 설정</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-6 bg-muted/30">
              <TabsTrigger value="general" className="data-[state=active]:bg-background">
                <Settings className="w-4 h-4 mr-2" />
                일반
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-background">
                <Key className="w-4 h-4 mr-2" />
                API 키
              </TabsTrigger>
              <TabsTrigger value="connectors" className="data-[state=active]:bg-background">
                <Link2 className="w-4 h-4 mr-2" />
                커넥터
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-background">
                <Palette className="w-4 h-4 mr-2" />
                외관
              </TabsTrigger>
              <TabsTrigger value="audio" className="data-[state=active]:bg-background">
                <Volume2 className="w-4 h-4 mr-2" />
                음성
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-background">
                <User className="w-4 h-4 mr-2" />
                계정
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {/* 일반 설정 */}
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-4">언어 및 지역</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">언어</p>
                          <p className="text-sm text-muted-foreground">인터페이스 언어 선택</p>
                        </div>
                      </div>
                      <Select defaultValue="ko">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <div>
                  <h3 className="text-base font-medium mb-4">AI 모드</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">응답 모드</p>
                          <p className="text-sm text-muted-foreground">AI 응답 스타일 설정</p>
                        </div>
                      </div>
                      <Select defaultValue={state.userSettings.mode}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 🔥 통합된 API 키 탭 */}
            <TabsContent value="api" className="space-y-6 mt-0">
              <div className="space-y-6">
                {/* 헤더 섹션 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      AI Provider 관리
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      다양한 AI 서비스의 API 키와 모델을 관리하세요
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Check className="w-3 h-3 mr-1" />
                      {Object.values(apiConfigs).filter(config => config?.isActive).length}개 활성
                    </Badge>
                    <Badge variant="outline">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {Object.values(apiConfigs).reduce((count, config) => 
                        count + (config?.selectedModels?.length || 0), 0
                      )}개 모델
                    </Badge>
                  </div>
                </div>

                {/* Provider 목록 */}
                <div className="space-y-4">
                  {API_PROVIDERS.map((provider) => {
                    const config = apiConfigs[provider.id] || {
                      apiKey: '',
                      endpoint: provider.defaultEndpoint,
                      selectedModels: [],
                      isActive: false
                    };
                    
                    return (
                      <div key={provider.id} className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
                        {/* Provider Header */}
                        <div className="p-4 bg-muted/20 border-b border-border/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center text-lg">
                                {provider.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{provider.name}</h4>
                                  {config.isActive && (
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                      <Check className="w-3 h-3 mr-1" />
                                      활성
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{provider.description}</p>
                                {config.selectedModels.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {config.selectedModels.length}개 모델 선택됨
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={config.isActive}
                                onCheckedChange={() => toggleProviderActive(provider.id)}
                                disabled={!config.apiKey.trim()}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApiKeyToggle(provider.id)}
                                className="h-8 w-8"
                              >
                                {showApiKeys[provider.id] ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Configuration Area */}
                        <div className="p-4 space-y-4">
                          {/* API 키 */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              API 키
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type={showApiKeys[provider.id] ? "text" : "password"}
                                placeholder={`${provider.name} API 키 입력`}
                                value={config.apiKey}
                                onChange={(e) => updateApiConfig(provider.id, { apiKey: e.target.value })}
                                className="flex-1 font-mono text-sm bg-input-background"
                              />
                              {config.apiKey && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateApiConfig(provider.id, { apiKey: '', isActive: false, selectedModels: [] })}
                                  className="h-10 w-10 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* 모델 선택 */}
                          {provider.models.length > 0 && config.apiKey && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Brain className="w-4 h-4" />
                                  사용할 모델 선택
                                </label>
                                <span className="text-xs text-muted-foreground">
                                  {config.selectedModels.length}개 선택됨
                                </span>
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin border border-border/30 rounded-lg p-2">
                                {provider.models.map((model) => (
                                  <div 
                                    key={model.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-border/50 hover:bg-accent/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{model.name}</div>
                                      <div className="text-xs text-muted-foreground">{model.description}</div>
                                    </div>
                                    <Switch
                                      checked={config.selectedModels.includes(model.id)}
                                      onCheckedChange={() => toggleModel(provider.id, model.id)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom Model Input */}
                          {provider.id === 'custom' && config.apiKey && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">커스텀 모델 이름</label>
                              <Input
                                placeholder="custom-model-name"
                                onChange={(e) => {
                                  if (e.target.value.trim()) {
                                    updateApiConfig(provider.id, { selectedModels: [e.target.value.trim()] });
                                  }
                                }}
                                className="font-mono text-sm bg-input-background"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 도움말 섹션 */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">API 키 관리 팁</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                        <li>• API 키는 안전하게 보관하�� 타인과 공유하지 마세요</li>
                        <li>• 각 Provider의 사용량과 요금을 정기적으로 확인하세요</li>
                        <li>• 모델 선택 후 활성화해야 사용할 수 있습니다</li>
                        <li>• OpenRouter는 다양한 모델을 하나의 API로 사용할 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 커넥터 설정 */}
            <TabsContent value="connectors" className="space-y-6 mt-0">
              <div className="space-y-6">
                {/* 헤더 섹션 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      커넥터 관리
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      외부 서비스를 연결하여 데이터에 쉽게 접근하세요
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Check className="w-3 h-3 mr-1" />
                      {Object.values(connectorStatus).filter(status => status.isConnected).length}개 연결됨
                    </Badge>
                  </div>
                </div>

                {/* Google 서비스들 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Google 서비스</h4>
                  
                  {/* Google Drive */}
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
                    <div className="p-4 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                              <path d="M12.01 2L5.68 10.09H11.05L17.38 2H12.01Z" fill="currentColor"/>
                              <path d="M5.68 10.09L2 15.91H7.37L11.05 10.09H5.68Z" fill="currentColor"/>
                              <path d="M11.05 10.09L7.37 15.91H18.32L22 10.09H11.05Z" fill="currentColor"/>
                              <path d="M18.32 15.91L12.01 22L22 15.91H18.32Z" fill="currentColor"/>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Google Drive</h4>
                              {connectorStatus.gdrive.isConnected && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="w-3 h-3 mr-1" />
                                  연결됨
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">파일 저장소, 폴더 구조, 이미지/문서 접근</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setConnectorStatus(prev => ({
                              ...prev,
                              gdrive: { 
                                ...prev.gdrive, 
                                isConnected: !prev.gdrive.isConnected,
                                lastSync: prev.gdrive.isConnected ? undefined : new Date()
                              }
                            }));
                          }}
                          className={connectorStatus.gdrive.isConnected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {connectorStatus.gdrive.isConnected ? '연결 해제' : '연결하기'}
                        </Button>
                      </div>
                    </div>
                    {connectorStatus.gdrive.isConnected && (
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground">
                          마지막 동기화: {connectorStatus.gdrive.lastSync?.toLocaleString() || '방금 전'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gmail */}
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
                    <div className="p-4 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Gmail</h4>
                              {connectorStatus.gmail.isConnected && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="w-3 h-3 mr-1" />
                                  연결됨
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">이메일, 첨부파일, 라벨 및 아카이브 접근</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setConnectorStatus(prev => ({
                              ...prev,
                              gmail: { 
                                ...prev.gmail, 
                                isConnected: !prev.gmail.isConnected,
                                lastSync: prev.gmail.isConnected ? undefined : new Date()
                              }
                            }));
                          }}
                          className={connectorStatus.gmail.isConnected ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"}
                        >
                          {connectorStatus.gmail.isConnected ? '연결 해제' : '연결하기'}
                        </Button>
                      </div>
                    </div>
                    {connectorStatus.gmail.isConnected && (
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground">
                          마지막 동기화: {connectorStatus.gmail.lastSync?.toLocaleString() || '방금 전'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Google 문서 */}
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
                    <div className="p-4 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Google 문서</h4>
                              {connectorStatus.gdocs.isConnected && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="w-3 h-3 mr-1" />
                                  연결됨
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Docs, 시트, 프레젠테이션 및 양식 접근</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setConnectorStatus(prev => ({
                              ...prev,
                              gdocs: { 
                                ...prev.gdocs, 
                                isConnected: !prev.gdocs.isConnected,
                                lastSync: prev.gdocs.isConnected ? undefined : new Date()
                              }
                            }));
                          }}
                          className={connectorStatus.gdocs.isConnected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {connectorStatus.gdocs.isConnected ? '연결 해제' : '연결하기'}
                        </Button>
                      </div>
                    </div>
                    {connectorStatus.gdocs.isConnected && (
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground">
                          마지막 동기화: {connectorStatus.gdocs.lastSync?.toLocaleString() || '방금 전'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 써드파티 서비스들 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">써드파티 서비스</h4>
                  
                  {/* Notion */}
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30 opacity-50">
                    <div className="p-4 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337.748c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.269-.186z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Notion</h4>
                              <Badge variant="secondary">곧 지원</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">페이지, 데이터베이스, 템플릿 접근</p>
                          </div>
                        </div>
                        <Button disabled variant="outline">
                          개발 중
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Slack */}
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30 opacity-50">
                    <div className="p-4 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523c0-1.393 1.135-2.528 2.52-2.528h2.528v2.528c0 1.393-1.135 2.523-2.528 2.523m0-6.723H2.52a2.528 2.528 0 0 1 0-5.056h2.522a2.528 2.528 0 0 1 0 5.056"/>
                              <path d="M8.835 15.165c0-1.393 1.135-2.523 2.528-2.523 1.393 0 2.523 1.135 2.523 2.523v6.313c0 1.393-1.135 2.527-2.523 2.527a2.528 2.528 0 0 1-2.528-2.527z"/>
                              <path d="M8.835 5.042c0-1.393 1.135-2.528 2.528-2.528 1.393 0 2.523 1.135 2.523 2.528v2.528H8.835z"/>
                              <path d="M15.165 8.835a2.528 2.528 0 0 1 2.523-2.528c1.393 0 2.527 1.135 2.527 2.528 0 1.393-1.135 2.523-2.527 2.523z"/>
                              <path d="M21.479 8.835h-2.527V6.307c0-1.393-1.135-2.528-2.527-2.528a2.528 2.528 0 0 0-2.523 2.528v2.528c0 1.393 1.135 2.523 2.523 2.523h2.527c1.393 0 2.527-1.135 2.527-2.523 0-1.393-1.135-2.528-2.527-2.528"/>
                              <path d="M15.165 18.958a2.528 2.528 0 0 1-2.523-2.527c0-1.393 1.135-2.528 2.523-2.528h2.527v2.528c0 1.393-1.135 2.527-2.527 2.527"/>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Slack</h4>
                              <Badge variant="secondary">곧 지원</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">메시지, 채널, 파일 공유 접근</p>
                          </div>
                        </div>
                        <Button disabled variant="outline">
                          개발 중
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 도움말 섹션 */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">커넥터 정보</h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                        <li>• Google 서비스들은 OAuth 2.0을 통해 안전하게 연결됩니다</li>
                        <li>• 연결된 데이터는 로컬에서만 처리되며 외부로 전송되지 않습니다</li>
                        <li>• Notion과 Slack 연결 기능은 곧 지원될 예정입니다</li>
                        <li>• 언제든지 연결을 해제할 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 외관 설정 */}
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-4">테마</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl border border-border/20 hover:border-border/40 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Sun className="w-5 h-5" />
                        <span className="text-sm">라이트</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-600 dark:text-purple-400">다크</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border/20 hover:border-border/40 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        <span className="text-sm">시스템</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <div>
                  <h3 className="text-base font-medium mb-4">디스플레이</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">애니메이션</p>
                          <p className="text-sm text-muted-foreground">UI 애니메이션 효과</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 음성 설정 */}
            <TabsContent value="audio" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-4">음성 기능</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">AI 음성 읽기</p>
                          <p className="text-sm text-muted-foreground">AI 응답을 음성으로 읽기</p>
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">음성 입력</p>
                          <p className="text-sm text-muted-foreground">마이크로 ���성 입력 허용</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">알림음</p>
                          <p className="text-sm text-muted-foreground">메시지 도착 알림음</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 계정 설정 */}
            <TabsContent value="account" className="space-y-6 mt-0">
              {/* 계정 정보 */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">User12345</p>
                    <p className="text-sm text-muted-foreground">example@gmail.com</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Plus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 요금제 정보 */}
              <div className="space-y-3">
                <h3 className="text-base font-medium">요금제</h3>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">무료 체험</p>
                        <p className="text-sm text-green-600 dark:text-green-400">2일 남음</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      업그레이드
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* 보안 설정 */}
              <div className="space-y-3">
                <h3 className="text-base font-medium">보안</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">2단계 인증</p>
                        <p className="text-sm text-muted-foreground">추가 보안 계층으로 계정 보호</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">로그인 알림</p>
                        <p className="text-sm text-muted-foreground">새 기기에서 로그인 시 알림</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">신뢰할 수 있는 기기</p>
                        <p className="text-sm text-muted-foreground">로그인한 기기 관리</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      관리
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* 데이터 관리 */}
              <div className="space-y-3">
                <h3 className="text-base font-medium">데이터</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    내 데이터 내보내기
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    모든 데이터 삭제
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* 푸터 */}
        <div className="flex justify-between items-center p-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Role GPT v1.0.0 • 변경사항은 자동으로 저장됩니다
          </p>
          <Button onClick={onClose} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            완료
          </Button>
        </div>
      </div>
    </>
  );
}