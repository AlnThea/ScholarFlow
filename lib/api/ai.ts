// lib/api/ai.ts
// AI writing improvement helper — memanggil /api/improve-writing (Next.js route)

export type ImproveWritingResponse = {
  original_text: string;
  improved_text: string;
  tone: string;
  disclaimer: string;
};

export async function improveWriting(
  text: string,
  tone = 'academic',
  model = 'gemini',
  language = 'en'
): Promise<ImproveWritingResponse> {
  const response = await fetch('/api/v1/ai/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone, model, language }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to improve writing.');
  }

  return (await response.json()) as ImproveWritingResponse;
}

export async function synthesizeLiteratureReview(
  references: Array<{
    title: string;
    authors: string[];
    year?: number;
    source: string;
    label: string;
  }>,
  model = 'gemini',
  language = 'en'
): Promise<{ synthesized_text: string; disclaimer?: string }> {
  const response = await fetch('/api/v1/ai/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ references, model, language }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to synthesize literature review.');
  }

  return (await response.json()) as { synthesized_text: string; disclaimer?: string };
}

export type GenerateAbstractResponse = {
  abstract_text: string;
  disclaimer: string | null;
};

export async function generateAbstract(
  text: string,
  model = 'gemini',
  language = 'en'
): Promise<GenerateAbstractResponse> {
  const response = await fetch('/api/v1/ai/abstract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model, language }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to generate abstract.');
  }

  return (await response.json()) as GenerateAbstractResponse;
}
