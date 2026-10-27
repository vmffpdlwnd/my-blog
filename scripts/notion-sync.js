/**
 * scripts/notion-sync.js
 * 노션 데이터베이스에서 "발행"이 체크된 글의 목록을 가져온다. (1단계: 목록 조회)
 *
 * 환경변수: NOTION_TOKEN, NOTION_DB_ID  (코드에 직접 쓰지 말 것 — GitHub Secrets에만 저장)
 * 사용법:   node scripts/notion-sync.js
 */

const { Client, collectPaginatedAPI } = require('@notionhq/client');

// 노션 속성 이름 (노션 데이터베이스의 열 이름과 같아야 함)
const PROP = {
  title:     '제목',
  date:      '날짜',
  category:  '카테고리',
  pinned:    '고정',
  published: '발행',
  summary:   '요약',
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

if (require.main === module) {
  fetchPosts()
    .then(posts => {
      console.log(`✅ 노션에서 발행된 글 ${posts.length}개`);
      posts.forEach(p => console.log(`   - [${p.category}] ${p.title} (${p.date})${p.pinned ? ' 📌' : ''}`));
    })
    .catch(err => {
      console.error('❌ 노션 조회 실패:', err.message);
      process.exit(1);
    });
}

module.exports = { fetchPosts, toPost };