# 인프라·시스템 엔지니어 포트폴리오 & 기술 블로그

프로젝트 경험, 자격증, 기술 역량을 한눈에 보여주고 공부한 내용을 기술 아티클로 쌓는 사이트입니다.
HTML 기반 정적 블로그로 시작해 **포트폴리오 중심 사이트로 확장 중**이며, 블로그는 보조 콘텐츠입니다.

- 배포: https://vmffpdlwnd.github.io/my-blog (GitHub Pages)
- 외부 템플릿 없이 HTML / CSS / JS로 직접 구성
- 저장소는 공개로 운영합니다. 

## 진행 현황

| 구분 | 상태 |
|------|------|
| 정적 블로그 (목록, 카테고리 필터, 정렬, 고정글) | 완료 |
| 메뉴 구조 (Home / Projects / Blog / Resume), Blog 분리 | 완료 |
| 이력서 `/resume` (A4, PDF 저장) | 완료 — 공개 범위 확정 후 내용 수정 예정 |
| Home, Projects | 틀 완료 — 소개 문구, 기술 스택, 프로젝트 내용 작성 예정 (Home 최근 글은 연동 완료) |
| 카테고리 키 영문화 (`jungcheoki`) | 완료 |
| 노션 연동 (글·이미지 동기화, `npm run sync`) | 완료 |
| GitHub Actions 자동 빌드·배포 (매일 06:00 KST + 수동 실행) | 완료 |
| Giscus 댓글 | 예정 |

## 메뉴 구조 (목표)

| 메뉴 | 내용 | 비고 |
|------|------|------|
| Home | 한 줄 포지셔닝 소개, 기술 스택, 대표 프로젝트 2~3개, 최근 글 | 포트폴리오 중심 첫 화면 |
| Projects | 프로젝트 카드 목록, 상세(문제 상황, 내 역할, 구성도, 사용 기술, 성과, 트러블슈팅), GitHub 링크 | 포트폴리오 핵심 |
| Blog | 기술 글 목록, 카테고리 필터, 정렬, 고정글, 글 본문 + Giscus 댓글 | `blog.html` (기존 `index.html`의 글 목록을 이동) |
| Resume | 학력, 자격증, 군 경력, 기술 스택, 프로젝트 요약 + PDF 저장 버튼 | `@media print` 적용 |

## 주요 기능 (목표)

1. **포트폴리오**: Home, Projects. 초기에는 코드에 직접 작성하고, 노션 연동 후 옮길지 결정합니다.
2. **이력서 `/resume`**: A4 비율 웹 화면, `window.print()` 버튼으로 PDF 저장. `@page { size: A4 }`, `print-color-adjust: exact`, 항목 단위 `break-inside: avoid` 적용. 인쇄 시 헤더·푸터·버튼 숨김, 라이트 테마 고정.
3. **Giscus 댓글**: GitHub 계정으로 로그인해 댓글 작성. 글 URL 기준으로 GitHub Discussions에 토론이 자동 생성됩니다.
4. **노션 연동 블로그**: 노션 데이터베이스에서 글을 쓰면 GitHub Actions가 빌드 시점에 노션 API로 가져와 `post-template.html`과 같은 형식의 HTML로 변환합니다. 기존 HTML 글(`content/posts/`)과 노션 글이 함께 존재합니다.

## 시스템 아키텍처 (목표)

```
Notion DB ──(Notion API, 토큰은 GitHub Secrets)──▶ GitHub Actions ──▶ build.js ──▶ GitHub Pages
content/posts/*.html (기존 글) ─────────────────────────────────────▶ build.js
방문자 댓글 ──▶ Giscus ──▶ GitHub Discussions
```

- 새 글 반영: 정해진 시간마다 자동 실행 + 수동 실행 버튼
- 빌드 실패 시 GitHub Actions 로그로 원인 확인

## 노션 데이터베이스 설계

| 노션 속성 | 타입 | 역할 | 기존 대응 |
|-----------|------|------|-----------|
| 제목 | Title | 글 제목 | `<title>` |
| 날짜 | Date | 작성일, 정렬 기준 | meta date |
| 카테고리 | Multi-select | 필터 버튼, 태그 | meta category |
| 고정 | Checkbox | 상단 고정 | meta pinned |
| 발행 | Checkbox | 체크한 글만 사이트에 공개 | (신규) |
| 요약 | Text | 글 상단 한 줄 요약 (비워 두면 생략) | `<p class="post-subtitle">` |

