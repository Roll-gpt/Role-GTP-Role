# Role GPT 기술 가이드

## 📋 상세 기술 스펙

### React & Next.js 버전
- **React**: 18.2.0 (Concurrent Features, Automatic Batching)
- **Next.js**: 14.0.0 (App Router, Server Components)
- **TypeScript**: 5.0.0 (최신 타입 기능)

### 주요 라이브러리
```json
{
  "@google/genai": "^2.0.0",        // Google Gemini AI 통합
  "lucide-react": "^0.400.0",       // 아이콘 라이브러리
  "sonner": "^2.0.3",               // 토스트 알림
  "tailwindcss": "^4.0.0-beta.1",   // 최신 Tailwind CSS
  "react-hook-form": "7.55.0",      // 폼 상태 관리
  "motion": "latest"                 // 애니메이션 (Framer Motion 후속)
}
```

## 🔌 API 연결 방식

### 1. Google Gemini (기본)
```typescript
// src/providers/gemini.ts
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});
```

### 2. Multi-Provider 지원
- **OpenAI**: GPT-4/3.5 Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro/Flash/Ultra
- **OpenRouter**: 오픈소스 모델 허브
- **Groq**: 고속 추론 엔진
- **xAI**: Grok 모델

### 3. API 호출 패턴
```typescript
// 스트리밍 응답 처리
const handleSendMessage = async (message: string) => {
  const stream = await model.generateContentStream(message);
  
  for await (const chunk of stream) {
    const chunkText = chunk.text();
    // 실시간 UI 업데이트
    updateMessage(chunkText);
  }
};
```

## 🗂 상태 관리 아키텍처

### React Context 패턴
```typescript
// src/context/AppContext.tsx
interface AppState {
  // 채팅 관련
  conversations: Conversation[];
  activeChatId: string | null;
  isLoading: boolean;
  
  // Role 관련
  roles: Role[];
  selectedRoleId: string | null;
  customRoles: CustomRole[];
  
  // 프로젝트 관련
  projects: Project[];
  
  // UI 상태
  sidebarExpanded: boolean;
  userSettings: UserSettings;
  
  // 에러 처리
  error: string | null;
}
```

### Custom Hooks 구조
```typescript
// src/hooks/useAppHandlers.ts
export const useAppHandlers = () => {
  const { state, dispatch } = useApp();
  
  const handleSendMessage = useCallback(async (message: string) => {
    // 메시지 전송 로직
  }, [state]);
  
  const handleRoleSelect = useCallback((roleId: string) => {
    // Role 선택 로직
  }, [state]);
  
  return {
    handleSendMessage,
    handleRoleSelect,
    // ... 기타 핸들러들
  };
};
```

## 🎨 스타일링 시스템

### Tailwind CSS V4 설정
```css
/* styles/globals.css */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* CSS Variables 기반 테마 시스템 */
}
```

### 컴포넌트 스타일 패턴
```typescript
// 일관된 스타일링 접근
const Button = ({ variant = "default", size = "md", ...props }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        },
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4": size === "md",
          "h-12 px-6": size === "lg",
        }
      )}
      {...props}
    />
  );
};
```

## 📱 반응형 디자인 전략

### 브레이크포인트
```css
/* Mobile First 접근 */
.container {
  @apply w-full;
  
  @media (min-width: 768px) {
    @apply max-w-screen-md;
  }
  
  @media (min-width: 1024px) {
    @apply max-w-screen-lg;
  }
}
```

### 모바일 감지 Hook
```typescript
// components/ui/use-mobile.ts
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};
```

## 🔒 에러 처리 시스템

### 개발 환경 유틸리티
```typescript
// src/utils/devUtils.ts
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  errorMessage?: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (isDevelopment()) {
      console.warn(`API 호출 실패: ${errorMessage}`, error);
    }
    return fallbackValue;
  }
};
```

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }
  
  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

## 🗃 데이터 구조 및 타입

### 핵심 타입 정의
```typescript
// src/types.ts
export interface Conversation {
  id: string;
  title: string;
  roleId: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
  isPinned?: boolean;
  projectId?: string;
  icon?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  category: RoleCategory;
  systemPrompt: string;
  examples: string[];
  icon?: string;
  isCustom?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  lastModified: Date;
  chatCount: number;
  isPinned?: boolean;
  icon?: string;
}
```

## 🔄 데이터 플로우

### 메시지 전송 플로우
```
1. 사용자 입력 → GrokStyleInput
2. 입력 검증 → useAppHandlers
3. AI API 호출 → Providers
4. 스트리밍 응답 → ChatMain
5. 상태 업데이트 → AppContext
6. 로컬 저장 → localStorage
```

### Role 선택 플로우
```
1. Role 선택 → RoleGallery/Carousel
2. Role 데이터 로드 → AppContext
3. 새 채팅 생성 → useAppHandlers
4. 시스템 프롬프트 적용 → AI Provider
5. UI 상태 업데이트 → Components
```

## 🛠 개발자 도구 및 디버깅

### 개발 환경 설정
```typescript
// 개발 모드 감지
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DEV_MODE === 'true';
};

// 개발 전용 로깅
export const devLog = (...args: any[]) => {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
};
```

### 목업 데이터 생성
```typescript
// 개발용 목업 채팅 생성
const generateMockChat = () => {
  const mockMessages = [
    {
      id: 1,
      text: "안녕하세요! Role GPT를 사용해보세요.",
      sender: 'ai' as const,
      timestamp: new Date()
    }
  ];
  
  // 목업 채팅 추가
  addConversation({
    id: 'mock_chat_demo',
    title: "Role GPT 데모",
    roleId: 'buddy',
    messages: mockMessages,
    createdAt: new Date(),
    lastMessageAt: new Date()
  });
};
```

## 🚀 성능 최적화

### React 최적화
- **React.memo**: 컴포넌트 리렌더링 최적화
- **useMemo/useCallback**: 연산 결과 캐싱
- **Lazy Loading**: 컴포넌트 지연 로딩

### Next.js 최적화
- **Static Generation**: 정적 페이지 생성
- **Image Optimization**: 자동 이미지 최적화
- **Bundle Analysis**: 번들 크기 분석

### 스트리밍 최적화
```typescript
// 청크 단위 응답 처리
const processStreamChunk = (chunk: string) => {
  // 배치 업데이트로 리렌더링 최소화
  startTransition(() => {
    updateMessage(prevMessage => prevMessage + chunk);
  });
};
```

## 🔐 보안 고려사항

### API 키 보안
- 환경 변수를 통한 민감 정보 관리
- 클라이언트 사이드에서 API 키 노출 방지
- 서버 사이드 API 프록시 구현

### 사용자 데이터 보호
- 로컬 스토리지 데이터 암호화
- XSS 공격 방어
- CSRF 토큰 사용

## 📊 모니터링 및 분석

### 에러 트래킹
```typescript
// 프로덕션 에러 로깅
const logError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'production') {
    // 외부 에러 트래킹 서비스로 전송
    // (Sentry, LogRocket 등)
  }
};
```

### 성능 메트릭
- **Core Web Vitals**: LCP, FID, CLS 측정
- **API 응답 시간**: 평균 응답 속도 추적
- **사용자 행동**: 기능 사용률 분석

이 기술 가이드는 Role GPT의 전체 아키텍처와 구현 세부사항을 다룹니다. 추가 질문이나 특정 부분에 대한 자세한 설명이 필요하시면 언제든 말씀해주세요!