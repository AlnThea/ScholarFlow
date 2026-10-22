// app/api/v1/ai/paper-chat/route.ts
// Interactive "Chat with Paper / Literature" Assistant (Phase 23)
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedCitationSentence?: string;
  timestamp?: string;
}

function buildPaperChatPrompt(params: {
  paperTitle: string;
  paperAuthors: string[];
  paperYear?: number | null;
  paperJournal?: string | null;
  paperAbstract?: string | null;
  citationLabel?: string | null;
  question: string;
  history: ChatMessage[];
  language: 'en' | 'id';
}): string {
  const {
    paperTitle,
    paperAuthors,
    paperYear,
    paperJournal,
    paperAbstract,
    citationLabel,
    question,
    history,
    language,
  } = params;

  const isEn = language === 'en';
  const authorsStr = paperAuthors && paperAuthors.length > 0 ? paperAuthors.join(', ') : 'Unknown Author';
  const yearStr = paperYear ? String(paperYear) : (isEn ? 'n.d.' : 't.t.');
  const labelStr = citationLabel || (paperAuthors && paperAuthors[0] ? `${paperAuthors[0]}, ${yearStr}` : 'Ref');

  // Format previous conversation context (up to 4 turns)
  const recentHistory = history.slice(-4);
  const formattedHistory = recentHistory
    .map((msg) => `${msg.role === 'user' ? 'Researcher' : 'Paper AI'}: ${msg.content}`)
    .join('\n');

  if (isEn) {
    return `You are a distinguished peer reviewer and academic research assistant.
You are helping a researcher analyze and query a specific academic paper in their library.

TARGET RESEARCH PAPER CONTEXT:
- Title: "${paperTitle}"
- Authors: ${authorsStr}
- Year: ${yearStr}
- Journal / Source: ${paperJournal || 'Academic Source'}
- Citation Reference Label: [${labelStr}]
- Abstract & Summary:
"""
${paperAbstract || 'No full abstract provided. Infer research context from title, authors, and established domain literature.'}
"""

${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}
RESEARCHER QUESTION:
"${question}"

YOUR INSTRUCTIONS:
1. Provide an insightful, precise, and academically grounded answer addressing the researcher's query based on the paper's contents.
2. Focus specifically on:
   - Methodology & research design
   - Sample size, datasets, or experimental setup
   - Key findings, quantitative evidence, or contributions
   - Study limitations or threats to validity
   - Theoretical or practical implications
3. Also generate a concise, formal academic synthesis sentence (1-2 sentences) citing this paper that the researcher can directly insert into their academic paper or literature review.
4. CRITICAL SAFETY & SCOPE GUARDRAIL:
   - You are strictly an academic literature research assistant analyzing this specific research paper.
   - You do NOT have any access to the application database, user accounts, system commands, or external networks.
   - If the researcher asks you to write unrelated software, build websites, provide code unrelated to the paper, perform system commands, or discuss non-academic off-topic matters, POLITELY REFUSE in formal academic tone and steer back to the research paper:
     e.g. "I am designed specifically to analyze and synthesize this academic paper. Please ask questions regarding this study's methodology, data, findings, or theoretical framework."

OUTPUT FORMAT:
You MUST reply strictly in JSON format matching this schema:
{
  "answer": "Your detailed, elegant academic answer using markdown for readability...",
  "extractedInsights": {
    "methodology": "Summary of methodology used...",
    "sampleSize": "Dataset / sample size details...",
    "keyFindings": "Main findings and discoveries...",
    "limitations": "Study limitations or constraints..."
  },
  "suggestedCitationSentence": "A formal academic sentence synthesizing this finding, ending with citation tag like [${labelStr}]."
}
`;
  }

  // Indonesian prompt
  return `Anda adalah seorang reviewer jurnal terakreditasi dan asisten peneliti akademik senior.
Tugas Anda adalah membantu peneliti menggali wawasan mendalam dari paper riset yang tersimpan di perpustakaan mereka.

KONTEKS PAPER RUJUKAN:
- Judul: "${paperTitle}"
- Penulis: ${authorsStr}
- Tahun: ${yearStr}
- Jurnal / Penerbit: ${paperJournal || 'Sumber Akademik'}
- Label Sitasi: [${labelStr}]
- Abstrak & Ringkasan Paper:
"""
${paperAbstract || 'Abstrak lengkap tidak disertakan. Ekstrapolasikan wawasan ilmiah dari judul, penulis, dan domain riset terkait.'}
"""

${formattedHistory ? `RIWAYAT PERCAKAPAN SEBELUMNYA:\n${formattedHistory}\n\n` : ''}
PERTANYAAN PENELITI:
"${question}"

PETUNJUK JAWABAN:
1. Berikan jawaban yang tajam, faktual, dan berbasis literatur akademik untuk menjawab pertanyaan peneliti.
2. Sorot aspek-aspek kunci riset seperti:
   - Metodologi dan desain penelitian
   - Ukuran sampel, dataset, atau instrumen yang digunakan
   - Temuan utama, korelasi, atau kontribusi ilmiah
   - Batasan riset (limitations) atau ancaman validitas
   - Implikasi teoritis dan praktis
3. Sertakan pula 1 kalimat sintesis formal ilmiah yang siap disalin/disisipkan langsung ke dalam naskah skripsi/jurnal lengkap dengan rujukan sitasi [${labelStr}].
4. ATURAN PEMBATASAN & KEAMANAN KETAT (CRITICAL GUARDRAIL):
   - Anda adalah asisten analisis paper ilmiah akademik khusus.
   - Anda TIDAK MEMILIKI akses ke database aplikasi, kredensial pengguna, file server, maupun eksekusi perintah sistem.
   - Jika pengguna meminta Anda membuat kode di luar konteks paper (seperti membuat website, coding game/aplikasi, hacking, resep masakan, dll) atau hal di luar lingkup karya ilmiah ini, TOLAK SECARA SOPAN DAN TEGAS:
     "Mohon maaf, saya dirancang khusus sebagai asisten riset untuk membedah dan menganalisis paper ilmiah ini. Silakan ajukan pertanyaan seputar metodologi, data sampel, atau temuan dari riset ini."

FORMAT OUTPUT:
Anda WAJIB menjawab HANYA dalam format JSON yang valid persis seperti ini:
{
  "answer": "Jawaban komprehensif berbobot akademik menggunakan markdown untuk kejelasan...",
  "extractedInsights": {
    "methodology": "Ringkasan metodologi yang dipakai...",
    "sampleSize": "Informasi ukuran sampel / dataset...",
    "keyFindings": "Temuan utama dan kontribusi riset...",
    "limitations": "Batasan atau kelemahan penelitian..."
  },
  "suggestedCitationSentence": "Kalimat sintesis formal ilmiah siap kutip, diakhiri rujukan [${labelStr}]."
}
`;
}

