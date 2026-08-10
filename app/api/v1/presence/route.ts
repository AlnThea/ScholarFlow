// app/api/v1/presence/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';


type PresenceItem = {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  user_role: 'owner' | 'co-editor' | 'reader';
  last_seen_at: number;
};

// Global server-side in-memory presence store (shared across ALL browsers & devices)
const globalServerPresenceMap = new Map<string, Map<string, PresenceItem>>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { docId, userId, userName, userRole } = body;

    if (!docId || !userId) {
      return NextResponse.json({ error: 'Missing docId or userId' }, { status: 400 });
    }

    if (body.action === 'leave') {
      let docMap = globalServerPresenceMap.get(docId);
      if (docMap) {
        docMap.delete(userId);
      }
      return NextResponse.json({ success: true, left: true });
    }

    let docMap = globalServerPresenceMap.get(docId);
    if (!docMap) {
      docMap = new Map();
      globalServerPresenceMap.set(docId, docMap);
    }

    const item: PresenceItem = {
      id: `${docId}-${userId}`,
      document_id: docId,
      user_id: userId,
      user_name: userName || 'Collaborator',
      user_role: userRole || 'co-editor',
      last_seen_at: Date.now(),
    };

    docMap.set(userId, item);

    // Clean up stale users (> 25s old)
    const threshold = Date.now() - 25000;
    for (const [uid, p] of docMap.entries()) {
      if (p.last_seen_at < threshold) {
        docMap.delete(uid);
      }
    }

    const activeList = Array.from(docMap.values()).map(p => ({
      ...p,
      last_seen_at: new Date(p.last_seen_at).toISOString()
    }));

    return NextResponse.json({ success: true, activeUsers: activeList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    const docMap = globalServerPresenceMap.get(docId);
    if (!docMap) {
      return NextResponse.json({ activeUsers: [] });
    }

    const threshold = Date.now() - 25000;
    const activeList: PresenceItem[] = [];

    for (const [uid, p] of docMap.entries()) {
      if (p.last_seen_at >= threshold) {
        activeList.push(p);
      } else {
        docMap.delete(uid);
      }
    }

    const formatted = activeList.map(p => ({
      ...p,
      last_seen_at: new Date(p.last_seen_at).toISOString()
    }));

    return NextResponse.json({ activeUsers: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
