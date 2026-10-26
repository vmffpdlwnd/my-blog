# 📝 개발 공부 블로그

공부한 내용을 HTML 기반 정적 블로그로 정리하고 GitHub Pages로 배포하는 프로젝트입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 작성 도구 | VS Code |
| 프론트엔드 | HTML / CSS / JS |
| 데이터 | data/posts.json (자동 생성) |
| 빌드 | Node.js (scripts/build.js) |
| 배포 자동화 | Node.js (scripts/deploy.js) |
| 배포 | GitHub Pages |

## 파일 구조

```
my-blog/
├── index.html                  ← 글 목록 메인 페이지
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

## 글 작성 방법

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

## 주요 기능

- 카테고리 필터링 (복수 카테고리 지원)
- 최신순 / 오래된순 정렬
- 📌 pinned 글 상단 고정 (현재 `etc/이력서.html`이 고정글로 게시됨)
- 전체 글 수 / 카테고리 수 자동 카운트

## 배포 URL

```
https://vmffpdlwnd.github.io/my-blog
```