/**
 * Panggilan ke Gemini dengan multi-key failover
 */
async function callGeminiForPaperChat(
  prompt: string,
  modelName: string,
  customApiKey?: string
): Promise<string> {
  const { result } = await geminiKeyPool.execute<string>(
    async (apiKey) => {
      const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            topP: 0.85,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return text;
    },
    customApiKey
  );

  return result;
}

/**
 * Panggilan terpadu ke API OpenRouter
 */
async function callOpenRouter(prompt: string, model: string, customApiKey?: string): Promise<string> {
  const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://scholarflow.app',
      'X-Title': 'ScholarFlow',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.25,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return text;
}

/**
 * Fallback response if AI call fails
 */
function buildFallbackResponse(params: {
  paperTitle: string;
  paperAuthors: string[];
  paperYear?: number | null;
  citationLabel?: string | null;
  question: string;
  language: 'en' | 'id';
}) {
  const isQuestionIndonesian = /[\b](yang|dan|berapa|apa|bagaimana|adalah|di|ke|pada|untuk|dari|sampel|metode|penelitian)[\b]/i.test(params.question);
  const isEn = params.language === 'en' && !isQuestionIndonesian;
  const authorLead = params.paperAuthors && params.paperAuthors[0] ? params.paperAuthors[0] : (isEn ? 'The authors' : 'Penulis');
  const yr = params.paperYear || (isEn ? 'n.d.' : 't.t.');
  const label = params.citationLabel || 'Ref';

  if (isEn) {
    return {
      answer: `Based on the literature record for "${params.paperTitle}", ${authorLead} et al. (${yr}) address key methodological approaches and empirical evidence relevant to your inquiry. Please ensure an active AI model (such as OpenRouter or Gemini) is connected for in-depth full-text extraction.`,
      extractedInsights: {
        methodology: 'Empirical quantitative / qualitative assessment as specified in the paper.',
        sampleSize: 'Documented within primary dataset.',
        keyFindings: `Primary contributions articulated by ${authorLead} et al. (${yr}).`,
        limitations: 'Subject to domain scope and study boundaries.',
      },
      suggestedCitationSentence: `According to ${authorLead} et al. (${yr}), empirical findings provide crucial theoretical and practical implications [${label}].`,
    };
  }

  return {
    answer: `Berdasarkan catatan literatur untuk paper "${params.paperTitle}", ${authorLead} et al. (${yr}) mengkaji aspek metodologis dan data empiris terkait topik penelitian ini. Untuk membedah isi teks secara mendalam, pastikan model AI (seperti OpenRouter atau Gemini) sudah terhubung aktif.`,
    extractedInsights: {
      methodology: 'Pendekatan empiris terstruktur sesuai bidang kajian.',
      sampleSize: 'Didokumentasikan pada dataset primer riset.',
      keyFindings: `Temuan utama dan kontribusi ilmiah oleh ${authorLead} et al. (${yr}).`,
      limitations: 'Terikat pada cakupan domain dan batasan penelitian.',
    },
    suggestedCitationSentence: `Menurut temuan ${authorLead} et al. (${yr}), bukti empiris menunjukkan adanya kontribusi signifikan terhadap perkembangan kajian ilmiah [${label}].`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      referenceId,
      paperTitle,
      paperAuthors = [],
      paperYear = null,
      paperJournal = null,
      paperAbstract = '',
      paperDoi = null,
      paperUrl = null,
      citationLabel = null,
      question,
      conversationHistory = [],
      model = 'gemini-1.5-flash',
      language = 'id',
      userId,
      userPlan = 'free',
    } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    if (!referenceId) {
      return NextResponse.json({ error: 'referenceId is required.' }, { status: 400 });
    }

    // 1. Smart Idempotency Cache Check (5 minutes cache for identical question & paper)
    const idempotencyKey = generateIdempotencyKey(
      userId || 'anon',
      'paper_chat',
      `${referenceId}:${language}`,
      question.trim().toLowerCase()
    );
    const cachedResponse = getIdempotentAiResponse<any>(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        is_idempotent_hit: true,
        tokens_consumed: 0,
      });
    }

    // 2. Personal Token Quota Guard
    const estimatedCost = estimateTokens(question + (paperAbstract || ''));
    const quotaCheck = await checkPersonalQuota(userId, userPlan);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Personal monthly AI token quota exceeded.',
          quotaExceeded: true,
          tokensUsed: quotaCheck.used,
          monthlyQuota: quotaCheck.limit,
          remainingTokens: quotaCheck.remaining,
          percentUsed: quotaCheck.percentUsed,
        },
        { status: 403 }
      );
    }

    // 3. Multi-Tenant Dedicated Key Resolver
    const tenantKeyRes = await resolveTenantKey({
      userId,
      userPlan,
      category: 'text',
    });

    // 4. Background Task Tracker (ChatGPT-Style Logger)
    let aiGenerationId: string | null = null;
    if (userId) {
      aiGenerationId = await createPendingAiGeneration({
        userId,
        featureType: 'paper_qa',
        originalText: `[Paper: ${paperTitle || referenceId}] Q: ${question}`,
        tone: 'academic_qa',
        model,
        metadata: {
          referenceId,
          paperTitle,
          language,
        },
      });
    }

    // 5. Construct Prompt & Call AI
    const prompt = buildPaperChatPrompt({
      paperTitle: paperTitle || 'Academic Research Article',
      paperAuthors,
      paperYear,
      paperJournal,
      paperAbstract,
      citationLabel,
      question: question.trim(),
      history: conversationHistory,
      language: language === 'en' ? 'en' : 'id',
    });

    // 5. Query models & providers from DB
    const dbClient = supabaseAdmin || supabase;
    const { data: dbModels, error: dbError } = await dbClient
      .from('ai_models')
      .select('*');
    const { data: dbProviders } = await dbClient
      .from('ai_providers')
      .select('*');

    if (dbError) {
      console.warn('[PaperChat] Error loading dynamic models from DB:', dbError.message);
    }

    const providersList: any[] = dbProviders || [
      { id: 'gemini', name: 'Google Gemini Direct', type: 'gemini' },
      { id: 'openrouter', name: 'OpenRouter API', type: 'openrouter' },
    ];

    const openRouterProvider = providersList.find(p => p.id === 'openrouter' || p.type === 'openrouter');
    const defaultOpenRouterKey = openRouterProvider?.api_key || process.env.OPENROUTER_API_KEY;

    const modelsList = dbModels || [
      { id: 'gemini', name: 'Gemini Flash (Direct)', model_id: 'gemini-1.5-flash', is_enabled: true, is_premium: false },
      { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false },
      { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false },
      { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true }
    ];

    const getModelKey = (item: any) => {
      const provider = providersList.find(p => p.id === (item.provider_id || item.provider_type));
      return provider?.api_key || item.custom_api_key || defaultOpenRouterKey;
    };

    const chosenModel = modelsList.find(m => m.id === model || m.model_id === model);
    const attempts: { name: string; run: () => Promise<string> }[] = [];

    if (chosenModel && chosenModel.is_enabled) {
      if (chosenModel.id === 'gemini') {
        attempts.push({
          name: chosenModel.name,
          run: () => callGeminiForPaperChat(prompt, chosenModel.model_id, tenantKeyRes.customKey)
        });
      } else {
        const key = getModelKey(chosenModel);
        attempts.push({
          name: chosenModel.name,
          run: () => callOpenRouter(prompt, chosenModel.model_id, key)
        });
      }
    } else if (model === 'gemini' || model === 'gemini-1.5-flash') {
      attempts.push({
        name: 'Gemini Flash (Direct)',
        run: () => callGeminiForPaperChat(prompt, 'gemini-1.5-flash', tenantKeyRes.customKey)
      });
    }

    // Masukkan model-model aktif non-premium lainnya sebagai antrean failover otomatis
    modelsList.forEach(item => {
      const isAlreadyTried = attempts.some(a => a.name.includes(item.name));
      if (item.is_enabled && !item.is_premium && !isAlreadyTried) {
        if (item.id === 'gemini') {
          attempts.push({
            name: `${item.name} (Fallback)`,
            run: () => callGeminiForPaperChat(prompt, item.model_id, tenantKeyRes.customKey)
          });
        } else {
          const key = getModelKey(item);
          attempts.push({
            name: `${item.name} (Fallback)`,
            run: () => callOpenRouter(prompt, item.model_id, key)
          });
        }
      }
    });

    if (defaultOpenRouterKey) {
      const hasMiniTried = attempts.some(a => a.name.includes('gpt-4o-mini'));
      if (!hasMiniTried) {
        attempts.push({
          name: 'GPT-4o-mini (OpenRouter Fallback)',
          run: () => callOpenRouter(prompt, 'openai/gpt-4o-mini', defaultOpenRouterKey)
        });
      }
    }

    let rawOutput = '';
    let parsedData: any = null;

    for (let i = 0; i < attempts.length; i++) {
      try {
        rawOutput = await attempts[i].run();

        const cleaned = rawOutput
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        parsedData = JSON.parse(cleaned);
        if (parsedData?.answer) {
          break;
        }
      } catch (err: any) {
        console.warn(`[PaperChat] Attempt ${i + 1} (${attempts[i].name}) failed:`, err.message);
      }
    }

    if (!parsedData || !parsedData.answer) {
      console.warn('[PaperChat] All AI model attempts failed, using structured fallback.');
      parsedData = buildFallbackResponse({
        paperTitle: paperTitle || 'Academic Paper',
        paperAuthors,
        paperYear,
        citationLabel,
        question: question.trim(),
        language: language === 'en' ? 'en' : 'id',
      });
    }

    const answer = parsedData.answer || 'No answer generated.';
    const extractedInsights = parsedData.extractedInsights || {};
    const suggestedCitationSentence = parsedData.suggestedCitationSentence || '';

    // 6. Deduct Quota Tokens
    const actualTokens = Math.max(estimateTokens(question + answer), 20);
    let quotaRemaining = quotaCheck.remaining;
    let quotaRecord: any = null;
    if (userId) {
      quotaRecord = await recordPersonalTokenConsumption(userId, actualTokens);
      quotaRemaining = quotaRecord.remaining;

      if (aiGenerationId) {
        await completeAiGeneration(aiGenerationId, {
          resultText: answer,
          tokensConsumed: actualTokens,
          metadata: {
            extractedInsights,
            suggestedCitationSentence,
          },
        });
      }
    }

    // 7. Prepare new messages and persist to Supabase paper_conversations
    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `ast_${Date.now() + 1}`,
      role: 'assistant',
      content: answer,
      suggestedCitationSentence,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...conversationHistory, userMessage, assistantMessage];

    if (userId) {
      const client = supabaseAdmin || supabase;
      try {
        await client
          .from('paper_conversations')
          .upsert(
            {
              user_id: userId,
              reference_id: referenceId,
              paper_title: paperTitle || null,
              paper_authors: paperAuthors || [],
              paper_year: paperYear || null,
              messages: updatedConversation,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,reference_id' }
          );
      } catch (dbErr) {
        console.warn('[PaperChat] Failed to persist conversation to DB:', dbErr);
      }
    }

    const responsePayload = {
      answer,
      extractedInsights,
      suggestedCitationSentence,
      conversation: updatedConversation,
      tokensConsumed: actualTokens,
      quotaRemaining,
      tokens_used: quotaRecord ? quotaRecord.used : undefined,
      monthly_quota: quotaRecord ? quotaRecord.limit : undefined,
    };

    // 8. Cache response (5 min TTL)
    setIdempotentAiResponse(idempotencyKey, responsePayload, 5 * 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('[PaperChat] Global handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process Paper Q&A request.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
      return NextResponse.json({ error: 'referenceId is required.' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const client = supabaseAdmin || supabase;

    // Fetch conversation
    const { data, error } = await client
      .from('paper_conversations')
      .select('messages, paper_title, updated_at')
      .eq('reference_id', referenceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: data?.messages || [],
      paperTitle: data?.paper_title || null,
      updatedAt: data?.updated_at || null,
    });
  } catch (err: any) {
    return NextResponse.json({ messages: [], error: err?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
      return NextResponse.json({ error: 'referenceId is required.' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('paper_conversations')
      .delete()
      .eq('reference_id', referenceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
