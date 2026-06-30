<script setup>
import { ref, onMounted } from 'vue'
import { data as jokes } from '../jokes.data.js'

// Dark mode — SSR-safe: state read after mount, CSS handles flash via .dark class
const dark = ref(false)

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark')
})

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('vitepress-theme-appearance', dark.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="app">

    <!-- ── sticky header ── -->
    <header id="top" class="site-header">
      <div class="header-row">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true">😄</span>
          <div>
            <p class="brand-name">Kể Chuyện Cười</p>
            <p class="brand-sub">{{ jokes.length }} truyện · mỗi truyện dưới 300 từ</p>
          </div>
        </div>

        <button class="dark-btn" @click="toggleDark" :aria-label="dark ? 'Chuyển sáng' : 'Chuyển tối'">
          <span v-if="dark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <!-- horizontal chip nav -->
      <nav class="chip-nav" aria-label="Danh sách truyện">
        <a v-for="j in jokes" :key="j.id" :href="`#${j.id}`" class="chip">
          {{ j.title }}
        </a>
      </nav>
    </header>

    <!-- ── joke feed ── -->
    <main class="feed">
      <article
        v-for="j in jokes"
        :key="j.id"
        :id="j.id"
        class="card"
      >
        <div class="card-meta">
          <time class="card-date">{{ j.dateLabel }}</time>
          <span class="card-words">{{ j.words }} từ</span>
        </div>

        <!-- VitePress-rendered markdown HTML -->
        <div class="card-body vp-content" v-html="j.html" />

        <a href="#top" class="card-top">↑ Lên đầu</a>
      </article>
    </main>

    <!-- ── footer ── -->
    <footer class="site-footer">
      Thêm truyện mới: tạo file <code>jokes/yyyy-mm-dd-hh-mm.md</code> rồi build lại
    </footer>

  </div>
</template>
