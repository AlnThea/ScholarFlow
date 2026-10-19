// lib/ai/ghostwrite-helper.ts

export function buildGhostwritePrompt(prefix: string, documentTitle?: string, language: string = 'en'): string {
  const isEn = language === 'en';
  const docContext = documentTitle ? `Document Title: "${documentTitle}"\n` : '';

  if (isEn) {
    return (
      `You are an elite academic co-writer and scholarly ghostwriter.\n` +
      `${docContext}` +
      `Your task is to predict and complete the user's sentence or thought with 1 to 2 cohesive, scholarly sentences that seamlessly continue the provided text.\n\n` +
      `Requirements:\n` +
      `- Write in high-level academic English with formal scholarly tone and objective cadence.\n` +
      `- Continue directly from the last word or punctuation mark without repeating any of the preceding text.\n` +
      `- Do NOT output quotation marks, markdown wrappers, greetings, explanations, or asterisks.\n` +
      `- Provide ONLY the exact continuation text that should immediately be appended.\n\n` +
      `Preceding Context:\n"""${prefix.slice(-600)}"""\n\n` +
      `Continuation:`
    );
  }

  return (
    `Anda adalah co-writer akademik senior dan asisten penulisan karya ilmiah.\n` +
    `${docContext}` +
    `Tugas Anda adalah melanjutkan kalimat atau alur pemikiran penulis dengan 1 sampai 2 kalimat akademik yang padat, kohesif, dan ilmiah.\n\n` +
    `Persyaratan:\n` +
    `- Tulis dalam Bahasa Indonesia formal berstandar skripsi/tesis/jurnal ilmiah.\n` +
    `- Lanjutkan langsung dari kata atau tanda baca terakhir tanpa mengulang teks sebelumnya.\n` +
    `- JANGAN menyertakan tanda petik, markdown bold/italic, salam, penjelasan, atau teks pembuka/penutup.\n` +
    `- Berikan HANYA teks kelanjutan yang akan langsung disambungkan ke kursor naskah.\n\n` +
    `Konteks Teks Sebelumnya:\n"""${prefix.slice(-600)}"""\n\n` +
    `Kelanjutan Teks:`
  );
}
