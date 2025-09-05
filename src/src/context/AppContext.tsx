/**
 * Role GPT 전역 상태 관리 - React Context
 * 
 * 애플리케이션의 모든 상태를 중앙에서 관리하는 Context Provider
 * - 채팅 대화 내역 관리 (conversations)
 * - Role 템플릿 시스템 (roles)
 * - 프로젝트 관리 (projects)
 * - 사용자 설정 (userSettings)
 * - UI 상태 (사이드바, 로딩 등)
 * 
 * @pattern Context + useReducer 패턴으로 예측 가능한 상태 관리
 * @storage localStorage 기반 데이터 영속성
 * @performance Helper 함수들로 불필요한 리렌더링 방지
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Conversation, Project, Role, Message, UserSettings, APIKey } from '../types';
import { DEFAULT_ROLES, DEFAULT_KEYWORDS } from '../state';
import { STORAGE_KEYS } from '../constants';
import { speechManager } from '../providers/speech';

/**
 * Redux 스타일 액션 타입 정의
 * 모든 상태 변경은 이 액션들을 통해서만 가능
 */
type AppAction =
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'SET_SELECTED_ROLE'; payload: string | null }
  | { type: 'SET_SIDEBAR_EXPANDED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GENERATION_STOPPED'; payload: boolean }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_ROLE'; payload: Role }
  | { type: 'UPDATE_ROLE'; payload: { id: string; updates: Partial<Role> } }
  | { type: 'DELETE_ROLE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_API_KEY'; payload: APIKey }
  | { type: 'UPDATE_API_KEY'; payload: { id: string; updates: Partial<APIKey> } }
  | { type: 'DELETE_API_KEY'; payload: string }
  | { type: 'SET_SELECTED_AI_MODEL'; payload: string };

/**
 * 초기 상태 생성 함수
 * 앱 시작 시 기본값들을 설정
 */
const getInitialState = (): AppState => ({
  conversations: [],
  projects: [],
  roles: DEFAULT_ROLES,
  masterKeywords: DEFAULT_KEYWORDS,
  activeChatId: null,
  selectedRoleId: null,
  sidebarExpanded: false,
  userSettings: {
    theme: 'dark',
    language: 'ko', // 기본값, 실제로는 i18n에서 브라우저 언어 감지
    mode: 'standard', // 기본값을 standard로 설정
    apiConfigurations: [],
    apiKeys: [],
    selectedAiModel: 'default',
    email: '',
    isEmailVerified: false,
    notifications: {
      enabled: true,
      sound: false,
      desktop: true
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      shareUsage: false
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      apiKeyEncryption: true
    },
    speech: {
      enabled: true,
      autoPlay: false,
      voice: 'default',
      rate: 1.0,
      pitch: 1.0
    },
    ai: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      streamResponse: true,
      useCache: true
    }
  },
  isLoading: false,
  error: null,
  isGenerationStopped: false
});

