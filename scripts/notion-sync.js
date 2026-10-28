/**
 * scripts/notion-sync.js
 * 노션 데이터베이스에서 "발행"이 체크된 글을 가져와 글 HTML 파일로 변환한다.
 *    1) 발행된 글 목록 조회
 *    2) 글 본문(블록)을 HTML로 변환해 content/posts/카테고리/notion-*.html 로 저장
 *
 * 환경변수: NOTION_TOKEN, NOTION_DB_ID  (코드에 직접 쓰지 말 것 — GitHub Secrets에만 저장)
 * 사용법:   node scripts/notion-sync.js
 */

const { Client, collectPaginatedAPI } = require('@notionhq/client');

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { blocksToHtml, escapeHtml } = require('./notion-to-html');

// 노션 속성 이름 (노션 데이터베이스의 열 이름과 같아야 함)
const PROP = {
  title:     '제목',
  date:      '날짜',
  category:  '카테고리',
  pinned:    '고정',
  published: '발행',
  summary:   '요약',
};

const POSTS_DIR   = path.join(__dirname, '..', 'content', 'posts');
const FILE_PREFIX = 'notion-';   // 노션에서 생성된 파일 표시 (.gitignore 대상)

// 화면에 표시할 카테고리 이름 (assets/main.js의 categoryLabel과 같게 유지)
const CATEGORY_LABEL = { network: '네트워크', jungcheoki: '정처기', linux: '리눅스', etc: '기타' };
const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'];
const IMAGE_EXT_BY_TYPE = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif',
};

// 노션 rich text 배열 → 일반 문자열
function plain(richText = []) {
  return richText.map(t => t.plain_text).join('');
}

// 노션 페이지 → 블로그 글 메타 정보
function toPost(page) {
  const p = page.properties;
  return {
    id:       page.id,
    title:    plain(p[PROP.title]?.title) || '제목 없음',
    date:     p[PROP.date]?.date?.start?.slice(0, 10) || '날짜 없음',
    category: (p[PROP.category]?.multi_select || []).map(o => o.name).join(' ') || 'etc',
    pinned:   p[PROP.pinned]?.checkbox === true,
    summary:  plain(p[PROP.summary]?.rich_text),
  };
}

// 발행된 글 목록 조회
async function fetchPosts() {
  const { NOTION_TOKEN, NOTION_DB_ID } = process.env;
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    throw new Error('환경변수 NOTION_TOKEN, NOTION_DB_ID를 설정하세요.');
  }

  const notion = new Client({ auth: NOTION_TOKEN });

  // 데이터베이스 → 데이터 소스 ID (노션 API 최신 방식)
  const db = await notion.databases.retrieve({ database_id: NOTION_DB_ID });
  const dataSourceId = db.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error('데이터베이스에서 데이터 소스를 찾을 수 없습니다. 통합이 연결되어 있는지 확인하세요.');
  }

  const pages = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
    filter: { property: PROP.published, checkbox: { equals: true } },
    sorts:  [{ property: PROP.date, direction: 'descending' }],
  });

  return pages.filter(p => p.object === 'page' && p.properties).map(toPost);
}

// 블록과 하위 블록(has_children)을 끝까지 가져오기
async function fetchBlocks(notion, blockId) {
  const blocks = await collectPaginatedAPI(notion.blocks.children.list, { block_id: blockId });
  for (const block of blocks) {
    if (block.has_children && block.type !== 'child_page' && block.type !== 'child_database') {
      block.children = await fetchBlocks(notion, block.id);
    }
  }
  return blocks;
}

// 글 1개 → 전체 HTML 페이지 (templates/post-template.html과 같은 형식)
function renderPage(post, bodyHtml) {
  const tags = post.category.split(' ').map(c =>
    `<span class="post-tag ${escapeHtml(c)}">${escapeHtml(CATEGORY_LABEL[c] || c)}</span>`
  ).join('\n      ');
  const subtitle = post.summary
    ? `\n    <p class="post-subtitle">${escapeHtml(post.summary)}</p>`
    : '';

  return `<!DOCTYPE html>
<!-- 노션에서 자동 생성된 파일입니다. 직접 수정하지 마세요. (scripts/notion-sync.js) -->
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(post.title)} | dev.log</title>
  <meta name="date" content="${escapeHtml(post.date)}" />
  <meta name="category" content="${escapeHtml(post.category)}" />
  <meta name="pinned" content="${post.pinned}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../../assets/common.css" />
  <link rel="stylesheet" href="../../../assets/post.css" />
</head>
<body>

  <header>
    <div class="header-inner">
      <a class="logo" href="../../../index.html">dev<em>.</em>log</a>
      <nav class="site-nav">
        <a href="../../../index.html">Home</a>
        <a href="../../../projects.html">Projects</a>
        <a href="../../../blog.html" class="active">Blog</a>
        <a href="../../../resume.html">Resume</a>
      </nav>
    </div>
  </header>

  <div class="post-header">
    <div class="post-meta">
      ${tags}
      <span class="post-date">${escapeHtml(post.date)}</span>
    </div>
    <h1 class="post-title">${escapeHtml(post.title)}</h1>${subtitle}
  </div>

  <hr class="divider" />

  <article class="post-body">
${bodyHtml}
  </article>

  <div class="post-footer">
    <a class="back-btn" href="../../../blog.html">← 목록으로 돌아가기</a>
  </div>

</body>
</html>
`;
}

