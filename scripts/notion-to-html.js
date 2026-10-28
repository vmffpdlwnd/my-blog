/**
 * scripts/notion-to-html.js
 * 노션 블록(block) 배열을 글 본문 HTML로 변환한다. (API 호출 없음, 순수 변환)
 *
 * 제목 규칙: 노션 H1, H2 → <h2> / H3 → <h3>
 *            (글 제목이 이미 <h1>이므로 본문에는 h1을 쓰지 않는다)
 */

// HTML 특수문자 이스케이프
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 링크는 http(s), mailto, 상대경로, 앵커만 허용 (javascript: 등 차단)
function safeHref(href) {
  return /^(https?:|mailto:|\/|#)/i.test(href) ? href : null;
}

// rich text 배열 → 인라인 HTML (굵게, 기울임, 코드, 링크 등)
function richToHtml(richText = []) {
  return richText.map(t => {
    let html = escapeHtml(t.plain_text).replace(/\n/g, '<br />');
    const a = t.annotations || {};
    if (a.code)          html = `<code>${html}</code>`;
    if (a.bold)          html = `<strong>${html}</strong>`;
    if (a.italic)        html = `<em>${html}</em>`;
    if (a.strikethrough) html = `<s>${html}</s>`;
    if (a.underline)     html = `<u>${html}</u>`;
    const href = t.href && safeHref(t.href);
    if (href)            html = `<a href="${escapeHtml(href)}">${html}</a>`;
    return html;
  }).join('');
}

function plainText(richText = []) {
  return richText.map(t => t.plain_text).join('');
}

// 블록 배열 → HTML (연속된 목록 항목은 하나의 <ul>/<ol>로 묶는다)
async function blocksToHtml(blocks, ctx = {}) {
  const out = [];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];

    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const tag   = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      const items = [];
      while (i < blocks.length && blocks[i].type === b.type) {
        const li    = blocks[i];
        const inner = li.children?.length ? '\n' + await blocksToHtml(li.children, ctx) : '';
        items.push(`<li>${richToHtml(li[li.type].rich_text)}${inner}</li>`);
        i++;
      }
      out.push(`<${tag}>\n${items.join('\n')}\n</${tag}>`);
      continue;
    }

    out.push(await blockToHtml(b, ctx));
    i++;
  }

  return out.filter(Boolean).join('\n\n');
}

// 블록 1개 → HTML
async function blockToHtml(b, ctx) {
  // 이미지 주소 변환 함수 (다음 단계에서 다운로드 로직을 연결할 자리)
  const resolveImage = ctx.resolveImage || (async url => url);
  const data     = b[b.type] || {};
  // 표(table)의 하위 블록은 행(row)이라 아래 case에서 직접 처리한다
  const children = b.type !== 'table' && b.children?.length ? '\n' + await blocksToHtml(b.children, ctx) : '';

  switch (b.type) {
    case 'paragraph': {
      const text = richToHtml(data.rich_text);
      return text || children ? `<p>${text}</p>${children}` : '';   // 빈 줄은 건너뜀
    }
    case 'heading_1':
    case 'heading_2':
      return `<h2>${richToHtml(data.rich_text)}</h2>${children}`;
    case 'heading_3':
      return `<h3>${richToHtml(data.rich_text)}</h3>${children}`;
    case 'quote':
      return `<blockquote>${richToHtml(data.rich_text)}${children}</blockquote>`;
    case 'callout': {
      const icon = data.icon?.type === 'emoji' ? data.icon.emoji + ' ' : '';
      return `<blockquote>${escapeHtml(icon)}${richToHtml(data.rich_text)}${children}</blockquote>`;
    }
    case 'code':
      return `<pre><code>${escapeHtml(plainText(data.rich_text))}</code></pre>`;
    case 'divider':
      return '<hr />';
    case 'to_do':
      return `<p>${data.checked ? '☑' : '☐'} ${richToHtml(data.rich_text)}</p>${children}`;
    case 'toggle':
      return `<details>\n<summary>${richToHtml(data.rich_text)}</summary>${children}\n</details>`;
    case 'image': {
      const url = data.type === 'external' ? data.external.url : data.file.url;
      const src = await resolveImage(url, b.id);
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(plainText(data.caption))}" />`;
    }
    case 'bookmark':
    case 'embed':
    case 'link_preview': {
      const href = safeHref(data.url || '');
      return href ? `<p><a href="${escapeHtml(href)}">${escapeHtml(data.url)}</a></p>` : '';
    }
    case 'table': {
      const rows = (b.children || []).map((row, idx) => {
        const tag   = data.has_column_header && idx === 0 ? 'th' : 'td';
        const cells = row.table_row.cells.map(c => `<${tag}>${richToHtml(c)}</${tag}>`).join('');
        return `<tr>${cells}</tr>`;
      });
      return `<table>\n<tbody>\n${rows.join('\n')}\n</tbody>\n</table>`;
    }
    case 'column_list':
    case 'column':
      return children.trim();   // 열 구분 없이 위에서 아래로 이어 붙임
    default:
      console.warn(`⚠️ 지원하지 않는 블록 건너뜀: ${b.type}`);
      return `<!-- 지원하지 않는 블록: ${b.type} -->`;
  }
}

module.exports = { blocksToHtml, richToHtml, escapeHtml };