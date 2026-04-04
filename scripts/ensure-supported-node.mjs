const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)

if (Number.isNaN(major)) {
  console.error('[build] Node.js 버전을 확인할 수 없습니다.')
  process.exit(1)
}

if (major >= 24) {
  console.error('[build] 현재 Node.js 버전에서는 Next.js 16 빌드가 불안정할 수 있습니다.')
  console.error('[build] `.nvmrc` 기준으로 Node.js 22를 사용한 뒤 다시 빌드해주세요.')
  console.error(`[build] current=${process.versions.node} expected=22.x`)
  process.exit(1)
}
