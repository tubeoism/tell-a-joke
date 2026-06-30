import { createContentLoader } from 'vitepress'

const DOW = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

function parsePath(url) {
  const m = url.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/)
  if (!m) return null
  const [, year, month, day, hour, minute] = m
  return { year, month, day, hour, minute }
}

function formatDate(p) {
  if (!p) return ''
  const d = new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00`)
  return `${DOW[d.getDay()]}, ${+p.day} tháng ${+p.month} năm ${p.year} · ${p.hour}:${p.minute}`
}

function extractTitle(src) {
  const m = (src || '').match(/^# (.+)$/m)
  return m ? m[1] : 'Truyện cười'
}

function countWords(src) {
  return (src || '').replace(/[#*`_\[\]()>-]/g, '').trim().split(/\s+/).length
}

export default createContentLoader('jokes/*.md', {
  render: true,
  includeSrc: true,
  transform(raw) {
    return raw
      .map(page => {
        // URL looks like /jokes/2026-06-30-07-00.html — strip extension for the ID
        const slug = (page.url.split('/').pop() || '').replace(/\.html$/, '')
        return {
          id:        'joke-' + slug,
          url:       page.url,
          title:     extractTitle(page.src),
          dateLabel: formatDate(parsePath(page.url)),
          words:     countWords(page.src),
          html:      page.html ?? '',
        }
      })
      .sort((a, b) => b.url.localeCompare(a.url)) // newest first
  },
})
