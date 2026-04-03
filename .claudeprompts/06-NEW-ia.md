# IA 구조 (Information Architecture)
- 프로젝트명 : 마케팅 프로젝트 관리 플랫폼
- 설명 : 현재까지의 프로젝트는 **마케팅 프로젝트 관리 플랫폼** IA 중 2.2.2.4 Form Builder를 구축하기 위한 작업이었어. 전체 IA 구조를 파악하여 사이트맵과 메뉴 구조, 하이어라키를 세팅해줘.
이번 수정으로 인해 필요한 라우팅 경로 수정, 스키마 작업 등 전체 진행해주고. 메뉴 구조에 따른 UX는 유저 편의가 용이하도록 적용해주면돼.

```
root
├── 🏠 1.0 Dashboard (성과 요약 & 퀵 액션)
│   ├── ➕ [Quick Start: 신규 프로젝트 생성 가이드]
│   └── ... (통계 위젯)
│
├── 📂 2.0 Projects (핵심 워크스페이스)
│   ├── 📋 2.1 프로젝트 목록 (/projects)
│   │   └── ➕ [New Project 버튼] ──┐
│   │                               │
│   └── 🆕 2.2 Project Wizard (생성 단계) <──┘
│       ├── 🏷️ 2.2.1 Step 1: 카테고리 선정 (PR / 디지털 / 바이럴 / HCP / B2B)
│       ├── 📝 2.2.2 Step 2: 기본 정보 (제목, 기간, 담당자, 초기 예산 합계)
│       └── 👥 2.2.3 Step 3: 팀/유관부서 셋업 (담당자 배정 및 알림 설정)
│
│   └── 📑 2.3 프로젝트 상세 (/projects/[id]) <-- 생성 완료 후 진입
│       ├── 📝 2.3.1 Planning (상세 기획)
│       │   ├── 🎯 2.3.1.1 Briefing (카테고리별 맞춤형 기획 템플릿)
│       │   ├── 💰 2.3.1.2 Budgeting (항목별 상세 예산 편성)
│       │   └── 🏁 2.3.1.3 KPI Setting (정량/정성 목표 수립)
│       │
│       ├── ⚙️ 2.3.2 Execution (상세 실행)
│       │   ├── ✅ 2.3.2.1 Task & WBS (업무 체크리스트 및 일정)
│       │   ├── 🎨 2.3.2.2 Creative Assets (디자인/영상 에셋 및 버전)
│       │   ├── 🤝 2.3.2.3 Collaboration (외주사/파트너/유관부서 협업)
│       │   ├── 📝 2.3.2.4 Project Form Builder (프로젝트 전용 폼 생성)
│       │   └── 📧 2.3.2.5 Live Responses (실시간 응답 및 리드 관리)
│       │
│       ├── 📈 2.3.3 Data Stats (성과 분석)
│       └── 💡 2.3.4 Insight (회고 및 자산화)
│
├── 🎯 3.0 Engagement (통합 데이터 센터)
└── 📤 4.0 Shared Center (성과 공유 허브)
```

# 프로젝트 생성 및 상세 구조 (4-Depth)

## 1. 생성 위자드 (Creation Wizard Flow)
1. **Category Selection**: PR, 디지털 마케팅, 바이럴, HCP 마케팅, B2B 마케팅 중 택 1
2. **Basic Setup**: 프로젝트명, 기간(시작/종료), 총 예산 규모 설정
3. **Team Assign**: 프로젝트 멤버 및 협업 유관부서 지정

## 2. 상세 라우팅 구조
- `/projects`: 목록 및 생성 진입
- `/projects/new`: 생성 위자드 단계별 페이지 (Step 1, 2, 3)
- `/projects/[id]/planning`: 기획 브리프 및 상세 예산
- `/projects/[id]/execution/tasks`: 상세 업무 및 일정 관리
- `/projects/[id]/execution/assets`: 디자인/영상 등 결과물 관리
- `/projects/[id]/execution/partners`: 외부/내부 협업 관리
- `/projects/[id]/execution/forms`: 프로젝트 전용 폼/설문 빌더
- `/projects/[id]/stats`: 데이터 통계 및 분석
- `/projects/[id]/insight`: KPT 회고 및 차기 기획 연동