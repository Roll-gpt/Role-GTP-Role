# Role GPT 배포 가이드

## 🚀 배포 준비

### 1. 환경 설정
```bash
# 프로덕션 환경 변수 설정
cp .env.local.example .env.production

# 필수 환경 변수 설정
API_KEY=your_production_google_ai_api_key
USER_PLAN=premium
NEXT_PUBLIC_APP_NAME=Role GPT
NEXT_PUBLIC_APP_VERSION=1.0.0

# 프로덕션 최적화 설정
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_STATSIG_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### 2. 빌드 최적화
```bash
# 의존성 설치
npm ci

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start
```

## 📦 배포 플랫폼별 가이드

### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod

# 환경 변수 설정
vercel env add API_KEY production
vercel env add USER_PLAN production
```

### Netlify
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 빌드 및 배포
netlify deploy --prod --dir=.next
```

### AWS Amplify
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Docker 배포
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 빌드
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 🔒 보안 설정

### API 키 보안
```bash
# 환경 변수로만 관리
export API_KEY="your_secure_api_key"

# 클라이언트 사이드 노출 방지
# NEXT_PUBLIC_ 접두사 사용 금지 (API 키의 경우)
```

### HTTPS 강제
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

### Content Security Policy
```javascript
// next.config.js
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://generativelanguage.googleapis.com;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  }
};
```

## 📊 성능 최적화

### 번들 분석
```bash
# Bundle Analyzer 설치
npm install --save-dev @next/bundle-analyzer

# 번들 분석 실행
ANALYZE=true npm run build
```

### 이미지 최적화
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};
```

### 캐싱 전략
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

## 🔍 모니터링 설정

### 에러 트래킹 (Sentry)
```bash
# Sentry 설치
npm install @sentry/nextjs

# sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 성능 모니터링
```javascript
// lib/analytics.js
export const trackEvent = (eventName, properties) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 또는 다른 분석 도구
    gtag('event', eventName, properties);
  }
};
```

### Health Check 엔드포인트
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION
  });
}
```

## 🚨 배포 체크리스트

### 배포 전 확인사항
- [ ] 환경 변수 설정 완료
- [ ] API 키 보안 확인
- [ ] 빌드 에러 없음
- [ ] 테스트 통과
- [ ] 번들 크기 최적화
- [ ] 성능 메트릭 확인
- [ ] 보안 헤더 설정
- [ ] 에러 트래킹 설정

### 배포 후 확인사항
- [ ] 사이트 정상 로딩
- [ ] API 연결 확인
- [ ] 모바일 반응형 확인
- [ ] 크로스 브라우저 테스트
- [ ] 성능 스코어 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집

## 🔄 CI/CD 파이프라인

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          API_KEY: ${{ secrets.API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 스케일링 고려사항

### 성능 최적화
- **CDN 사용**: 정적 자원 전역 캐싱
- **Database 최적화**: 채팅 데이터 압축
- **API 레이트 리미팅**: 남용 방지
- **로드 밸런싱**: 트래픽 분산

### 인프라 확장
- **마이크로서비스**: 기능별 서비스 분리
- **큐 시스템**: 비동기 작업 처리
- **캐시 레이어**: Redis 등 활용
- **모니터링**: 실시간 성능 추적

이 가이드를 따르면 Role GPT를 안전하고 효율적으로 프로덕션 환경에 배포할 수 있습니다.