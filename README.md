# 인프라·시스템 엔지니어 포트폴리오 & 기술 블로그

프로젝트 경험, 자격증, 기술 역량을 한눈에 보여주고 공부한 내용을 기술 아티클로 쌓는 사이트입니다.
포트폴리오가 중심이고, 블로그는 보조 콘텐츠입니다.

- 배포: https://vmffpdlwnd.github.io/my-blog (GitHub Pages)
- 외부 템플릿 없이 HTML / CSS / JS로 직접 구성
- 저장소는 공개로 운영합니다.

## 문서

- [기획서](docs/기획서.md): 목표, 메뉴 구조, 포트폴리오 프로젝트, 아키텍처, 노션 데이터베이스 설계, 보안 원칙
- [작업 규칙](docs/작업규칙.md): 깃 규칙과 작업 방식 (AI와 함께 작업할 때 먼저 읽는다)
- [작업 현황](docs/작업현황.md): 완료된 것, 브랜치, 할 일
- [CLAUDE.md](CLAUDE.md): AI가 작업 전에 읽는 안내서 (기능이 어느 파일에 있는지 지도)

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | HTML / CSS / JS |
| 글 작성 | 노션 (Notion API, `@notionhq/client`) |
| 빌드 | Node.js (`scripts/notion-sync.js`, `scripts/build.js`) |
| 배포 자동화 | GitHub Actions (`.github/workflows/deploy.yml`, `scheduled-deploy.yml`) |
| 배포 | GitHub Pages |
| 댓글 | Giscus (GitHub Discussions) |

## 파일 구조

```
my-blog/
├── index.html                  ← Home (GitHub Pages 첫 화면)
├── pages/
│   ├── blog.html               ← Blog (글 목록, 카테고리 필터, 정렬)
│   ├── projects.html           ← Projects (프로젝트 카드)
│   └── resume.html             ← Resume (A4, PDF 저장)
├── assets/
│   ├── common.css              ← 공통 스타일 (색상 변수, 헤더, 메뉴, 카테고리 태그)
│   ├── style.css               ← 목록·hero 스타일 (Home, Projects, Blog)
│   ├── portfolio.css           ← 포트폴리오 페이지 스타일 (Home, Projects, Resume)
│   ├── post.css                ← 글 페이지 스타일
│   ├── main.js                 ← Blog 로직 (필터링, 정렬)
│   ├── home.js                 ← Home 최근 글 표시
│   ├── images/                 ← 노션에서 내려받은 이미지 (notion-*, Git 제외)
│   └── 사진.jpg                ← 이력서 프로필 사진
├── content/posts/카테고리/      ← 노션에서 생성된 글 (notion-*.html, Git 제외)
├── data/posts.json             ← 글 목록 (빌드 때 생성, Git 제외)
├── scripts/
│   ├── build.js                ← content/posts/ 스캔 → data/posts.json 생성
│   ├── notion-sync.js          ← 노션 글 목록 조회, 글 HTML·이미지 생성
│   └── notion-to-html.js       ← 노션 블록 → HTML 변환
├── docs/                       ← 기획서, 작업규칙, 작업현황 (사이트에 배포되지 않음)
├── .github/workflows/
│   ├── deploy.yml              ← 노션 동기화 → 빌드 → Pages 배포
│   └── scheduled-deploy.yml    ← 매일 06:00 Deploy를 main으로 실행
├── .env.example                ← 환경변수 견본 (실제 .env는 Git에 올라가지 않음)
└── CLAUDE.md
```

## 시작하기

```bash
npm install
Copy-Item .env.example .env     # macOS/Linux: cp .env.example .env
```

`.env`에 `NOTION_TOKEN`, `NOTION_DB_ID`를 채웁니다. `.env`는 `.gitignore`에 들어 있어 커밋되지 않습니다.

GitHub에서는 Settings → Secrets and variables → Actions에 `NOTION_TOKEN`, `NOTION_DB_ID`를 등록하고, Settings → Pages의 Source를 `GitHub Actions`로 설정합니다.

## 글 작성 방법

1. 노션 `블로그 글` 데이터베이스에 글을 쓰고 제목, 날짜, 카테고리(영문 키), 요약(선택)을 채웁니다.
2. 사이트에 올릴 글만 `발행`을 체크합니다. 체크하지 않은 글은 노션에만 남습니다.
3. 로컬에서 확인할 때는 동기화와 빌드를 실행합니다.

```bash
npm run sync      # 노션 → content/posts/카테고리/notion-*.html, assets/images/notion-*
npm run build     # posts.json 갱신 (블로그 목록에 반영)
```

- 제목 변환: 노션 H1, H2 → `<h2>`, H3 → `<h3>`
- 지원 블록: 제목, 문단, 목록(중첩), 코드, 인용, 콜아웃, 구분선, 표, 토글, 이미지, 링크
- 생성된 `notion-*` 파일은 동기화할 때마다 새로 만들어지고 Git에 올라가지 않습니다.
- 사이트에는 `main`에 push하거나 매일 06:00(KST)에 자동 반영되며, Actions 탭의 `Run workflow`로 바로 실행할 수도 있습니다. 기본 브랜치가 `dev`이므로 수동 실행할 때는 브랜치를 `main`으로 선택합니다.

## 카테고리·태그 추가 방법

**1. 노션** — 카테고리 옵션에 영문 키를 추가합니다. 글 폴더는 첫 번째 카테고리 이름으로 자동 생성됩니다.

**2. `assets/common.css`** — 태그 색상 변수와 클래스를 추가합니다.

```css
--tag-python: #e0f2fe;
--tag-python-text: #075985;

.post-tag.python { background: var(--tag-python); color: var(--tag-python-text); }
```

**3. `assets/main.js`** — 라벨과 클래스 매핑을 추가합니다.

```js
const categoryLabel = { ..., python: '파이썬' };
const tagClass      = { ..., python: 'python' };
```

**4. `scripts/notion-sync.js`** — 글 페이지 태그 라벨을 추가합니다.

```js
const CATEGORY_LABEL = { ..., python: '파이썬' };
```

필터 버튼은 `posts.json` 기반으로 자동 생성되므로 `pages/blog.html`은 수정하지 않아도 됩니다.

## 현재 동작 중인 기능

- 메뉴 4개 (Home / Projects / Blog / Resume)
- 카테고리 필터링 (복수 카테고리 지원), 최신순 / 오래된순 정렬, 📌 고정글, 전체 글 수 / 카테고리 수 자동 카운트
- Home 최근 글 자동 표시
- 이력서 A4 화면 + 브라우저 인쇄로 PDF 저장
- 노션 연동: 발행된 글과 이미지를 HTML로 변환
- Giscus 댓글
- GitHub Actions: 노션 동기화 → 빌드 → GitHub Pages 자동 배포 (PR은 빌드만 검증)