# CLAUDE.md

AI(Claude)가 이 저장소에서 작업하기 전에 가장 먼저 읽는 안내서입니다. 규칙과 "무엇이 어디에 있는지"만 짧게 적습니다. 자세한 내용은 아래 문서로 안내합니다.

## 먼저 할 일

1. 이 파일, [`docs/작업규칙.md`](docs/작업규칙.md), [`docs/작업현황.md`](docs/작업현황.md)를 읽는다.
2. `git log -10`으로 최신 커밋을 확인한다. 작업은 항상 **최신 커밋을 기준**으로 한다.
3. **사용자가 "다음 작업 하자"라고 말하기 전에는 작업을 시작하지 않는다.** 그 전은 의견을 나누는 것이다.

## 프로젝트

- 인프라·시스템 엔지니어 포트폴리오와 기술 블로그. 포트폴리오(Home, Projects, Resume)가 중심이고 블로그는 보조 콘텐츠다.
- HTML / CSS / JS로 직접 만든 정적 사이트. 외부 템플릿과 프레임워크는 쓰지 않는다.
- 글은 노션에서 쓰고, GitHub Actions가 노션 글을 HTML로 바꿔 GitHub Pages에 배포한다.
- 배포 주소: https://vmffpdlwnd.github.io/my-blog
- 목표와 구조는 [`docs/기획서.md`](docs/기획서.md), 할 일은 [`docs/작업현황.md`](docs/작업현황.md), 실행 방법은 [`README.md`](README.md).

## 환경 제약 (Claude가 못 하는 것)

- 커밋과 push는 사용자가 Fork로 한다. Claude는 완성 파일을 만들어 올린다.
- 노션 토큰이 없어서 `npm run sync`를 돌릴 수 없다. 링크와 경로는 테스트 글로 확인하고, 실제 배포 화면은 사용자가 확인한다. 확인하지 못한 것은 확인하지 못했다고 밝힌다.

## 코딩 규칙

- 주석과 설명은 한글로, 무엇을 하는지보다 **왜 그렇게 하는지**를 적는다.
- 링크와 경로는 **상대경로**로 쓴다. 사이트가 `/my-blog/` 아래에 배포되므로 `/assets/...` 같은 절대경로는 깨진다.
- 경로 기준은 그 코드를 실행하는 HTML의 위치다. `assets/main.js`는 `pages/blog.html`에서 실행되므로 `../`를 붙인다.
- 글 페이지(`content/posts/카테고리/`)에서 사이트 파일로 가는 경로는 `../../../`로 시작한다.
- 노션 토큰, 데이터베이스 ID 같은 비밀 값은 코드와 저장소 어디에도 넣지 않는다. GitHub Secrets와 로컬 `.env`에만 둔다.
- 저장소가 공개라서 이력서 등 모든 내용이 공개된다. 공개해도 되는 정보만 넣는다.

## 문서 갱신

- 파일을 추가, 이동, 삭제하면 이 파일의 "코드 지도"도 같이 고쳐서 완성 파일에 포함한다.
- 작업이 끝나면 [`docs/작업현황.md`](docs/작업현황.md)도 같이 갱신한다.
- README와 기획서를 고칠 때는 부분이 아니라 **풀버전**으로 올린다.

## 코드 지도

### 기능 → 파일

| 기능 | 어디 |
| --- | --- |
| Home (소개, 핵심 역량, 기술 스택, 대표 프로젝트, 최근 글) | `index.html`, 최근 글은 `assets/home.js` |
| Projects (프로젝트 카드) | `pages/projects.html` |
| 프로젝트 상세 (개요, 스크린샷, 역할, 구성도, 기술, 성과, 트러블슈팅) | `pages/Projects/project-*.html` 4개. 본문은 `assets/post.css`, 구성도(인라인 SVG)와 스크린샷 갤러리는 `assets/portfolio.css`의 `.diagram`, `.gallery`. 경로는 `../../`로 시작한다 |
| Blog (글 목록, 카테고리 필터, 정렬, 고정글) | `pages/blog.html` + `assets/main.js` |
| Resume (A4 화면, PDF 저장) | `pages/resume.html`, 인쇄 스타일은 `assets/portfolio.css`의 `@media print` |
| 공통 스타일 (색상 변수, 헤더, 메뉴, 카테고리 태그) | `assets/common.css` |
| 목록·hero 스타일 | `assets/style.css` |
| 포트폴리오 스타일 (섹션, 칩, 카드, 이력서) | `assets/portfolio.css` |
| 글 페이지 스타일 | `assets/post.css` |
| 카테고리 화면 이름 | `assets/main.js`의 `categoryLabel`, `tagClass` + `scripts/notion-sync.js`의 `CATEGORY_LABEL` (둘을 같게 유지) |
| 노션 글 가져오기, 글 HTML 생성 | `scripts/notion-sync.js` (`renderPage`가 글 페이지 HTML을 만든다) |
| 노션 블록 → HTML 변환 | `scripts/notion-to-html.js` |
| 글 목록 데이터 생성 | `scripts/build.js` → `data/posts.json` |
| Giscus 댓글 | `scripts/notion-sync.js`의 `renderPage` 안 `<section class="comments">` |
| 배포 (노션 동기화 → 빌드 → Pages) | `.github/workflows/deploy.yml` |
| 매일 06:00 자동 배포 (기본 브랜치가 `dev`라서 Deploy를 `main`으로 실행시킨다) | `.github/workflows/scheduled-deploy.yml` |

### 폴더

| 폴더 | 역할 |
| --- | --- |
| root | `index.html`(Home, GitHub Pages 첫 화면이라 root에 있어야 한다), 설정 파일, 문서 |
| `pages/` | Home을 뺀 페이지 (blog, projects, resume). 프로젝트 상세는 `pages/Projects/` |
| `assets/` | css, js, 이미지. `assets/images/projects/프로젝트/`는 상세 페이지 시연 영상(GIF), `assets/images/notion-*`는 노션에서 내려받은 이미지 (Git 제외) |
| `content/posts/` | 글 HTML. `notion-*.html`은 노션에서 생성 (Git 제외) |
| `data/` | `posts.json` (빌드 때 생성, Git 제외) |
| `scripts/` | 빌드와 노션 동기화 스크립트 |
| `docs/` | 기획서, 작업규칙, 작업현황 (사이트에 배포되지 않는다) |