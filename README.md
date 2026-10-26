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
| 이력서 (현재 `etc/이력서.html` 블로그 글 형태) | 임시 — `/resume` 페이지로 분리 예정 |
| 포트폴리오 (Home, Projects) | 예정 |
| Blog 메뉴 분리 | 예정 |
| Giscus 댓글 | 예정 |
| 노션 연동 + GitHub Actions 자동 빌드 | 예정 (마지막 단계) |

## 메뉴 구조 (목표)

| 메뉴 | 내용 | 비고 |
|------|------|------|
| Home | 한 줄 포지셔닝 소개, 기술 스택, 대표 프로젝트 2~3개, 최근 글 | 포트폴리오 중심 첫 화면 |
| Projects | 프로젝트 카드 목록, 상세(문제 상황, 내 역할, 구성도, 사용 기술, 성과, 트러블슈팅), GitHub 링크 | 포트폴리오 핵심 |
| Blog | 기술 글 목록, 카테고리 필터, 정렬, 고정글, 글 본문 + Giscus 댓글 | 현재 `index.html`의 글 목록을 이 메뉴로 이동 |
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

## 노션 데이터베이스 설계 (예정)

| 노션 속성 | 타입 | 역할 | 기존 대응 |
|-----------|------|------|-----------|
| 제목 | Title | 글 제목 | `<title>` |
| 날짜 | Date | 작성일, 정렬 기준 | meta date |
| 카테고리 | Multi-select | 필터 버튼, 태그 | meta category |
| 고정 | Checkbox | 상단 고정 | meta pinned |
| 발행 | Checkbox | 체크한 글만 사이트에 공개 | (신규) |

- 카테고리 값은 영문 키(`network`, `linux`, `jungcheoki`)로 관리하고, 화면 이름은 `assets/main.js`의 `categoryLabel`에서 매핑합니다.
- 노션 이미지 주소는 약 1시간 뒤 만료되므로 동기화 시 내려받아 `assets/images/`에 저장하고 HTML에는 저장된 경로를 넣습니다.

## 보안 원칙

- 노션 토큰, 데이터베이스 ID 등 비밀 값은 코드에 넣지 않고 GitHub Secrets에만 저장합니다.
- 저장소가 공개이므로 코드, 글, 이력서의 모든 내용이 공개됩니다. 이력서에는 공개해도 되는 연락처·주소만 기재합니다.
- 노션의 비공개 메모는 `발행`을 체크하지 않으면 사이트에 올라가지 않습니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 작성 도구 | VS Code (노션 연동 후 노션 병행) |
| 프론트엔드 | HTML / CSS / JS |
| 데이터 | data/posts.json (자동 생성) |
| 빌드 | Node.js (scripts/build.js) |
| 배포 자동화 | Node.js (scripts/deploy.js) → GitHub Actions로 전환 예정 |
| 배포 | GitHub Pages |
| 예정 | Notion API, Giscus |

## 파일 구조 (현재)

```
my-blog/
├── index.html                  ← 글 목록 메인 페이지 (Home 개편 시 Blog 메뉴로 이동 예정)
├── assets/
│   ├── common.css              ← 공통 스타일 (색상 변수, 헤더, 카테고리 태그)
│   ├── style.css               ← index.html 스타일
│   ├── post.css                ← 글 페이지 스타일
│   └── main.js                 ← index.html 로직 (필터링, 정렬)
├── data/
│   └── posts.json              ← 글 목록 데이터 (build.js 자동 생성, 직접 수정 X)
├── scripts/
│   ├── build.js                ← content/posts/ 스캔 → data/posts.json 생성
│   └── deploy.js               ← build + git add + commit + push 자동화
├── templates/
│   └── post-template.html      ← 새 글 작성용 템플릿
└── content/
    └── posts/
        ├── network/            ← 네트워크
        ├── 정처기/              ← 정보처리기사
        ├── linux/              ← 리눅스
        └── etc/                ← 기타 (이력서 등)
```

## 시작하기

```bash
npm install simple-git
```

## 글 작성 방법 (현재: HTML 직접 작성)

### 1. 템플릿 복사

```bash
cp templates/post-template.html content/posts/network/OSI7계층.html
```

### 2. 메타 정보 수정

```html
<title>OSI 7계층 | dev.log</title>
<meta name="date"     content="2026-05-22" />
<meta name="category" content="network" />        <!-- 복수: "network 정처기" -->
<meta name="pinned"   content="false" />
```

### 3. 태그 수정

```html
<!-- 카테고리에 맞게 클래스 선택 -->
<span class="post-tag network">네트워크</span>

<!-- 복수 카테고리면 태그 두 개 -->
<span class="post-tag network">네트워크</span>
<span class="post-tag 정처기">정처기</span>
```

### 4. 본문 작성

`<article class="post-body">` 안에 자유롭게 HTML 작성

### 5. 배포

```bash
node scripts/deploy.js
```

build → git add → commit → push 가 한 번에 실행됩니다.

빌드만 할 때:

```bash
node scripts/build.js
```

## 카테고리 추가 방법

1. `content/posts/` 안에 폴더 생성
2. 글 작성 후 `node scripts/deploy.js`

필터 버튼은 `posts.json` 기반으로 자동 생성되므로 `index.html`은 수정하지 않아도 됩니다.

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

**4. 폴더 생성 후 배포**

```bash
# content/posts/python/ 폴더 생성 후
node scripts/deploy.js
```

## 현재 동작 중인 기능

- 카테고리 필터링 (복수 카테고리 지원)
- 최신순 / 오래된순 정렬
- 📌 pinned 글 상단 고정 (현재 `etc/이력서.html`이 고정글로 게시됨)
- 전체 글 수 / 카테고리 수 자동 카운트