// Home 최근 글: data/posts.json에서 최신 글 3개를 표시
const RECENT_COUNT = 3;

const list = document.getElementById('recent-posts');
const note = document.getElementById('recent-note');

fetch('data/posts.json')
  .then(r => r.json())
  .then(posts => {
    const recent = [...posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, RECENT_COUNT);

    if (recent.length === 0) {
      note.textContent = '아직 글이 없습니다.';
      return;
    }

    note.style.display = 'none';

    recent.forEach(post => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a class="post-item">
          <span class="post-title"></span>
          <span class="post-right">
            <span class="post-date"></span>
            <span class="post-arrow">→</span>
          </span>
        </a>`;
      const a = li.firstElementChild;
      a.href = post.path;
      a.querySelector('.post-title').textContent = post.title;
      a.querySelector('.post-date').textContent = post.date;
      list.appendChild(li);
    });
  })
  .catch(() => {
    note.textContent = '글 목록을 불러올 수 없습니다.';
  });