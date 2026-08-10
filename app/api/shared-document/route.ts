export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// GET /api/shared-document?id=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('id');

  if (!docId) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  try {
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('id, title, content, settings, user_id, created_at, updated_at')
      .eq('id', docId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching shared document via admin client:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Enforce shareActive setting
    const settings = document.settings as any;
    if (!settings || !settings.shareActive) {
      return NextResponse.json({ error: 'Sharing link is inactive' }, { status: 403 });
    }

    // Fetch the owner's subscription plan from profiles separately to avoid PostgREST relationship mapping errors
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_plan')
      .eq('id', document.user_id)
      .maybeSingle();

    const ownerPlan = profile?.subscription_plan || 'free';

    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: document.content,
      settings: document.settings,
      user_id: document.user_id,
      created_at: document.created_at,
      updated_at: document.updated_at,
      ownerPlan
    });
  } catch (err) {
    console.error('Unexpected error fetching shared document:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/shared-document?id=...
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('id');

  if (!docId) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, content, settings: updatedSettings } = body;

    // 1. Fetch current document to check settings
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('id, settings')
      .eq('id', docId)
      .maybeSingle();

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const currentSettings = document.settings as any;
    if (!currentSettings || !currentSettings.shareActive) {
      return NextResponse.json({ error: 'Sharing is disabled' }, { status: 403 });
    }

    // Enforce edit permission
    if (currentSettings.sharePermission !== 'edit') {
      return NextResponse.json({ error: 'Permission denied: Read-only mode' }, { status: 403 });
    }

    // 2. Perform updates
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (updatedSettings !== undefined) updates.settings = updatedSettings;

    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', docId);

    if (updateError) {
      console.error('Error updating shared document via admin:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error updating shared document:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
