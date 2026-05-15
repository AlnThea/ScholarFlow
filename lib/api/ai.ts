export type ImproveWritingResponse = {
  original_text: string;
  improved_text: string;
  tone: string;
  disclaimer: string;
};

export async function improveWriting(
  apiBaseUrl: string,
  text: string,
  tone = 'academic',
): Promise<ImproveWritingResponse> {
  const response = await fetch(`${apiBaseUrl}/ai/improve-writing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, tone }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to improve writing.');
  }

  return (await response.json()) as ImproveWritingResponse;
}