// 노션 이미지 주소는 약 1시간 뒤 만료되므로 내려받아 assets/images/에 저장하고, HTML에는 그 경로를 쓴다
function createImageResolver(usedImages) {
  return async function resolveImage(url, blockId) {
    const { pathname } = new URL(url);
    // 같은 이미지는 같은 파일명 (주소의 서명 부분은 매번 달라서 경로만 사용)
    const hash = crypto.createHash('sha1').update(pathname).digest('hex').slice(0, 12);
    let ext = path.extname(pathname).slice(1).toLowerCase();
    if (!IMAGE_EXTS.includes(ext)) ext = null;

    // 이미 받아 둔 파일이면 다시 받지 않음
    if (ext && fs.existsSync(path.join(IMAGES_DIR, `${FILE_PREFIX}${hash}.${ext}`))) {
      usedImages.add(`${FILE_PREFIX}${hash}.${ext}`);
      return `../../../assets/images/${FILE_PREFIX}${hash}.${ext}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`이미지 다운로드 실패 (${res.status}), 블록 ${blockId}`);
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    ext = ext || IMAGE_EXT_BY_TYPE[type];
    if (!ext) throw new Error(`지원하지 않는 이미지 형식 (${type}), 블록 ${blockId}`);

    const name = `${FILE_PREFIX}${hash}.${ext}`;
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    fs.writeFileSync(path.join(IMAGES_DIR, name), Buffer.from(await res.arrayBuffer()));
    usedImages.add(name);
    return `../../../assets/images/${name}`;   // 글 페이지(content/posts/카테고리/) 기준 경로
  };
}

// 이전에 생성된 노션 글 파일 삭제 (노션에서 발행 취소/삭제한 글이 남지 않게)
function removeOldNotionFiles(usedImages = new Set()) {
  if (!fs.existsSync(POSTS_DIR)) return;
  for (const dir of fs.readdirSync(POSTS_DIR)) {
    const dirPath = path.join(POSTS_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (file.startsWith(FILE_PREFIX) && file.endsWith('.html')) {
        fs.unlinkSync(path.join(dirPath, file));
      }
    }
  }
  
  // 더 이상 쓰지 않는 노션 이미지 삭제
  if (fs.existsSync(IMAGES_DIR)) {
    for (const file of fs.readdirSync(IMAGES_DIR)) {
      if (file.startsWith(FILE_PREFIX) && !usedImages.has(file)) {
        fs.unlinkSync(path.join(IMAGES_DIR, file));
      }
    }
  }
}

// 발행된 글 전체를 HTML 파일로 생성
async function syncPosts() {
  const posts  = await fetchPosts();
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  const usedImages   = new Set();
  const resolveImage = createImageResolver(usedImages);

  // 전부 변환에 성공한 뒤에 파일을 쓴다 (중간에 실패해도 기존 파일이 지워지지 않게)
  const outputs = [];
  for (const post of posts) {
    const blocks = await fetchBlocks(notion, post.id);
    const body   = await blocksToHtml(blocks, { resolveImage });
    const folder = (post.category.split(' ')[0] || 'etc').replace(/[\\/:*?"<>|.]/g, '_');
    const file   = `${FILE_PREFIX}${post.id.replace(/-/g, '').slice(0, 8)}.html`;
    outputs.push({ post, folder, file, html: renderPage(post, body) });
  }

  removeOldNotionFiles(usedImages);
  for (const o of outputs) {
    const dir = path.join(POSTS_DIR, o.folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, o.file), o.html, 'utf-8');
  }

  return outputs.map(o => ({ ...o.post, file: `content/posts/${o.folder}/${o.file}` }));
}

if (require.main === module) {
  syncPosts()
    .then(posts => {
      console.log(`✅ 노션 글 ${posts.length}개를 HTML로 변환했습니다.`);
      posts.forEach(p => console.log(`   - [${p.category}] ${p.title} → ${p.file}`));
    })
    .catch(err => {
      console.error('❌ 노션 동기화 실패:', err.message);
      process.exit(1);
    });
}

module.exports = { fetchPosts, syncPosts, toPost };