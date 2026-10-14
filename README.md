# 일조권·사선제한 계산기 — MANMIN Ver-5.0 (v5.0.6)

> 건축법 제61조(2026. 2. 27. 시행) · 건축법 시행령 제86조(2026. 10. 6. 시행본 · 제86조 최종 개정 2024. 6. 18.) 기준 | ARCHITECT KIM MANMIN

🌐 **https://manminkim-eng.github.io/Architectural-line/**  
📘 사용자 매뉴얼 : https://manminkim-eng.github.io/Architectural-line/manual/ (PDF 27쪽)

## 주요 기능

- 정북 사선 최소 이격 판정 (§86①) · 적용 제외 특례 3종 (§86②) · 사이 시설·부지 반대편 경계 (§86⑥)
- 공동주택 채광 높이 (§86③1호 — 2배 · 근린상업·준주거 4배 · 일반·중심상업 제외) · 동 간 거리 (§86③2호 가목)
- 위도·기준일·경계선 방위각별 일영 시간 · 연속 일조 (참고)
- A4 검토 계산서 인쇄 / PDF / JPG
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
├── manual/             # 사용자 매뉴얼 (index.html · PDF · images · _tools 재현 스크립트)
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

## 버전

| 버전 | 날짜 | 내용 |
|---|---|---|
| v5.0.6 | 2026-10-14 | 판정 로직 정정 — 공동주택 채광·동 간 거리 별도 판정, §86⑥ 반영, 용도지역별 채광 배수, 경계선 방향 일영·방위각, 2시간 일조 참고화(③2호 단서), 일영 시간 30분 구간 12개(최대 6 h) · 근거 표기 정정(법 제80조 · 제88조 · 시행일) · 법 제61조① 개정(2026. 11. 12. 시행) 안내 · 사용자 매뉴얼 신설(📘 매뉴얼 버튼) |
| v5.0.5 | 2026-09 | A4 표 선·고정폭 글꼴 정리, 캐시 갱신 |
| v5.0 | 2026-09 | 디자인 통일(헤더·탭 막대·요약 스트립), A4 계산서·JPG 저장 |

---
MANMIN Ver-5.0 (v5.0.6) | 건축법 제61조 · 시행령 제86조 [시행 2026. 10. 6.]
