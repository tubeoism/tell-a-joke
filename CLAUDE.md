# Tell-a-Joke

Trang web truyện cười ngắn tiếng Việt, build bằng VitePress, deploy trên Cloudflare Pages.

## Cấu trúc

- `jokes/` — mỗi file là một truyện, tên file `yyyy-mm-dd-hh-mm.md` (giờ GMT+7)
- `.vitepress/` — config và custom theme (Layout.vue, style.css)
- Build output: `.vitepress/dist/`
- Branch duy nhất: `main`

## Định dạng truyện cười

```markdown
# Tiêu Đề Truyện

Đoạn mở đầu — giới thiệu nhân vật và tình huống (2–3 câu).

Đoạn giữa — phát triển, có thể có đối thoại (2–3 câu).

---

Đoạn kết — twist bất ngờ hoặc punch line hài hước (2–3 câu).
```

**Ràng buộc:**
- 150–200 từ
- Tiếng Việt tự nhiên, nhân vật dùng tên Việt (Minh, Lan, Nam, Hùng…)
- Dùng `**bold**` để nhấn từ khóa hài
- Kết thúc phải bất ngờ hoặc phản logic
- Chủ đề đa dạng: học đường, công sở, bệnh viện, gia đình, hàng xóm…
- Không có nội dung nhạy cảm, chính trị, tôn giáo

## Thêm truyện mới

```bash
# 1. Lấy giờ GMT+7
date -u -d '+7 hours' '+%Y-%m-%d-%H-%M'

# 2. Tạo file (dùng Write tool)
jokes/<yyyy-mm-dd-hh-mm>.md

# 3. Commit và push
git add jokes/<yyyy-mm-dd-hh-mm>.md
git commit -m "joke: <Tiêu đề> (<yyyy-mm-dd-hh-mm>)"
git push origin main
```

Chỉ tạo đúng 1 file mới. Không sửa file khác.
