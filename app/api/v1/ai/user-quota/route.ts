// app/api/v1/ai/user-quota/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId') || 'free';

    const quota = await checkPersonalQuota(userId, planId);
    return NextResponse.json(quota);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to check token quota' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, tokensConsumed = 0, planId = 'free', sampleText } = body;

    let tokensToRecord = tokensConsumed;
    if (!tokensToRecord && sampleText) {
      tokensToRecord = estimateTokens(sampleText);
    }

    const result = await recordPersonalTokenConsumption(userId, tokensToRecord, planId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to record token consumption' },
      { status: 500 }
    );
  }
}
