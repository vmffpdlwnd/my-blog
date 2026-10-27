let allPosts    = [];
let currentFilter = 'all';
let currentSort   = 'newest';

const categoryLabel = { all: '전체', network: '네트워크', jungcheoki: '정처기', linux: '리눅스', etc: '기타' };
const tagClass      = { network: 'network', jungcheoki: 'jungcheoki', linux: 'linux', etc: 'etc' };

// data/posts.json 로드
fetch('data/posts.json')
  .then(r => r.json())
  .then(data => {
    allPosts = data;
    init();
  })
  .catch(() => {
    const msg = document.getElementById('empty-msg');
    msg.style.display = 'block';
    msg.textContent   = 'data/posts.json을 찾을 수 없습니다. scripts/build.js를 먼저 실행하세요.';
  });

function init() {
  // 카테고리 목록 추출 (중복 제거)
  const catSet = new Set();
  allPosts.forEach(p => p.category.split(' ').forEach(c => catSet.add(c)));
  const categories = [...catSet];

  // stat 업데이트
  document.getElementById('stat-total').textContent = allPosts.length;
  document.getElementById('stat-cat').textContent   = categories.length;

  // 필터 버튼 생성
  const wrap = document.getElementById('filter-wrap');
  wrap.appendChild(makeFilterBtn('all', '전체'));
  categories.forEach(cat => wrap.appendChild(makeFilterBtn(cat, categoryLabel[cat] || cat)));

  // 정렬 이벤트
  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    render();
  });

  render();
}

function makeFilterBtn(filter, label) {
  const btn = document.createElement('button');
  btn.className    = 'filter-btn' + (filter === 'all' ? ' active' : '');
  btn.dataset.filter = filter;
  btn.textContent  = label;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = filter;
    render();
  });
  return btn;
}

function render() {
  // 필터
  const filtered = allPosts.filter(p => {
    if (currentFilter === 'all') return true;
    return p.category.split(' ').includes(currentFilter);
  });

  // 정렬 (pinned 항상 상단)
  filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const diff = new Date(b.date) - new Date(a.date);
    return currentSort === 'newest' ? diff : -diff;
  });

  // list-info 텍스트
  const catName = categoryLabel[currentFilter] || currentFilter;
  document.getElementById('list-info').innerHTML = currentFilter === 'all'
    ? `전체 <em>${filtered.length}</em>개의 글`
    : `<em>${catName}</em>의 글 <em>${filtered.length}</em>개`;

  // 목록 렌더링
  const list = document.getElementById('post-list');
  list.innerHTML = '';

  filtered.forEach(post => {
    const cats = post.category.split(' ');
    const tags = cats.map(c =>
      `<span class="post-tag ${tagClass[c] || ''}">${categoryLabel[c] || c}</span>`
    ).join('');
    const pin = post.pinned ? `<span class="pin-icon">📌</span>` : '';

    const li = document.createElement('li');
    li.innerHTML = `
      <a class="post-item" href="${post.path}">
        <div class="post-left">
          ${pin}${tags}
          <span class="post-title">${post.title}</span>
        </div>
        <div class="post-right">
          <span class="post-date">${post.date}</span>
          <span class="post-arrow">→</span>
        </div>
      </a>`;
    list.appendChild(li);
  });

  document.getElementById('empty-msg').style.display = filtered.length === 0 ? 'block' : 'none';
}
