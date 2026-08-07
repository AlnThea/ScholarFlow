// lib/templates/empty.ts

export function getEmptyTemplate(language: 'en' | 'id', title: string) {
  return [
    {
      id: "header-" + Math.random().toString(36).substring(2, 9),
      type: "header",
      data: {
        text: title || (language === 'en' ? "Untitled Document" : "Dokumen Tanpa Judul"),
        level: 2
      }
    },
    {
      id: "para-" + Math.random().toString(36).substring(2, 9),
      type: "paragraph",
      data: {
        text: language === 'en' 
          ? "Start writing your academic journal draft here..." 
          : "Mulai menulis draf jurnal akademik Anda di sini..."
      }
    }
  ];
}