- 카테고리 값은 영문 키(`network`, `linux`, `jungcheoki`)로 관리하고, 화면 이름은 `assets/main.js`의 `categoryLabel`에서 매핑합니다.
- 노션 이미지 주소는 약 1시간 뒤 만료되므로 동기화 시 내려받아 `assets/images/`에 저장하고 HTML에는 저장된 경로를 넣습니다.
- 속성 이름(제목, 날짜, 카테고리, 고정, 발행, 요약)은 `scripts/notion-sync.js`의 `PROP`과 같아야 하고, 노션 통합(Integration)이 데이터베이스에 연결되어 있어야 합니다.

## 보안 원칙

- 노션 토큰, 데이터베이스 ID 등 비밀 값은 코드에 넣지 않고 GitHub Secrets에만 저장합니다.
- 저장소가 공개이므로 코드, 글, 이력서의 모든 내용이 공개됩니다. 이력서에는 공개해도 되는 연락처·주소만 기재합니다.
- 노션의 비공개 메모는 `발행`을 체크하지 않으면 사이트에 올라가지 않습니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 작성 도구 | VS Code (노션 연동 후 노션 병행) |
| 프론트엔드 | HTML / CSS / JS |
| 데이터 | data/posts.json (빌드 시 자동 생성, Git 제외) |
| 빌드 | Node.js (scripts/build.js) |
| 배포 자동화 | GitHub Actions (.github/workflows/deploy.yml) |
| 배포 | GitHub Pages |
| 노션 연동 | Notion API (`@notionhq/client`), `scripts/notion-sync.js`, `scripts/notion-to-html.js` |
| 예정 | Giscus |

## 파일 구조 (현재)

```
my-blog/
├── index.html                  ← Home
├── projects.html               ← Projects (갤러리 틀)
├── blog.html                   ← Blog (글 목록, 카테고리 필터, 정렬)
├── resume.html                 ← Resume (A4, PDF 저장)
├── .env.example                ← 환경변수 견본 (실제 .env는 Git에 올라가지 않음)
├── .github/workflows/deploy.yml ← 노션 동기화 → 빌드 → Pages 배포
├── assets/
│   ├── common.css              ← 공통 스타일 (색상 변수, 헤더, 메뉴, 카테고리 태그)
│   ├── style.css               ← 목록·hero 스타일 (Home, Projects, Blog)
│   ├── portfolio.css           ← 포트폴리오 페이지 스타일 (Home, Projects, Resume)
│   ├── post.css                ← 글 페이지 스타일
│   ├── main.js                 ← Blog 로직 (필터링, 정렬)
│   ├── home.js                 ← Home 최근 글 표시
│   ├── images/                 ← 노션에서 내려받은 이미지 (notion-*, Git 제외)
│   └── 사진.jpg                ← 이력서 프로필 사진
├── data/
│   └── posts.json              ← 글 목록 (빌드 시 자동 생성, Git 제외)
├── scripts/
│   ├── build.js                ← content/posts/ 스캔 → data/posts.json 생성
│   ├── notion-sync.js          ← 노션 글 목록 조회, 글 HTML·이미지 생성
│   └── notion-to-html.js       ← 노션 블록 → HTML 변환
├── templates/
│   └── post-template.html      ← HTML 글 작성용 템플릿
└── content/
    └── posts/
        ├── network/            ← 직접 작성한 HTML 글 (카테고리별 폴더)
        └── 카테고리/notion-*.html  ← 노션에서 생성된 글 (Git 제외)
```

## 시작하기

```bash
npm install
Copy-Item .env.example .env     # macOS/Linux: cp .env.example .env
```

`.env`에 `NOTION_TOKEN`, `NOTION_DB_ID`를 채웁니다. `.env`는 `.gitignore`에 들어 있어 커밋되지 않습니다.

GitHub에서는 Settings → Secrets and variables → Actions에 `NOTION_TOKEN`, `NOTION_DB_ID`를 등록하고, Settings → Pages의 Source를 `GitHub Actions`로 설정합니다.

