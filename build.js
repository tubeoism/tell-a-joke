#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const JOKES_DIR = path.join(__dirname, 'jokes');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

function parseFilename(filename) {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.md$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return { year, month, day, hour, minute };
}

function formatDate(parts) {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const d = new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00`);
  const dayName = days[d.getDay()];
  return `${dayName}, ${parseInt(parts.day, 10)} tháng ${parseInt(parts.month, 10)}, ${parts.year} — ${parts.hour}:${parts.minute}`;
}

function mdToHtml(md) {
  let html = md
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // horizontal rule
    .replace(/^---$/gm, '<hr>')
    // bold italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // blank lines -> paragraph breaks
    .split(/\n\n+/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|hr)/.test(block)) return block;
      // preserve line breaks within a paragraph
      block = block.replace(/\n/g, '<br>');
      return `<p>${block}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  return html;
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function extractTitle(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1] : 'Truyện cười';
}

function countWords(md) {
  return md.replace(/[#*`\-_]/g, '').trim().split(/\s+/).length;
}

function buildSite() {
  const files = fs.readdirSync(JOKES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const parts = parseFilename(f);
      if (!parts) return null;
      const content = fs.readFileSync(path.join(JOKES_DIR, f), 'utf8');
      return { filename: f, parts, content };
    })
    .filter(Boolean)
    .sort((a, b) => b.filename.localeCompare(a.filename)); // newest first

  const jokes = files.map(({ filename, parts, content }) => {
    const title = extractTitle(content);
    const wordCount = countWords(content);
    const dateLabel = formatDate(parts);
    const id = slugify(filename.replace('.md', ''));
    const bodyHtml = mdToHtml(content);
    return { id, title, dateLabel, wordCount, bodyHtml };
  });

  const navItems = jokes
    .map(j => `<li><a href="#${j.id}">${j.title}</a></li>`)
    .join('\n        ');

  const cards = jokes.map(j => `
    <article class="joke-card" id="${j.id}">
      <header class="joke-header">
        <time class="joke-date">${j.dateLabel}</time>
        <span class="word-count">${j.wordCount} từ</span>
      </header>
      <div class="joke-body">
        ${j.bodyHtml}
      </div>
      <footer class="joke-footer">
        <a href="#top" class="back-top">↑ Lên đầu</a>
      </footer>
    </article>`).join('\n');

  const total = jokes.length;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Tuyển tập truyện cười ngắn tiếng Việt — mỗi truyện dưới 300 từ">
  <title>Kể Chuyện Cười</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #faf8f5;
      --surface:  #ffffff;
      --border:   #e8e2d9;
      --text:     #2c2a27;
      --muted:    #8a8278;
      --accent:   #c0392b;
      --accent-light: #fdf2f1;
      --shadow:   0 2px 12px rgba(0,0,0,0.07);
      --radius:   14px;
      --font:     'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      font-size: 17px;
      line-height: 1.8;
      -webkit-text-size-adjust: 100%;
    }

    /* ── HEADER ── */
    #top {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 20px 20px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    }

    .site-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .site-title .emoji { font-size: 1.3rem; }

    .site-subtitle {
      font-size: 0.8rem;
      color: var(--muted);
      margin-top: 2px;
      font-weight: 400;
    }

    /* ── NAV ── */
    .joke-nav {
      margin-top: 14px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 14px;
    }
    .joke-nav::-webkit-scrollbar { display: none; }

    .joke-nav ol {
      display: flex;
      gap: 8px;
      list-style: none;
      width: max-content;
    }

    .joke-nav a {
      display: block;
      padding: 6px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text);
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .joke-nav a:hover, .joke-nav a:focus {
      background: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
      outline: none;
    }

    /* ── MAIN ── */
    main {
      max-width: 680px;
      margin: 0 auto;
      padding: 24px 16px 60px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── CARDS ── */
    .joke-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .joke-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: var(--accent-light);
      border-bottom: 1px solid #f0d5d3;
      gap: 12px;
    }

    .joke-date {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: 0.01em;
    }

    .word-count {
      font-size: 0.7rem;
      color: #b07068;
      white-space: nowrap;
    }

    .joke-body {
      padding: 22px 20px;
    }

    .joke-body h1 {
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 16px;
      color: var(--text);
    }

    .joke-body h2 {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 16px 0 10px;
    }

    .joke-body h3 {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 14px 0 8px;
    }

    .joke-body p {
      margin-bottom: 14px;
      color: var(--text);
    }

    .joke-body p:last-child { margin-bottom: 0; }

    .joke-body strong { font-weight: 700; color: var(--text); }
    .joke-body em { font-style: italic; }

    .joke-body hr {
      border: none;
      border-top: 1px dashed var(--border);
      margin: 20px 0;
    }

    .joke-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      background: var(--bg);
      text-align: right;
    }

    .back-top {
      font-size: 0.75rem;
      color: var(--muted);
      text-decoration: none;
      font-weight: 500;
    }
    .back-top:hover { color: var(--accent); }

    /* ── FOOTER ── */
    .site-footer {
      text-align: center;
      padding: 24px 16px 40px;
      font-size: 0.75rem;
      color: var(--muted);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 400px) {
      body { font-size: 16px; }
      .joke-body { padding: 18px 16px; }
      .joke-header { padding: 12px 16px; }
    }
  </style>
</head>
<body>
  <div id="top">
    <div class="site-title">
      <span class="emoji">😄</span>
      Kể Chuyện Cười
    </div>
    <p class="site-subtitle">${total} truyện · mỗi truyện dưới 300 từ</p>
    <nav class="joke-nav" aria-label="Danh sách truyện">
      <ol>
        ${navItems}
      </ol>
    </nav>
  </div>

  <main>
    ${cards}
  </main>

  <footer class="site-footer">
    Trang được tạo tự động từ các file markdown trong thư mục <code>jokes/</code>
  </footer>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log(`✓ Đã tạo index.html với ${total} truyện cười`);
  jokes.forEach(j => console.log(`  · ${j.title} (${j.wordCount} từ)`));
}

buildSite();
