/**
 * scripts/build.js
 * content/posts/ 폴더를 스캔해서 data/posts.json 자동 생성
 *
 * 사용법: node scripts/build.js
 */

const fs   = require('fs');
const path = require('path');

const POSTS_DIR  = path.join(__dirname, '..', 'content', 'posts');
const OUTPUT     = path.join(__dirname, '..', 'data', 'posts.json');

// HTML에서 <meta name="key" content="value"> 추출
function getMeta(html, name) {
  // \r\n 정규화
  const normalized = html.replace(/\r\n/g, '\n');
  const match = normalized.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
  ) || normalized.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i')
  );
  return match ? match[1].trim() : null;
}

// HTML에서 <title> 추출 (| 이후 블로그명 제거)
function getTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) return '제목 없음';
  return match[1].split('|')[0].trim();
}

function scan() {
  const posts = [];

  if (!fs.existsSync(POSTS_DIR)) {
    console.error('posts/ 폴더가 없습니다.');
    process.exit(1);
  }

  const categories = fs.readdirSync(POSTS_DIR).filter(name => {
    return fs.statSync(path.join(POSTS_DIR, name)).isDirectory();
  });

  for (const category of categories) {
    const categoryDir = path.join(POSTS_DIR, category);
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.html'));

    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      const html     = fs.readFileSync(filePath, 'utf-8');

      const title    = getTitle(html);
      const date     = getMeta(html, 'date')     || '날짜 없음';
      const catMeta  = getMeta(html, 'category') || category;
      const pinned   = getMeta(html, 'pinned')   === 'true';

      posts.push({
        title,
        category: catMeta,        // 복수 카테고리면 "network 정처기" 형태
        date,
        path: `content/posts/${category}/${file}`,
        pinned
      });
    }
  }

  // 날짜 내림차순 정렬, pinned 글은 항상 상단
  posts.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2), 'utf-8');
  console.log(`✅ data/posts.json 생성 완료 (${posts.length}개 글)`);
  posts.forEach(p => console.log(`   - [${p.category}] ${p.title} (${p.date})`));
}

scan();