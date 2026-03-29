# 일조권·사선제한 계산기 — MANMIN Ver1.0

> 건축법 시행령 제86조 기준 | ARCHITECT KIM MANMIN

## 주요 기능

- 사선제한 이격거리 자동 계산 (§86조)
- 동지 기준 일영시간 분석
- A4 계산서 PDF 출력
- 모바일 미리보기
- **PWA 설치 지원** (Android / iOS / PC)

## PWA 설치

| 플랫폼 | 방법 |
|--------|------|
| Android Chrome | 주소창 하단 배너 → **지금 설치** |
| iPhone Safari | 공유 버튼 ⬆️ → **홈 화면에 추가** |
| PC Chrome/Edge | 주소창 우측 설치 아이콘 클릭 |

## 파일 구조

```
├── index.html          # 앱 본체
├── manifest.json       # PWA 매니페스트
├── sw.js               # Service Worker (Cache-First)
├── icons/              # 앱 아이콘 (16px ~ 512px)
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── icon-maskable-512x512.png
│   └── icon-{N}x{N}.png
└── .github/workflows/
    └── deploy.yml      # GitHub Pages 자동 배포
```

## GitHub Pages 배포

1. 이 저장소를 Fork 또는 새 레포에 Push
2. Settings → Pages → Source: **GitHub Actions**
3. main 브랜치 push 시 자동 배포

---
MANMIN-Ver1.0 | 건축법 시행령 §86조 (2026.02.27 개정)
