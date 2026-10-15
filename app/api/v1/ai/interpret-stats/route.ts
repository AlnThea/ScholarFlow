import { NextResponse } from 'next/server';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import { StatsInterpretationResult } from '@/components/editor/stats-interpreter/stats-types';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';

export const maxDuration = 60; // 60 seconds timeout for multimodal vision

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { input, config, customApiKey, userId, userPlan } = payload;

    if (!input || (!input.base64Data && !input.rawText)) {
      return NextResponse.json(
        { error: 'Missing statistical input data (image or text table required).' },
        { status: 400 }
      );
    }

    const isEn = config?.language === 'en';
    const effectiveUserId = userId || config?.userId;
    const effectiveUserPlan = userPlan || config?.userPlan || 'free';

    // Personal Token Quota Guard
    const quotaCheck = await checkPersonalQuota(effectiveUserId, effectiveUserPlan);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Monthly AI token quota exceeded. Please upgrade to Pro for 1,000,000 tokens or configure a custom API key.'
            : 'Batas kuota token AI bulanan telah tercapai. Silakan tingkatkan ke Pro untuk 1.000.000 token atau gunakan API Key sendiri.',
          quotaExceeded: true,
          tokensUsed: quotaCheck.used,
          monthlyQuota: quotaCheck.limit,
          remainingTokens: quotaCheck.remaining,
          percentUsed: quotaCheck.percentUsed
        },
        { status: 403 }
      );
    }

    const software = config?.software || 'spss';
    const testType = config?.testType || 'auto';
    const style = config?.style || 'thesis';
    const hypothesis = config?.hypothesis ? `Hypothesis / Target: ${config.hypothesis}` : '';
    const researchQuestion = config?.researchQuestion
      ? `Research Context / Variables: ${config.researchQuestion}`
      : '';
    const provider = config?.aiProvider || 'gemini';
    const effectiveCustomKey = config?.customApiKey || customApiKey;

    // Construct specialized System & Instruction Prompt
    const prompt = `You are a Senior Quantitative Research Methodologist and Academic Statistical Analyst specializing in APA 7th Edition reporting standards.
Analyze the provided statistical output table from ${software.toUpperCase()} (${testType} test).

Research Context:
${hypothesis}
${researchQuestion}
Target Audience / Style: ${style.toUpperCase()} (e.g. Skripsi/Thesis/Journal).
Output Language: ${isEn ? 'Academic English' : 'Bahasa Indonesia Akademik formal standar penulisan skripsi/tesis'}.

Instructions:
1. Carefully inspect all rows, columns, coefficients, degrees of freedom (df), test statistics (t, F, r, z, beta), standard errors, and significance (p-value / Sig. 2-tailed).
2. Report statistical results strictly following APA 7th Edition rules (e.g., italicize statistics like *t*, *F*, *p*, *r*, *d*, *M*, *SD*; report *p* < .001 instead of p = .000; include effect size such as Cohen's d or R² where appropriate).
3. If hypothesis is provided, explicitly state whether the null hypothesis (H0) is rejected or fails to be rejected.
4. Provide the result in a STRICT JSON format with this exact schema:
{
  "title": "Short descriptive title of the test",
  "testType": "Detected statistical test name",
  "summary": "1-2 sentence high-level summary of the core finding",
  "narrativeAPA": "Complete, comprehensive multi-paragraph academic interpretation formatted in APA 7th Edition ready to be inserted directly into Chapter 4 (Results & Discussion). Include statistical notation in standard format.",
  "statisticalFindings": [
    {
      "statisticName": "e.g., t-value / F-value / Pearson r",
      "value": "e.g., -6.18",
      "degreesOfFreedom": "e.g., 48",
      "pValue": "e.g., < .001",
      "isSignificant": true,
      "interpretation": "Brief interpretation"
    }
  ],
  "apaTableMarkdown": "Clean Markdown formatted table of the key descriptive & inferential results adhering to APA Table guidelines (clean rows, standard headers, no vertical lines)",
  "recommendation": "1-2 sentences recommendation for discussion in manuscript"
}

Do NOT wrap with backticks other than \`\`\`json and \`\`\`. Ensure the JSON is completely valid and parseable.`;

    // Resolve Tenant Dedicated Campus Key for Vision/Multimodal Workload
    const tenantKeyRes = await resolveTenantKey({
      userId: userId || config?.userId,
      userPlan: userPlan || config?.userPlan,
      category: 'vision',
    });

    let rawResponseText = '';
    let usedModel = '';

    // Handle OpenAI Direct or OpenRouter
    if (provider === 'openai' || provider === 'openrouter') {
      const isOR = provider === 'openrouter';
      const defaultModel = isOR ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o';
      usedModel = config?.aiModel || defaultModel;
      const apiKey = effectiveCustomKey || (isOR ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

      if (!apiKey) {
        throw new Error(
          isEn
            ? `API Key for ${isOR ? 'OpenRouter' : 'OpenAI'} is required. Please provide a custom API key.`
            : `API Key untuk ${isOR ? 'OpenRouter' : 'OpenAI'} belum diisi. Harap masukkan API Key Anda di panel.`
        );
      }

      const endpoint = isOR
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const userContent: any[] = [];
      userContent.push({ type: 'text', text: prompt });

      if (input.type === 'image' && input.base64Data) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${input.mimeType || 'image/png'};base64,${input.base64Data}`,
          },
        });
      } else if (input.rawText) {
        userContent.push({
          type: 'text',
          text: `\n\n====================\nSTATISTICAL DATA TABLE CONTENT:\n====================\n${input.rawText}`,
        });
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(isOR
            ? {
                'HTTP-Referer': 'https://scholarflow.app',
                'X-Title': 'ScholarFlow Stats Interpreter',
              }
            : {}),
        },
        body: JSON.stringify({
          model: usedModel,
          messages: [{ role: 'user', content: userContent }],
          temperature: 0.2,
          ...(isOR ? {} : { response_format: { type: 'json_object' } }),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${isOR ? 'OpenRouter' : 'OpenAI'} returned ${res.status}: ${errText}`);
      }

      const resData = await res.json();
      rawResponseText = resData?.choices?.[0]?.message?.content || '';
    } else {
      // Default: Google Gemini Multimodal
      const contents: any[] = [];
      const parts: any[] = [];

      if (input.type === 'image' && input.base64Data) {
        parts.push({
          inlineData: {
            mimeType: input.mimeType || 'image/png',
            data: input.base64Data,
          },
        });
        parts.push({ text: prompt });
      } else {
        parts.push({
          text: `${prompt}\n\n====================\nSTATISTICAL DATA TABLE CONTENT:\n====================\n${input.rawText}`,
        });
      }

      contents.push({ role: 'user', parts });

      usedModel =
        config?.aiModel || process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

      const keyToUse = effectiveCustomKey || tenantKeyRes.customKey;
      const poolCategory = tenantKeyRes.category;

      const execution = await geminiKeyPool.execute(async (apiKey: string) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errObj = new Error(`Gemini API returned ${response.status}: ${errorText}`);
          (errObj as any).status = response.status;
          throw errObj;
        }

        return await response.json();
      }, keyToUse, poolCategory);

      rawResponseText = execution.result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // Clean and parse JSON
    let parsedResult: Partial<StatsInterpretationResult> = {};
    try {
      let cleaned = rawResponseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Could not parse response as strict JSON, building fallback:', parseErr);
      parsedResult = {
        title: isEn ? 'Statistical Output Interpretation' : 'Interpretasi Output Statistik',
        testType: testType,
        summary: isEn ? 'Statistical analysis completed.' : 'Analisis statistik berhasil diinterpretasikan.',
        narrativeAPA: rawResponseText,
        statisticalFindings: [],
        recommendation: '',
      };
    }

    const finalResult: StatsInterpretationResult = {
      id: `stats-${Date.now()}`,
      timestamp: Date.now(),
      software,
      testType: parsedResult.testType || testType,
      title: parsedResult.title || (isEn ? 'Statistical Output Analysis' : 'Analisis Output Statistik'),
      summary: parsedResult.summary || '',
      narrativeAPA: parsedResult.narrativeAPA || rawResponseText,
      statisticalFindings: parsedResult.statisticalFindings || [],
      apaTableMarkdown: parsedResult.apaTableMarkdown,
      recommendation: parsedResult.recommendation || '',
      rawResponse: rawResponseText,
      providerUsed: provider,
      modelUsed: usedModel,
    };

    const promptLength = prompt.length + (input.rawText ? input.rawText.length : 1000);
    const tokensConsumed = estimateTokens('x'.repeat(promptLength)) + estimateTokens(rawResponseText);
    const usageRecord = await recordPersonalTokenConsumption(effectiveUserId, tokensConsumed, effectiveUserPlan);

    return NextResponse.json({
      success: true,
      result: finalResult,
      providerUsed: provider,
      modelUsed: usedModel,
      tokens_consumed: tokensConsumed,
      tokens_remaining: usageRecord.remaining,
      monthly_quota: usageRecord.limit,
      tokens_used: usageRecord.used,
      percent_used: usageRecord.percentUsed,
      tenant_source: tenantKeyRes.source,
      institution_name: tenantKeyRes.institutionName || null,
    });
  } catch (error: any) {
    console.error('Stats interpretation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to interpret statistical data.',
      },
      { status: 500 }
    );
  }
}
