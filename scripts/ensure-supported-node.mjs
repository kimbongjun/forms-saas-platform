const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)

if (Number.isNaN(major)) {
  console.error('[build] Node.js 버전을 확인할 수 없습니다.')
  process.exit(1)
}

if (major !== 22) {
  console.error('[build] 이 프로젝트는 Node.js 22.x 기준으로 검증되었습니다.')
  console.error('[build] `.nvmrc` 기준으로 Node.js 22를 사용한 뒤 다시 빌드해주세요.')
  console.error(`[build] current=${process.versions.node} expected=22.x`)
  process.exit(1)
}
