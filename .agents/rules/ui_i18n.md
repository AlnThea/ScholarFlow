# UI Internationalization (i18n) Rules 🌐

All user interface elements, text labels, modal dialogs, buttons, placeholders, tooltips, table headers, and status badges in ScholarFlow MUST support full bilingual internationalization (`language === 'en'` vs `language === 'id'`).

## Strict Requirements
1. **Never Hardcode Mono-lingual UI Text**: Every visible string in UI components, modals, navigation bars, headers, sidebars, and admin panels MUST check `language === 'en'` (or use `useLanguage()`) to render the appropriate text in English or Indonesian.
2. **Component Dual Language Standard**:
   ```tsx
   const { language } = useLanguage();
   const isEn = language === 'en';

   return (
     <button>
       {isEn ? 'Save Changes' : 'Simpan Perubahan'}
     </button>
   );
   ```
3. **Form Placeholders & Tooltips**:
   Placeholders, error messages, warning banners, and button tooltips (`title="..."`) MUST also be translated dynamically based on `isEn`.
