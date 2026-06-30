#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const JOKES_DIR = path.join(__dirname, 'jokes');
const OUT_DIR   = path.join(__dirname, 'dist');
const OUT_FILE  = path.join(OUT_DIR, 'index.html');

// ── helpers ──────────────────────────────────────────────────────────────────

function parseFilename(name) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.md$/);
  if (!m) return null;
  const [, year, month, day, hour, minute] = m;
  return { year, month, day, hour, minute };
}

function formatDate({ year, month, day, hour, minute }) {
  const DOW = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
  const d = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  return `${DOW[d.getDay()]}, ${+day} tháng ${+month} năm ${year} · ${hour}:${minute}`;
}

function mdToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|hr)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function extractTitle(md) {
  const m = md.match(/^# (.+)$/m);
  return m ? m[1] : 'Truyện cười';
}

function wordCount(md) {
  return md.replace(/[#*`\-_\[\]]/g, '').trim().split(/\s+/).length;
}

// ── build ─────────────────────────────────────────────────────────────────────

function build() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const jokes = fs.readdirSync(JOKES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const parts = parseFilename(f);
      if (!parts) return null;
      const raw = fs.readFileSync(path.join(JOKES_DIR, f), 'utf8');
      return {
        id:    f.replace('.md', ''),
        title: extractTitle(raw),
        date:  formatDate(parts),
        words: wordCount(raw),
        html:  mdToHtml(raw),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.id.localeCompare(a.id)); // newest first

  const nav = jokes
    .map(j => `<a href="#${j.id}" class="chip">${j.title}</a>`)
    .join('');

  const cards = jokes.map(({ id, title, date, words, html }) => `
  <article id="${id}" class="card">
    <div class="card-meta">
      <span class="card-date">${date}</span>
      <span class="card-words">${words} từ</span>
    </div>
    <div class="card-body">${html}</div>
    <a href="#header" class="card-top" aria-label="Lên đầu trang">↑</a>
  </article>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Truyện cười ngắn mỗi ngày — dưới 300 từ">
<title>Kể Chuyện Cười</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --ink:   #1a1816;
  --sub:   #6b6560;
  --line:  #e4ddd5;
  --page:  #f7f4f0;
  --card:  #ffffff;
  --red:   #b83232;
  --red-bg:#fef2f2;
  --r: 12px;
}

html{scroll-behavior:smooth}

body{
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  background:var(--page);
  color:var(--ink);
  font-size:17px;
  line-height:1.85;
  min-height:100svh;
}

/* ── header ── */
#header{
  position:sticky;top:0;z-index:10;
  background:rgba(247,244,240,.92);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid var(--line);
  padding:14px 16px 0;
}

.brand{
  display:flex;align-items:baseline;gap:8px;
}
.brand-name{
  font-size:1.1rem;font-weight:700;
  color:var(--red);letter-spacing:-.02em;
}
.brand-count{
  font-size:.75rem;color:var(--sub);font-weight:400;
}

.chips{
  display:flex;gap:6px;
  overflow-x:auto;-webkit-overflow-scrolling:touch;
  scrollbar-width:none;
  padding:12px 0;
}
.chips::-webkit-scrollbar{display:none}
.chip{
  flex-shrink:0;
  padding:5px 13px;
  border:1.5px solid var(--line);
  border-radius:99px;
  font-size:.72rem;font-weight:600;
  color:var(--sub);
  text-decoration:none;
  white-space:nowrap;
  transition:border-color .15s,color .15s,background .15s;
}
.chip:hover,.chip:focus-visible{
  border-color:var(--red);
  color:var(--red);
  background:var(--red-bg);
  outline:none;
}

/* ── feed ── */
main{
  max-width:640px;
  margin:0 auto;
  padding:20px 16px 72px;
  display:flex;flex-direction:column;gap:16px;
}

/* ── card ── */
.card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:var(--r);
  overflow:hidden;
  position:relative;
}

.card-meta{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:10px 18px;
  background:var(--red-bg);
  border-bottom:1px solid #f3d5d5;
}
.card-date{font-size:.7rem;font-weight:600;color:var(--red)}
.card-words{font-size:.68rem;color:#c07070;white-space:nowrap}

.card-body{padding:20px 18px 14px}

.card-body h1{
  font-size:1.15rem;font-weight:700;line-height:1.4;
  margin-bottom:14px;color:var(--ink);
}
.card-body h2{font-size:1rem;font-weight:600;margin:14px 0 8px}
.card-body h3{font-size:.9rem;font-weight:600;margin:12px 0 6px}
.card-body p{margin-bottom:13px}
.card-body p:last-child{margin-bottom:0}
.card-body strong{font-weight:700}
.card-body em{font-style:italic;color:#444}
.card-body hr{border:none;border-top:1px dashed var(--line);margin:18px 0}

.card-top{
  display:block;
  position:absolute;bottom:12px;right:14px;
  font-size:.7rem;font-weight:600;
  color:var(--line);
  text-decoration:none;
  transition:color .15s;
}
.card-top:hover{color:var(--red)}

/* ── footer ── */
footer{
  text-align:center;
  padding:0 16px 40px;
  font-size:.72rem;color:var(--sub);
}
footer code{
  background:var(--line);
  padding:1px 6px;border-radius:4px;
  font-family:monospace;font-size:.68rem;
}

@media(max-width:400px){
  body{font-size:16px}
  .card-body{padding:16px 14px 12px}
  .card-meta{padding:9px 14px}
}
</style>
</head>
<body>
<div id="header">
  <div class="brand">
    <span class="brand-name">😄 Kể Chuyện Cười</span>
    <span class="brand-count">${jokes.length} truyện</span>
  </div>
  <nav class="chips" aria-label="Danh sách truyện">
    ${nav}
  </nav>
</div>

<main>${cards}
</main>

<footer>
  Sinh tự động từ <code>jokes/*.md</code> · chạy <code>node build.js</code> để cập nhật
</footer>
</body>
</html>`;

  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`✓ dist/index.html — ${jokes.length} truyện`);
  jokes.forEach(j => console.log(`  ${j.id}  "${j.title}"  ${j.words} từ`));
}

build();
