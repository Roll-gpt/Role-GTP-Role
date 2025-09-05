/**
 * Role GPT 타입 정의
 * 
 * 전체 애플리케이션에서 사용되는 TypeScript 타입들을 정의
 * - 채팅 시스템 타입
 * - Role 템플릿 시스템
 * - 프로젝트 관리
 * - 사용자 설정
 * - AI Provider 통합
 */

/**
 * 채팅 메시지 인터페이스
 * 사용자와 AI 간의 대화 내용을 나타냄
 */
export interface Message {
  id: number;              // 메시지 고유 ID
  text: string;            // 메시지 텍스트 내용
  sender: 'user' | 'ai';   // 발신자 구분
  timestamp: Date;         // 메시지 생성 시간
}

/**
 * Gemini API 응답 파트 (내부 사용)
 */
export interface Part {
  text: string;
}

/**
 * Role 템플릿 인터페이스
 * AI 어시스턴트의 역할과 성격을 정의
 */
export interface Role {
  id: string;                    // Role 고유 ID
  name: string;                  // Role 이름 (예: "개발자", "디자이너")
  description: string;           // Role 설명
  prompt: string;                // 시스템 프롬프트
  category: string;              // 카테고리 (playground, custom 등)
  keywordIds: string[];          // 연관 키워드 ID 목록
  keywordDetails?: { [key: string]: string }; // Advanced/Expert용 키워드 세부 설정
  temperature: number;           // AI 창의성 수준 (0.0-1.0)
  maxOutputTokens: number;       // 최대 응답 토큰 수
  safetyLevel: string;           // 안전 필터링 레벨
  isCustom?: boolean;            // 사용자 생성 Role 여부
  isPinned?: boolean;            // 즐겨찾기 여부
  promptTemplate?: string;       // 프롬프트 템플릿
  responseStyle?: 'standard' | 'detailed' | 'concise'; // 응답 스타일
  personality?: 'professional' | 'friendly' | 'creative'; // 성격 유형
  createdAt?: Date;              // 생성일
  lastUsed?: Date;               // 마지막 사용일
  usageCount?: number;           // 사용 횟수
  createdMode?: Mode;            // Role이 생성된 모드
}

/**
 * 프로젝트 인터페이스
 * 관련된 채팅들을 주제별로 그룹핑하는 시스템
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  guidelines?: string;
  memory?: MemoryItem[];
  files?: ProjectFile[];
  createdAt: Date;
  lastModified: Date;
  chatCount: number;
  isPinned?: boolean;
  icon?: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  roleId: string;
  projectId?: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
  isPinned?: boolean;
  isArchived?: boolean;
  settings?: ConversationSettings;
  icon?: string;
}

export interface ConversationSettings {
  // AI 매개변수
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // 대화 관리
  contextLength?: number;
  enableRoleReminder?: boolean;
  roleReminderInterval?: number;
  enableTimelineReminder?: boolean;
  timelineFormat?: 'relative' | 'absolute' | 'smart';
  timelineSummaryStyle?: 'simple' | 'detailed' | 'contextual';
  enableConversationSummary?: boolean;
  summaryInterval?: number;
  
  // 안전 및 필터링
  safetyLevel?: string;
  contentFilter?: boolean;
  enableEmotionDetection?: boolean;
  
  // 응답 스타일
  responseStyle?: 'concise' | 'balanced' | 'detailed';
  enableCodeHighlighting?: boolean;
  enableMarkdownFormatting?: boolean;
  
  // 음성 관련
  enableTextToSpeech?: boolean;
  speechVoice?: string;
  speechSpeed?: number;
  
  // 기타
  systemReminders?: string[];
  customInstructions?: string;
}

export interface Keyword {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
  createdAt: Date;
  usageCount: number;
}

export interface ApiConfiguration {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  modelName?: string;
  endpoint?: string;
  isDefault?: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'huggingface' | 'custom';
  key: string;
  endpoint?: string; // for custom APIs
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
  modelOptions?: string[]; // available models for this API key
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKeyId: string;
  icon: string;
  description?: string;
  maxTokens?: number;
  features?: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultRole?: string;
  mode: 'standard' | 'advanced' | 'expert'; // Expert 모드 추가
  apiConfigurations: ApiConfiguration[];
  apiKeys?: APIKey[]; // 새로운 API 키 관리 시스템
  selectedAiModel?: string; // 현재 선택된 AI 모델 ID
  email?: string;
  isEmailVerified?: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    shareUsage: boolean;
  };
  security: {
    twoFactorEnabled?: boolean;
    loginNotifications?: boolean;
    apiKeyEncryption?: boolean;
  };
  speech: {
    enabled: boolean;
    autoPlay: boolean;
    voice: string;
    rate: number;
    pitch: number;
  };
  // AI 매개변수를 별도 속성으로 이동
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  safetyLevel?: string;
  
  ai: {
    model: string;
    streamResponse: boolean;
    useCache: boolean;
  };
}

export interface AppState {
  // Core data
  conversations: Conversation[];
  projects: Project[];
  roles: Role[];
  masterKeywords: Keyword[];
  
  // UI state
  activeChatId: string | null;
  selectedRoleId: string | null;
  sidebarExpanded: boolean;
  
  // Settings
  userSettings: UserSettings;
  
  // Temporary state
  isLoading: boolean;
  error: string | null;
  isGenerationStopped: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  keywordIds: string[];
  temperature: number;
  maxOutputTokens: number;
  safetyLevel: string;
  icon?: string;
  tags?: string[];
  popularity?: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  roleCount: number;
  isPopular?: boolean;
}

// Cross-Mode Guard 시스템 타입들
export type Mode = 'standard' | 'advanced' | 'expert';

export type ModeComparisonResult = 'same' | 'chatLower' | 'chatHigher';

export type Decision =
  | { type: 'proceed' }                 // 그대로 진행
  | { type: 'keepChat' }               // chatLower: 대화창 모드 유지 (다운실행)
  | { type: 'switchChat'; to: Mode }   // chatLower: 대화창 업그레이드
  | { type: 'cloneRole'; to: Mode };   // chatHigher: Role 복사·향상

export interface CrossModeGuardConfig {
  chatMode: Mode;
  roleMode: Mode;
  chatId?: string;
  roleId: string;
  roleName: string;
  lang?: 'ko' | 'en';
}