# Antigravity Rules

## UI/UX Guidelines
- **Dark Mode Support**: Always ensure UI components are fully compatible with both Light and Dark mode. When adding new Tailwind classes (e.g., `bg-white`, `text-slate-800`), you MUST always provide their `dark:` variants (e.g., `dark:bg-slate-900`, `dark:text-white`). Do not leave any element unresponsive to the theme toggle.

## Localization (Bilingual Support)
- **Bilingual Content (EN <-> ID)**: All user-facing text, labels, and placeholders must be built to support bilingual English and Indonesian text automatically. If a language state/toggle is available, implement a ternary condition (e.g., `isEn ? 'English Text' : 'Indonesian Text'`) to switch texts dynamically based on the active language.