/**
 * 메인 리듀서 함수
 * 모든 상태 업데이트 로직을 중앙에서 관리
 * 순수 함수로 작성되어 예측 가능한 상태 변경 보장
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };
    
    case 'SET_SELECTED_ROLE':
      return { ...state, selectedRoleId: action.payload };
    
    case 'SET_SIDEBAR_EXPANDED':
      return { ...state, sidebarExpanded: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_GENERATION_STOPPED':
      return { ...state, isGenerationStopped: action.payload };
    
    case 'ADD_CONVERSATION':
      return { 
        ...state, 
        conversations: [action.payload, ...state.conversations] 
      };
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        )
      };
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeChatId: state.activeChatId === action.payload ? null : state.activeChatId
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects]
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(proj =>
          proj.id === action.payload.id
            ? { ...proj, ...action.payload.updates }
            : proj
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(proj => proj.id !== action.payload)
      };
    
    case 'ADD_ROLE':
      return {
        ...state,
        roles: [...state.roles, action.payload]
      };
    
    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: state.roles.map(role =>
          role.id === action.payload.id
            ? { ...role, ...action.payload.updates }
            : role
        )
      };
    
    case 'DELETE_ROLE':
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      console.log('🔧 설정 업데이트:', action.payload);
      return {
        ...state,
        userSettings: { ...state.userSettings, ...action.payload }
      };
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    case 'ADD_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: [...(state.userSettings.apiKeys || []), action.payload]
        }
      };
    
    case 'UPDATE_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: (state.userSettings.apiKeys || []).map(key =>
            key.id === action.payload.id
              ? { ...key, ...action.payload.updates }
              : key
          )
        }
      };
    
    case 'DELETE_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: (state.userSettings.apiKeys || []).filter(key => key.id !== action.payload)
        }
      };
    
    case 'SET_SELECTED_AI_MODEL':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          selectedAiModel: action.payload
        }
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setActiveChat: (chatId: string | null) => void;
  setSelectedRole: (roleId: string | null) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGenerationStopped: (stopped: boolean) => void;
  stopGeneration: () => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  // API Key management
  addApiKey: (apiKey: APIKey) => void;
  updateApiKey: (id: string, updates: Partial<APIKey>) => void;
  deleteApiKey: (id: string) => void;
  setSelectedAiModel: (modelId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(STORAGE_KEYS.conversations);
      const savedProjects = localStorage.getItem(STORAGE_KEYS.projects);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.userSettings);
      // 마지막 활성 채팅은 자동으로 불러오지 않음 - 새 세션은 빈 상태로 시작

      const stateUpdates: Partial<AppState> = {};

      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        // Restore Date objects
        conversations.forEach((conv: any) => {
          conv.createdAt = new Date(conv.createdAt);
          conv.lastMessageAt = new Date(conv.lastMessageAt);
          if (conv.messages) {
            conv.messages.forEach((msg: any) => {
              msg.timestamp = new Date(msg.timestamp);
            });
          }
        });
        stateUpdates.conversations = conversations;
      }

      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        projects.forEach((proj: any) => {
          proj.createdAt = new Date(proj.createdAt);
          proj.lastModified = new Date(proj.lastModified);
        });
        stateUpdates.projects = projects;
      }

      if (savedSettings) {
        stateUpdates.userSettings = { ...state.userSettings, ...JSON.parse(savedSettings) };
      }

      // 새 세션은 항상 빈 상태로 시작
      stateUpdates.activeChatId = null;
      stateUpdates.selectedRoleId = null;

      if (Object.keys(stateUpdates).length > 0) {
        dispatch({ type: 'LOAD_STATE', payload: stateUpdates });
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(state.conversations));
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
      localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(state.userSettings));
      if (state.activeChatId) {
        localStorage.setItem(STORAGE_KEYS.lastActiveChat, state.activeChatId);
      }
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }, [state.conversations, state.projects, state.userSettings, state.activeChatId]);

  // Helper functions
  const setActiveChat = (chatId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
  };

  const setSelectedRole = (roleId: string | null) => {
    dispatch({ type: 'SET_SELECTED_ROLE', payload: roleId });
  };

  const setSidebarExpanded = (expanded: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: expanded });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setGenerationStopped = (stopped: boolean) => {
    dispatch({ type: 'SET_GENERATION_STOPPED', payload: stopped });
  };

  const stopGeneration = () => {
    console.log('🛑 AI 응답 중지 요청');
    setGenerationStopped(true);
    setLoading(false);
    setError(null);
  };

  const addConversation = (conversation: Conversation) => {
    dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
  };

  const deleteConversation = (id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  };

  const addProject = (project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  };

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const addRole = (role: Role) => {
    dispatch({ type: 'ADD_ROLE', payload: role });
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    dispatch({ type: 'UPDATE_ROLE', payload: { id, updates } });
  };

  const deleteRole = (id: string) => {
    dispatch({ type: 'DELETE_ROLE', payload: id });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    console.log('📝 설정 변경:', settings);
    
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    
    // 언어가 변경되면 음성 인식 언어도 업데이트
    if (settings.language) {
      // 언어 코드 매핑
      const languageCodes: { [key: string]: string } = {
        en: 'en-US',
        ko: 'ko-KR', 
        ja: 'ja-JP',
        es: 'es-ES',
        pt: 'pt-BR',
        hi: 'hi-IN'
      };
      
      const languageCode = languageCodes[settings.language] || 'ko-KR';
      speechManager.setLanguageCode(languageCode);
    }
  };

  // API Key management functions
  const addApiKey = (apiKey: APIKey) => {
    dispatch({ type: 'ADD_API_KEY', payload: apiKey });
  };

  const updateApiKey = (id: string, updates: Partial<APIKey>) => {
    dispatch({ type: 'UPDATE_API_KEY', payload: { id, updates } });
  };

  const deleteApiKey = (id: string) => {
    dispatch({ type: 'DELETE_API_KEY', payload: id });
  };

  const setSelectedAiModel = (modelId: string) => {
    dispatch({ type: 'SET_SELECTED_AI_MODEL', payload: modelId });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setActiveChat,
    setSelectedRole,
    setSidebarExpanded,
    setLoading,
    setError,
    setGenerationStopped,
    stopGeneration,
    addConversation,
    updateConversation,
    deleteConversation,
    addProject,
    updateProject,
    deleteProject,
    addRole,
    updateRole,
    deleteRole,
    updateSettings,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    setSelectedAiModel,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};