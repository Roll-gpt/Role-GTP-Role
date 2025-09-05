# Role GPT - Google AI Studio 테스트 빌드

이 폴더는 Role GPT의 핵심 컴포넌트들을 Google AI Studio에서 테스트할 수 있도록 간소화한 버전입니다.

## 📁 폴더 구조

```
test-build/
├── index.html              # 메인 HTML 엔트리 포인트
├── TestApp.js              # 테스트용 메인 앱 컴포넌트
├── components/
│   ├── ui/
│   │   ├── Button.js       # 기본 버튼 컴포넌트
│   │   ├── Card.js         # 카드 컴포넌트들
│   │   └── Badge.js        # 배지 컴포넌트
│   ├── WelcomeCard.js      # 랜덤 Role 추천 카드
│   └── ConversationSettingsModal.js  # 대화 설정 모달
└── README.md               # 이 파일
```

## 🚀 사용 방법

### Google AI Studio에서 사용하기:

1. **전체 `/test-build` 폴더를 복사**하여 Google AI Studio 프로젝트로 가져오기
2. **`index.html`을 엔트리 포인트**로 설정
3. 브라우저에서 실행하여 테스트

### 로컬에서 테스트하기:

```bash
# 간단한 HTTP 서버 실행
python -m http.server 8000
# 또는
npx serve .

# 브라우저에서 http://localhost:8000 접속
```

## 🎯 테스트할 수 있는 기능들

### 1. **WelcomeCard 컴포넌트**
- 랜덤 Role 추천 시스템
- 모드별 기능 차이 (Standard/Advanced/Expert)
- Role 내보내기 기능
- 대화 시작 기능

### 2. **ConversationSettingsModal**
- 모드별 설정 옵션 차이
- 대화 리마인더 설정
- Role 리마인더 설정
- 업그레이드 안내 시스템

### 3. **모드 시스템**
- Standard: 기본 기능만
- Advanced: 제한된 고급 기능
- Expert: 모든 기능 사용 가능

## 🔧 Google AI Studio 연결 준비사항

### 필요한 설정:
1. **React 18 CDN** (이미 포함됨)
2. **Tailwind CSS CDN** (이미 포함됨)
3. **Babel Standalone** (JSX 변환용, 이미 포함됨)

### 연결 테스트 방법:
1. 각 컴포넌트가 정상 로드되는지 확인
2. 모드 전환이 제대로 작동하는지 확인
3. 콘솔에서 에러가 없는지 확인

## 📝 주요 변경사항

### 절대 경로 → 상대 경로 변경:
- `@/components/...` → `./components/...`
- `import { ... } from '...'` → `window.ComponentName = ...`

### 종속성 간소화:
- 복잡한 상태 관리 → 간단한 useState
- Next.js 특화 기능 제거
- 핵심 UI 컴포넌트만 포함

### CDN 기반 라이브러리:
- React 18 (Development 버전)
- Tailwind CSS (CDN 버전)
- Babel Standalone (JSX 변환)

## 🎨 스타일링

기본 다크 테마가 적용되어 있으며, Tailwind CSS 클래스를 사용합니다:
- `bg-background`, `text-foreground` (기본 배경/텍스트)
- `bg-card`, `text-card-foreground` (카드 스타일)
- `bg-primary`, `text-primary-foreground` (주요 버튼)
- `bg-muted`, `text-muted-foreground` (보조 요소)

## 🔍 디버깅

브라우저 개발자 도구에서 확인할 수 있는 것들:
- 컴포넌트 로딩 상태
- 상태 변경 로그
- API 호출 시뮬레이션 결과

## 📞 Google AI Studio 연결 시 체크리스트

- [ ] 모든 파일이 정상 로드되는가?
- [ ] React 컴포넌트가 렌더링되는가?
- [ ] 모드 전환이 작동하는가?
- [ ] WelcomeCard 랜덤 Role이 표시되는가?
- [ ] 설정 모달이 열리는가?
- [ ] 콘솔 에러가 없는가?

이 테스트 빌드로 Google AI Studio와의 연결을 확인한 후, 필요에 따라 추가 컴포넌트를 점진적으로 포팅할 수 있습니다.