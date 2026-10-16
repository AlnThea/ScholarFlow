// app/api/v1/documents/[id]/revisions/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const docId = resolvedParams.id;

    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('document_revisions')
      .select('id, document_id, user_id, title, content, word_count, change_summary, is_auto_saved, created_at')
      .eq('document_id', docId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('Error fetching revisions from supabaseAdmin:', error);
      // Return empty array instead of 500 so client falls back to local storage
      return NextResponse.json({ revisions: [] });
    }

    return NextResponse.json({ revisions: data || [] });
  } catch (error) {
    console.error('Error in GET /api/v1/documents/[id]/revisions:', error);
    return NextResponse.json({ revisions: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const docId = resolvedParams.id;

    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { userId, user_id, title, content, wordCount, word_count, changeSummary, change_summary, isAutoSaved, is_auto_saved } = body;

    const payload = {
      document_id: docId,
      user_id: userId || user_id || '00000000-0000-0000-0000-000000000000',
      title: title || 'Untitled Document',
      content: typeof content === 'object' ? content : {},
      word_count: wordCount || word_count || 0,
      change_summary: changeSummary || change_summary || (isAutoSaved || is_auto_saved ? 'Auto-saved snapshot' : 'Manual checkpoint'),
      is_auto_saved: Boolean(isAutoSaved ?? is_auto_saved),
    };

    const { data, error } = await supabaseAdmin
      .from('document_revisions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Error inserting revision to supabaseAdmin:', error);
      // Return client-constructed revision on insert failure so UI functions uninterrupted
      return NextResponse.json({
        revision: {
          id: `local-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
        }
      });
    }

    return NextResponse.json({ revision: data });
  } catch (error) {
    console.error('Error in POST /api/v1/documents/[id]/revisions:', error);
    return NextResponse.json({ error: 'Failed to save revision' }, { status: 500 });
  }
}
