// app/api/v1/suggestions/route.ts
import { NextResponse } from 'next/server';

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

// Global server-side in-memory suggestions store (persisted per document in server memory)
const globalServerSuggestionsMap = new Map<string, DocumentSuggestion[]>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
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

    let list = globalServerSuggestionsMap.get(docId);
    if (!list) {
      list = [];
      globalServerSuggestionsMap.set(docId, list);
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

    list.unshift(newSug);

    return NextResponse.json({ success: true, suggestion: newSug, suggestions: list });
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
