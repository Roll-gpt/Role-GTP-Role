# Role GPT 컴포넌트 가이드

## 📋 컴포넌트 구조 개요

Role GPT는 모듈화된 React 컴포넌트 아키텍처를 사용합니다.

```
📁 components/
├── 🎨 ui/                    # Shadcn UI 기본 컴포넌트
├── 📱 layouts/               # 레이아웃 컴포넌트
├── 💬 chat/                  # 채팅 관련 컴포넌트
├── 🎭 modals/                # 모달 컴포넌트들
├── 🔧 common/                # 공통 컴포넌트
└── 📂 figma/                 # Figma 관련 컴포넌트
```

## 🏗 핵심 컴포넌트

### 1. App.tsx
**역할**: 메인 애플리케이션 컨테이너
**주요 기능**:
- 전역 상태 관리 (AppProvider)
- 라우팅 및 모달 시스템
- 모바일/데스크톱 분기 처리
- 에러 경계 (ErrorBoundary)

```typescript
// 사용 예시
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
```

### 2. ChatSidebar.tsx
**역할**: 메인 네비게이션 사이드바
**주요 기능**:
- 채팅 내역 관리
- 프로젝트 그룹핑
- Role 선택 캐로셀
- 통합 검색

**Props**:
```typescript
interface ChatSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onRoleSelect: (role: Role) => void;
  chatHistory: Conversation[];
  projects: Project[];
  currentChatId: string | null;
  isMobile: boolean;
}
```

### 3. ChatMain.tsx
**역할**: 메인 채팅 영역
**주요 기능**:
- 메시지 렌더링
- 스크롤 관리
- 메시지 액션 (복사, 재생성 등)
- 로딩 상태 표시

### 4. GrokStyleInput.tsx
**역할**: 채팅 입력 인터페이스
**주요 기능**:
- 멀티라인 텍스트 입력
- 파일 첨부
- 음성 입력
- 설정 접근

## 🎨 UI 컴포넌트 (Shadcn)

### Button 컴포넌트
```typescript
// 기본 사용법
<Button variant="default" size="md">
  클릭하세요
</Button>

// 변형들
<Button variant="destructive">삭제</Button>
<Button variant="outline">외곽선</Button>
<Button variant="ghost">투명</Button>

// 크기
<Button size="sm">작게</Button>
<Button size="lg">크게</Button>
```

### Card 컴포넌트
```typescript
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

### Dialog 컴포넌트
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>모달 열기</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
    </DialogHeader>
    내용
  </DialogContent>
</Dialog>
```

## 📱 레이아웃 컴포넌트

### MobileLayout.tsx
**역할**: 모바일 최적화 레이아웃
**특징**:
- 터치 친화적 UI
- 세로 화면 최적화
- 스와이프 네비게이션

### DesktopLayout.tsx
**역할**: 데스크톱 레이아웃
**특징**:
- 사이드바 기반
- 키보드 단축키
- 멀티 패널 지원

## 🎭 모달 시스템

### AppModals.tsx
**역할**: 모든 모달을 중앙 관리
**포함 모달들**:
- Role 갤러리 모달
- 설정 모달
- 프로젝트 관리 모달
- 아이콘 선택 모달

### 모달 사용 패턴
```typescript
// 모달 상태 관리
const [settingsOpen, setSettingsOpen] = useState(false);

// 모달 컴포넌트
<SettingsModal
  isOpen={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  userSettings={userSettings}
  onUpdateSettings={handleSettingsUpdate}
/>
```

## 🔧 공통 컴포넌트

### IconRenderer.tsx
**역할**: 동적 아이콘 렌더링
```typescript
<IconRenderer 
  iconName="MessageSquare" 
  className="w-4 h-4" 
/>
```

### ErrorBoundary.tsx
**역할**: 컴포넌트 에러 처리
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 🎨 스타일링 가이드

### Tailwind 클래스 패턴
```typescript
// 일관된 간격
"p-4"        // 16px 패딩
"gap-3"      // 12px 간격
"space-y-2"  // 8px 세로 간격

// 색상 시스템
"bg-background"      // 배경색
"text-foreground"    // 기본 텍스트
"text-muted-foreground" // 보조 텍스트
"border-border"      // 테두리

// 반응형
"md:flex"           // 768px 이상에서 flex
"lg:w-1/2"          // 1024px 이상에서 50% 너비
```

### CSS Variables 활용
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #007acc;
  --radius: 0.5rem;
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
}
```

## 🔄 상태 관리 패턴

### Context 사용
```typescript
// Context 가져오기
const { state, updateSettings } = useApp();

// 상태 업데이트
updateSettings({
  theme: 'dark',
  language: 'ko'
});
```

### 커스텀 훅 활용
```typescript
// useAppHandlers 사용
const {
  handleSendMessage,
  handleRoleSelect,
  handleNewChat
} = useAppHandlers();
```

## 📊 성능 최적화

### React.memo 사용
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 복잡한 렌더링 */}</div>;
});
```

### useCallback 활용
```typescript
const handleClick = useCallback((id: string) => {
  // 핸들러 로직
}, [dependencies]);
```

### useMemo 사용
```typescript
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

## 🧪 테스트 패턴

### 컴포넌트 테스트
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

test('버튼이 클릭 가능해야 함', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>클릭</Button>);
  
  const button = screen.getByRole('button', { name: '클릭' });
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalled();
});
```

## 📝 개발 가이드라인

### 1. 컴포넌트 작성 규칙
- **단일 책임 원칙**: 하나의 컴포넌트는 하나의 기능
- **Props 인터페이스**: TypeScript 인터페이스로 Props 정의
- **기본값 설정**: defaultProps 또는 기본 매개변수 사용
- **에러 처리**: Error Boundary 또는 try-catch 사용

### 2. 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `ChatSidebar.tsx`)
- **훅**: camelCase with "use" prefix (예: `useAppHandlers.ts`)
- **유틸리티**: camelCase (예: `formatDate.ts`)
- **타입**: PascalCase (예: `UserSettings`)

### 3. 폴더 구조 규칙
```
components/
├── ui/           # 재사용 가능한 기본 컴포넌트
├── layout/       # 레이아웃 관련 컴포넌트
├── feature/      # 기능별 컴포넌트 그룹
└── common/       # 공통 컴포넌트
```

### 4. Import 순서
```typescript
// 1. React 관련
import React, { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { motion } from 'motion/react';

// 3. 내부 컴포넌트
import { Button } from './ui/button';

// 4. 내부 훅/유틸
import { useApp } from '../context/AppContext';

// 5. 타입
import type { UserSettings } from '../types';
```

## 🚀 새 컴포넌트 추가하기

### 1. 컴포넌트 파일 생성
```typescript
// components/NewComponent.tsx
import React from 'react';
import { Button } from './ui/button';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Button onClick={onAction}>액션 실행</Button>
    </div>
  );
};
```

### 2. 부모 컴포넌트에서 사용
```typescript
import { NewComponent } from './components/NewComponent';

function ParentComponent() {
  const handleAction = () => {
    console.log('액션 실행됨');
  };

  return (
    <NewComponent 
      title="새 컴포넌트" 
      onAction={handleAction} 
    />
  );
}
```

이 가이드를 따르면 Role GPT의 컴포넌트 시스템을 효과적으로 이해하고 확장할 수 있습니다.