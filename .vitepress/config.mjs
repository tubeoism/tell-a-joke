import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kể Chuyện Cười',
  description: 'Truyện cười ngắn tiếng Việt — mỗi truyện dưới 300 từ',
  lang: 'vi',
  // Joke files are consumed by the data loader only — not individual routes
  srcExclude: ['jokes/**/*.md'],
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
    }],
  ],
  // Disable features not needed for a feed site
  themeConfig: {},
})
