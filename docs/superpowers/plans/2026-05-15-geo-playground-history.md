# GEO Playground History Archiving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GEO Playground 시뮬레이션 결과를 localStorage에 아카이빙하고, 상단 탭 UI로 과거 내역을 자유롭게 탐색·삭제할 수 있게 한다.

**Architecture:** `GeoPlayground` 컴포넌트에 `history: HistoryEntry[]` + `activeIdx: number | null` 상태를 추가한다. 실행 결과는 history 배열 앞에 삽입되고 localStorage(`geo_playground_history`)에 동기화된다. 입력 폼과 결과 영역은 `activeIdx === null` 여부로 분기 렌더링하며, 히스토리 탭 클릭 시 저장된 결과를 즉시 표시한다(API 재호출 없음).

**Tech Stack:** React `useState`, `useEffect`, `localStorage`, TypeScript — 신규 패키지 없음

---

## File Structure

| 파일 | 변경 유형 | 역할 |
|---|---|---|
| `src/app/geo/_components/GeoClient.tsx` | Modify | `GeoPlayground` 함수 전체 수정 — 히스토리 상태, 탭 UI, 저장/삭제 로직 추가 |

---

### Task 1: HistoryEntry 타입 및 localStorage 헬퍼 추가

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` (GeoPlayground 함수 바로 위)

- [ ] **Step 1: `HistoryEntry` 타입과 localStorage 상수·헬퍼를 GeoPlayground 함수 바로 위에 추가한다**

`GeoPlayground` 함수 위의 `// ─── GEO Playground` 구분선 바로 아래, 함수 선언 앞에 다음을 삽입:

```typescript
// ─── GEO Playground ──────────────────────────────────────────────────────────

const HISTORY_KEY  = 'geo_playground_history'
const HISTORY_MAX  = 20

type HistoryEntry = PlaygroundResult & { id: string }

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)))
}
```

- [ ] **Step 2: 빌드 오류 없는지 확인**

```bash
cd D:\workspace\form-saas-platform && npx tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음 또는 기존 에러만 출력 (새 에러 없어야 함)

- [ ] **Step 3: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): HistoryEntry 타입·localStorage 헬퍼 추가"
```

---

### Task 2: GeoPlayground 상태 확장

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — `GeoPlayground` 함수 내 useState 블록

- [ ] **Step 1: 기존 상태 선언 블록을 히스토리 상태 포함으로 교체한다**

현재 코드 (`GeoPlayground` 함수 최상단):
```typescript
function GeoPlayground() {
  const [query, setQuery] = useState('')
  const [perspective, setPerspective] = useState('general')
  const [result, setResult] = useState<PlaygroundResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
```

교체 후:
```typescript
function GeoPlayground() {
  const [history, setHistory]       = useState<HistoryEntry[]>([])
  const [activeIdx, setActiveIdx]   = useState<number | null>(null)
  const [query, setQuery]           = useState('')
  const [perspective, setPerspective] = useState('general')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])
```

- [ ] **Step 2: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 새 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): Playground 히스토리 상태·초기 로드 추가"
```

---

### Task 3: runPlayground 함수 — 결과를 history에 추가

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — `runPlayground` 함수

- [ ] **Step 1: `runPlayground` 함수를 아래 코드로 교체한다**

현재 코드:
```typescript
  async function runPlayground() {
    if (!query.trim() || loading) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/geo/playground', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), perspective }),
      })
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error ?? `HTTP ${res.status}`) }
      setResult((await res.json()) as PlaygroundResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 실패')
    } finally { setLoading(false) }
  }
```

교체 후:
```typescript
  async function runPlayground() {
    if (!query.trim() || loading) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/geo/playground', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), perspective }),
      })
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error ?? `HTTP ${res.status}`) }
      const data = (await res.json()) as PlaygroundResult
      const entry: HistoryEntry = { ...data, id: crypto.randomUUID() }
      const updated = [entry, ...history].slice(0, HISTORY_MAX)
      setHistory(updated)
      saveHistory(updated)
      setActiveIdx(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 실패')
    } finally { setLoading(false) }
  }
