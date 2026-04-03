/**
 * TinyMCE에서 실제로 사용하는 최소 정적 파일만 public/tinymce 에 복사합니다.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const srcRoot = path.join(root, 'node_modules', 'tinymce')
const destRoot = path.join(root, 'public', 'tinymce')

const files = [
  'tinymce.min.js',
  'icons/default/icons.min.js',
  'models/dom/model.min.js',
  'themes/silver/theme.min.js',
  'plugins/lists/plugin.min.js',
  'plugins/link/plugin.min.js',
  'plugins/image/plugin.min.js',
  'plugins/code/plugin.min.js',
  'plugins/table/plugin.min.js',
  'plugins/wordcount/plugin.min.js',
  'plugins/autolink/plugin.min.js',
  'plugins/charmap/plugin.min.js',
  'plugins/searchreplace/plugin.min.js',
  'skins/ui/oxide/skin.min.css',
  'skins/ui/oxide/content.min.css',
  'skins/ui/oxide/content.inline.min.css',
  'skins/ui/oxide/skin.shadowdom.min.css',
  'skins/content/default/content.min.css',
]

fs.rmSync(destRoot, { recursive: true, force: true })

for (const relativePath of files) {
  const from = path.join(srcRoot, relativePath)
  const to = path.join(destRoot, relativePath)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
}

console.log('TinyMCE 최소 파일만 public/tinymce 에 복사되었습니다.')
