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
  model = 'gemini'
): Promise<ImproveWritingResponse> {
  const response = await fetch('/api/v1/ai/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone, model }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to improve writing.');
  }

  return (await response.json()) as ImproveWritingResponse;
}
