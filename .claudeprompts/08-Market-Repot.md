# "시장 분석(Market Intelligence)" 메뉴 신설

## 제작 개요
1. Project Overview
Purpose: 글로벌 피부미용의료기기 시장 트렌드를 매일 분석하고, 웹사이트 대시보드 및 리포트 형태로 제공하는 자동화 시스템 구축.
Target: 클래시스 마케팅본부 및 마케팅커뮤니케이션팀, 시장 분석가, 피부 미용 의료기기 업계 종사자.
Core Objective: AI 기반 데이터 수집 및 분석을 통해 인플루언서 동향부터 학술 정보까지 망라한 인사이트 리포트 생성.

2. Analysis Scopes & Domains
Technology Trends: 차세대 피부미용의료기기 기술, 규제 승인(FDA/CE 등) 현황, 신소재 및 하드웨어 혁신.
AI Applications: 미용의료기기 내 AI 내장(Software as a Medical Device, SaMD), 진단 보조 AI, 데이터 분석 솔루션 적용 사례.
Marketing & Campaigns: 글로벌 미용의료기기 기업들의 디지털 캠페인 전략, 브랜딩 캠페인 분석.
KOL & Influencer: 글로벌 의료 전문 인플루언서(HCP), 앰배서더 모델 섭외 현황 및 영향력 분석.
Exhibitions & Conferences: 주요 학회(RSNA, MEDICA, KIMES 등) 일정, 주요 발표 내용, 전시 부스 트렌드.
SNS Feed Trends: Instagram, threads, Facebook, LinkedIn, YouTube 기반의 의료기기 해시태그 및 피드 콘텐츠 동향.
Global Policy: 국가별 미용의료 정책 변화 및 시장 진입 장벽 관련 뉴스.

3. Technical Requirements
A. Data Pipeline (Scraping & Ingestion)
Google News API, PubMed, LinkedIn API, Instagram Graph API 연동.

주요 미용의료기기 전문지(Fierce Biotech, Lasers in Surgery and Medicine, MassDevice,Aesthetic Medical Partnership,Aesthetic Authority 등) RSS 피드 수집.

B. AI Analysis Logic (LLM Integration)
Summarization: 대량의 뉴스를 섹션별로 요약.

Insight Extraction: 단순 정보 나열이 아닌 '비즈니스 시사점' 도출.

Classification: 기술/마케팅/전시 등 카테고리 자동 분류.

C. UI/UX (Frontend Update)
Daily Dashboard: 섹션별 카드 레이아웃 형태의 동향 요약.
PDF/MD Export: 리포트를 문서 형태로 다운로드할 수 있는 기능.
Visual Elements: 트렌드 키워드 워드클라우드 및 차트 시각화.

4. Implementation Instructions for AI
AI 코딩 도구는 다음의 우선순위에 따라 코드를 작성한다.

Data Schema: 위 7개 영역을 저장할 수 있는 데이터베이스 스키마(PostgreSQL/NoSQL 등) 정의.
Backend Logic: 지정된 시간에 데이터를 수집하는 Cron Job 및 LLM 프롬프트 체인 구축.
Frontend Component: 리포트 페이지 생성. (미니멀하고 모던한 디자인 스타일 적용)

배경: #FFFFFF, 텍스트: #2C3E50
포인트 컬러: #002D74, #0084C9

Search & Filter: 날짜별, 카테고리별 아카이브 검색 기능 구현.


## 메뉴 하이어라키
대메뉴: Market Intelligence (또는 시장 분석)
소메뉴 1: Daily Report (오늘의 동향 요약)
소메뉴 2: Tech & AI Watch (기술 및 AI 동향)
소메뉴 3: Marketing & Influencer (캠페인 및 인플루언서)
소메뉴 4: Event & Congress (전시/학회 일정)