```

- [ ] **Step 2: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): 시뮬레이션 결과 history 추가 및 localStorage 동기화"
```

---

### Task 4: 탭 삭제·전체 초기화 핸들러 추가

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — `runPlayground` 함수 바로 아래

- [ ] **Step 1: `runPlayground` 함수 다음 줄에 두 핸들러를 추가한다**

```typescript
  function deleteEntry(idx: number, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = history.filter((_, i) => i !== idx)
    setHistory(updated)
    saveHistory(updated)
    if (activeIdx === null) return
    if (activeIdx === idx) {
      setActiveIdx(updated.length === 0 ? null : Math.min(idx, updated.length - 1))
    } else if (activeIdx > idx) {
      setActiveIdx(activeIdx - 1)
    }
  }

  function clearAll() {
    setHistory([])
    saveHistory([])
    setActiveIdx(null)
  }
```

- [ ] **Step 2: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): 히스토리 항목 삭제·전체 초기화 핸들러 추가"
```

---

### Task 5: 상단 탭 UI 렌더링

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — `return` 블록 최상단

- [ ] **Step 1: 현재 return 블록의 여는 `<div className="space-y-6">` 바로 다음에 탭 행을 삽입한다**

현재:
```tsx
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
```

교체 후:
```tsx
  const activeEntry = activeIdx !== null ? history[activeIdx] : null

  return (
    <div className="space-y-6">
      {/* 히스토리 탭 행 */}
      <div className="flex items-center gap-0 border-b border-slate-200 overflow-x-auto">
        {/* 새 시뮬레이션 탭 */}
        <button
          onClick={() => setActiveIdx(null)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
            activeIdx === null
              ? 'text-slate-900 border-slate-900'
              : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-base leading-none">+</span>
          새 시뮬레이션
        </button>

        {/* 히스토리 탭 목록 */}
        {history.map((entry, i) => (
          <button
            key={entry.id}
            onClick={() => setActiveIdx(i)}
            className={`group flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
              activeIdx === i
                ? 'text-slate-900 border-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="max-w-[140px] truncate">
              {entry.query.length > 20 ? entry.query.slice(0, 20) + '…' : entry.query}
            </span>
            <span
              onClick={(e) => deleteEntry(i, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 leading-none text-base"
              role="button"
              aria-label={`${entry.query} 삭제`}
            >
              ×
            </span>
          </button>
        ))}

        {/* 전체 초기화 — 히스토리가 있을 때만 표시 */}
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto shrink-0 px-3 py-2.5 text-xs text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
```

- [ ] **Step 2: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): 시뮬레이션 히스토리 상단 탭 UI 추가"
```

---

### Task 6: 본문 영역 분기 렌더링

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — `result &&` 조건 렌더링 블록

- [ ] **Step 1: 기존 `{result && (...)}` 블록을 `activeEntry` 기반 분기로 교체한다**

현재 코드 (1176번째 줄 부근):
```tsx
      {result && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">실제 API 응답</span> — ChatGPT(GPT-4o), Gemini(1.5 Pro), Claude(Sonnet) 3개 모델에 동일 질문을 입력한 실제 결과입니다.
              브랜드 가시성 분석은 Claude가 3개 답변을 종합 처리합니다.
            </p>
          </div>
```

교체 후 (`{result && (` → `{activeEntry && (`로 바꾸고 내부 `result.` → `activeEntry.` 전체 치환):
```tsx
      {activeEntry && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">실제 API 응답</span> — ChatGPT(GPT-4o mini), Gemini(2.0 Flash), Claude(Sonnet) 3개 모델에 동일 질문을 입력한 실제 결과입니다.
              브랜드 가시성 분석은 Claude가 3개 답변을 종합 처리합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[activeEntry.model_chatgpt, activeEntry.model_gemini, activeEntry.model_claude].map((model, i) => {
              const badges = [
                { label: 'OpenAI', cls: 'bg-green-50 text-green-700 border-green-300' },
                { label: 'Google', cls: 'bg-blue-50 text-blue-700 border-blue-300' },
                { label: 'Anthropic', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
              ]
              return (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badges[i].cls}`}>{badges[i].label}</span>
                    <span className="text-base font-bold text-slate-700">{model.name}</span>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{model.answer}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-base font-bold text-slate-700 mb-5">6개 브랜드 AI 노출 가시성</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {activeEntry.brand_visibility.map((bv) => {
                const isOurs = bv.brand === '볼뉴머'
                return (
                  <div key={bv.brand} className={`flex flex-col items-center gap-2 rounded-lg p-3 ${isOurs ? 'bg-red-50 ring-2 ring-red-200' : 'bg-slate-50'}`}>
                    {isOurs && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">당사</span>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prominenceCls[bv.prominence]}`}>
                      {bv.rank
                        ? <span className="text-white text-base font-bold">{bv.rank}</span>
                        : <span className="text-slate-400 text-base font-bold">—</span>
                      }
                    </div>
                    <span className={`text-sm font-semibold text-center ${isOurs ? 'text-red-700' : 'text-slate-700'}`}>{bv.brand}</span>
                    <span className="text-xs text-slate-400 text-center leading-tight">{prominenceLabel[bv.prominence]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-base font-bold text-slate-700 mb-4">GEO 분석 인사이트</p>
            <div className="space-y-4">
              {activeEntry.geo_insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <span className="text-base font-bold text-slate-400 shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-base text-slate-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 2: 기존 `result` 변수 선언(Task 2에서 제거됨)이 남아 있지 않은지 확인한다**

```bash
grep -n "setResult\|const result" src/app/geo/_components/GeoClient.tsx
```

Expected: 검색 결과 없음

- [ ] **Step 3: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): 본문 영역 activeEntry 기반 분기 렌더링으로 전환"
```

---

### Task 7: 히스토리 탭 선택 시 입력 폼 숨기기

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx` — 입력 폼 영역

- [ ] **Step 1: 입력 폼 전체를 `activeIdx === null` 조건으로 감싼다**

현재 코드:
```tsx
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
```

교체 후:
```tsx
      {activeIdx === null && (
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
```

그리고 해당 `</div>` 닫는 태그(입력 폼 블록 마지막) 뒤에 `)}`를 추가한다. 입력 폼 블록의 마지막은 시뮬레이션 실행 버튼 `</button>` 다음에 오는 `</div>`:

```tsx
        </button>
      </div>
      )}
```

- [ ] **Step 2: 에러 배너도 `activeIdx === null` 조건 안으로 이동한다**

현재:
```tsx
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-base rounded-lg px-4 py-3">
          <span className="flex-1">{error}</span>
          <button onClick={runPlayground} className="text-sm underline shrink-0">재시도</button>
        </div>
      )}
```

입력 폼 `)}` 바로 뒤, `{activeEntry &&` 블록 앞에 위치시킨다. 조건을 `activeIdx === null && error` 로 변경:
```tsx
      {activeIdx === null && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-base rounded-lg px-4 py-3">
          <span className="flex-1">{error}</span>
          <button onClick={runPlayground} className="text-sm underline shrink-0">재시도</button>
        </div>
      )}
```

- [ ] **Step 3: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음

- [ ] **Step 4: 최종 동작 수동 확인 체크리스트**

1. 페이지 첫 진입 → "새 시뮬레이션" 탭 활성, 입력 폼 표시
2. 시뮬레이션 실행 → 새 탭이 맨 왼쪽 히스토리 탭으로 추가되고 결과 표시, 입력 폼 숨김
3. "새 시뮬레이션" 탭 클릭 → 입력 폼 재표시 (이전에 입력한 query·perspective 유지)
4. 히스토리 탭 클릭 → 해당 결과 즉시 표시 (로딩 없음)
5. 탭에 마우스 올림 → × 버튼 표시, 클릭 시 탭 제거 + 옆 탭으로 포커스 이동
6. 전체 초기화 클릭 → 모든 탭 제거, 새 시뮬레이션 탭만 남음
7. 페이지 새로고침 → 히스토리 탭 그대로 유지

- [ ] **Step 5: Commit**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): 히스토리 탭 선택 시 입력 폼 숨김 처리"
```

---

### Task 8: git push

- [ ] **Step 1: 최종 push**

```bash
git push origin main
```
