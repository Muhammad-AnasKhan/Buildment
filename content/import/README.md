# Course import (staging)

Paste your existing course here — any layout is fine for now (folders, `.md`, `.mdx`, etc.).

When you are ready, share the path with the agent and it will be transformed into buildment’s structure:

- **Course** → `Course` record (title, slug, description, …)
- **Modules / sections** → `Module` rows
- **Lessons / pages** → `Chapter` rows with MDX in `Chapter.source`

Do not edit files under `content/transformed/` manually — that folder will be generated later.
