/**
 * deploy.js
 * build.js 실행 → git add → commit → push 자동화
 *
 * 사용법: node deploy.js
 * 의존성: npm install simple-git
 */

const { execSync } = require('child_process');
const simpleGit    = require('simple-git');
const git          = simpleGit();

async function deploy() {
  try {
    // 1. data/posts.json 갱신
    console.log('📦 data/posts.json 빌드 중...');
    execSync('node scripts/build.js', { stdio: 'inherit' });

    // 2. 변경된 파일 확인
    const status = await git.status();
    const changed = [...status.modified, ...status.not_added, ...status.created];

    if (changed.length === 0) {
      console.log('✅ 변경된 파일이 없습니다.');
      return;
    }

    // 3. 커밋 메시지 자동 생성
    //    새로 추가된 html 파일명 기반으로 메시지 작성
    const newPosts = changed
      .filter(f => f.startsWith('content/posts/') && f.endsWith('.html'))
      .map(f => f.split('/').pop().replace('.html', ''));

    const message = newPosts.length > 0
      ? `[자동] ${newPosts.join(', ')} 추가 - ${today()}`
      : `[자동] 블로그 업데이트 - ${today()}`;

    // 4. git add → commit → push
    console.log('\n🚀 배포 중...');
    await git.add('.');
    await git.commit(message);
    await git.push('origin', 'main');

    console.log(`\n✅ 배포 완료!`);
    console.log(`   커밋: ${message}`);

  } catch (err) {
    console.error('\n❌ 오류 발생:', err.message);
    process.exit(1);
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

deploy();