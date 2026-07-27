---
name: Tailwind v4 font loading
description: Avoid @import url() for Google Fonts in the same CSS file as @plugin/@theme; use a link tag in index.html.
---

Tailwind CSS v4 with `@plugin` and `@theme` directives in the same file can emit a PostCSS warning when a Google Fonts `@import url()` is present:

```
@import must precede all other statements (besides @charset or empty @layer)
```

**Why:** PostCSS processes the `@plugin`/`@theme` statements before the font `@import`, and the CSS parser sees the font import as out of order. Even moving the import near the top of the file may not resolve it because the generated output can reorder it.

**How to apply:** Load Google Fonts via `<link>` tags in `index.html` and remove the `@import url()` from `src/index.css`. The `index.html` already has `preconnect` entries; add the desired font `href` there.
