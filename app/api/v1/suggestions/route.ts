// app/api/v1/suggestions/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export type DocumentSuggestion = {
  id: string;
  document_id: string;
  user_id?: string;
  author_name: string;
  selected_text: string;
  suggested_text: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

// Global server-side in-memory suggestions store fallback
const globalServerSuggestionsMap = new Map<string, DocumentSuggestion[]>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    // Attempt to fetch from Supabase table
    const { data: sugs, error } = await supabase
      .from('document_suggestions')
      .select('*')
      .eq('document_id', docId)
      .order('created_at', { ascending: false });

    if (!error && sugs) {
      globalServerSuggestionsMap.set(docId, sugs);
      return NextResponse.json({ suggestions: sugs });
    }

    const list = globalServerSuggestionsMap.get(docId) || [];
    return NextResponse.json({ suggestions: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { docId, userId, authorName, selectedText, suggestedText, suggestionId } = body;

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    const newSug: DocumentSuggestion = {
      id: suggestionId || `sug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      document_id: docId,
      user_id: userId || 'co-editor',
      author_name: authorName || 'Collaborator',
      selected_text: selectedText || '',
      suggested_text: suggestedText || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Attempt to insert into Supabase table
    const { data, error } = await supabase
      .from('document_suggestions')
      .insert({
        id: newSug.id,
        document_id: docId,
        user_id: userId,
        author_name: authorName,
        selected_text: selectedText,
        suggested_text: suggestedText,
        status: 'pending'
      })
      .select()
      .single();

    let list = globalServerSuggestionsMap.get(docId) || [];
    if (!error && data) {
      const exists = list.some(s => s.id === data.id);
      if (!exists) list.unshift(data);
    } else {
      const exists = list.some(s => s.id === newSug.id);
      if (!exists) list.unshift(newSug);
    }
    globalServerSuggestionsMap.set(docId, list);

    return NextResponse.json({ success: true, suggestion: data || newSug, suggestions: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { docId, suggestionId, status } = body;

    if (!docId || !suggestionId) {
      return NextResponse.json({ error: 'Missing docId or suggestionId' }, { status: 400 });
    }

    // Attempt to update status in Supabase table
    await supabase
      .from('document_suggestions')
      .update({ status: status || 'accepted' })
      .eq('id', suggestionId);

    const list = globalServerSuggestionsMap.get(docId) || [];
    const item = list.find(s => s.id === suggestionId);
    if (item) {
      item.status = status || 'accepted';
    }

    return NextResponse.json({ success: true, suggestion: item, suggestions: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
