// lib/api/ai.ts
// AI writing improvement helper — memanggil /api/improve-writing (Next.js route)

export type ImproveWritingResponse = {
  original_text: string;
  improved_text: string;
  tone: string;
  disclaimer: string;
  tokens_consumed?: number;
  tokens_remaining?: number;
  monthly_quota?: number;
  tokens_used?: number;
  percent_used?: number;
};

export async function improveWriting(
  text: string,
  tone = 'academic',
  model = 'gemini',
  language = 'en',
  styleReference?: string,
  userId?: string,
  userPlan?: string
): Promise<ImproveWritingResponse> {
  const response = await fetch('/api/v1/ai/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone, model, language, styleReference, userId, userPlan }),
  });

  if (!response.ok) {
    let message = 'Failed to improve writing.';
    try {
      const errJson = await response.json();
      if (errJson?.error) message = errJson.error;
    } catch (_) {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return (await response.json()) as ImproveWritingResponse;
}

export type SynthesizeLiteratureResponse = {
  synthesized_text: string;
  disclaimer?: string;
  tokens_consumed?: number;
  tokens_remaining?: number;
  monthly_quota?: number;
  tokens_used?: number;
  percent_used?: number;
  tenant_source?: string;
  institution_name?: string | null;
};

export async function synthesizeLiteratureReview(
  references: Array<{
    title: string;
    authors: string[];
    year?: number;
    source: string;
    label: string;
  }>,
  model = 'gemini',
  language = 'en',
  userId?: string,
  userPlan?: string
): Promise<SynthesizeLiteratureResponse> {
  const response = await fetch('/api/v1/ai/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ references, model, language, userId, userPlan }),
  });

  if (!response.ok) {
    let message = 'Failed to synthesize literature review.';
    try {
      const errJson = await response.json();
      if (errJson?.error) message = errJson.error;
    } catch (_) {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return (await response.json()) as SynthesizeLiteratureResponse;
}

export type GenerateAbstractResponse = {
  abstract_text: string;
  disclaimer: string | null;
  tokens_consumed?: number;
  tokens_remaining?: number;
  monthly_quota?: number;
  tokens_used?: number;
  percent_used?: number;
};

export async function generateAbstract(
  text: string,
  model = 'gemini',
  language = 'en',
  userId?: string,
  userPlan?: string
): Promise<GenerateAbstractResponse> {
  const response = await fetch('/api/v1/ai/abstract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model, language, userId, userPlan }),
  });

  if (!response.ok) {
    let message = 'Failed to generate abstract.';
    try {
      const errJson = await response.json();
      if (errJson?.error) message = errJson.error;
    } catch (_) {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return (await response.json()) as GenerateAbstractResponse;
}
