// app/api/v1/ai/history/route.ts
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { fetchUserAiHistory, deleteUserAiHistory } from '@/lib/ai/server-ai-logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const history = await fetchUserAiHistory(userId, limit);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error in GET /api/v1/ai/history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    let id = searchParams.get('id');
    let clearAll = searchParams.get('clearAll') === 'true';

    // Fallback: check json body if not in query params
    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId;
        id = body.id;
        clearAll = body.clearAll || false;
      } catch (_) {
        // body might be empty
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const success = await deleteUserAiHistory(userId, id || undefined, clearAll);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in DELETE /api/v1/ai/history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