## 글 작성 방법 (노션)

1. 노션 `블로그 글` 데이터베이스에 글을 쓰고 제목, 날짜, 카테고리(영문 키), 요약(선택)을 채웁니다.
2. 사이트에 올릴 글만 `발행`을 체크합니다. 체크하지 않은 글은 노션에만 남습니다.
3. 터미널에서 동기화합니다.

```bash
npm run sync      # 노션 → content/posts/카테고리/notion-*.html, assets/images/notion-*
npm run build     # posts.json 갱신 (블로그 목록에 반영)
```

- 제목 변환: 노션 H1, H2 → `<h2>`, H3 → `<h3>`
- 지원 블록: 제목, 문단, 목록(중첩), 코드, 인용, 콜아웃, 구분선, 표, 토글, 이미지, 링크
- 생성된 `notion-*` 파일은 동기화할 때마다 새로 만들어지고 Git에 올라가지 않습니다. 사이트에는 `main`에 push하거나 매일 06:00(KST)에 자동 반영되며, Actions 탭의 `Run workflow`로 바로 실행할 수도 있습니다.

## 글 작성 방법 (HTML 직접 작성)

### 1. 템플릿 복사

```bash
cp templates/post-template.html content/posts/network/OSI7계층.html
```

### 2. 메타 정보 수정

```html
<title>OSI 7계층 | dev.log</title>
<meta name="date"     content="2026-05-22" />
<meta name="category" content="network" />        <!-- 복수: "network jungcheoki" -->
<meta name="pinned"   content="false" />
```

### 3. 태그 수정

```html
<!-- 카테고리에 맞게 클래스 선택 -->
<span class="post-tag network">네트워크</span>

<!-- 복수 카테고리면 태그 두 개 -->
<span class="post-tag network">네트워크</span>
<span class="post-tag jungcheoki">정처기</span>
```

### 4. 본문 작성

`<article class="post-body">` 안에 자유롭게 HTML 작성

### 5. 배포

`content/posts/`에 파일을 추가하고 `main`에 push하면 GitHub Actions가 빌드·배포합니다.

로컬에서 목록만 확인할 때:

```bash
node scripts/build.js
```

## 카테고리 추가 방법

1. `content/posts/` 안에 폴더 생성
2. 글 작성 후 `main`에 push

필터 버튼은 `posts.json` 기반으로 자동 생성되므로 `blog.html`은 수정하지 않아도 됩니다.

노션 글은 노션의 카테고리 옵션에 영문 키를 추가하면 됩니다. 폴더는 첫 번째 카테고리 이름으로 자동 생성됩니다.

## 태그 추가 방법

`assets/common.css` 한 군데만 수정하면 메인과 글 페이지 모두 반영됩니다.

**1. `common.css` — 변수 추가**

```css
--tag-python: #e0f2fe;
--tag-python-text: #075985;
```

**2. `common.css` — 클래스 추가**

```css
.post-tag.python { background: var(--tag-python); color: var(--tag-python-text); }
```

**3. `assets/main.js` — 라벨, 클래스 매핑 추가**

```js
const categoryLabel = { ..., python: '파이썬' };
const tagClass      = { ..., python: 'python' };
```

**3-1. `scripts/notion-sync.js` — 노션 글 태그 라벨 추가**

```js
const CATEGORY_LABEL = { ..., python: '파이썬' };
```

**4. 폴더 생성 후 push**

`content/posts/python/` 폴더를 만들고 글을 넣은 뒤 `main`에 push합니다.

## 현재 동작 중인 기능

- 메뉴 4개 (Home / Projects / Blog / Resume)
- 카테고리 필터링 (복수 카테고리 지원), 최신순 / 오래된순 정렬, 📌 고정글, 전체 글 수 / 카테고리 수 자동 카운트
- Home 최근 글 자동 표시
- 이력서 A4 화면 + 브라우저 인쇄로 PDF 저장
- 노션 연동: 발행된 글과 이미지를 HTML로 변환 (`npm run sync`)
- GitHub Actions: 노션 동기화 → 빌드 → GitHub Pages 자동 배포 (PR은 빌드만 검증)