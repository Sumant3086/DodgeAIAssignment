import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SCHEMA_CONTEXT = `
You are an expert data analyst for SAP Order-to-Cash (O2C) flows.
The dataset is stored in a local SQLite database.

CORE TABLES & RELATIONSHIPS:
1. sales_order_headers (salesOrder, soldToParty) -> soldToParty is the CUSTOMER ID.
2. sales_order_items (salesOrder, salesOrderItem, material, netAmount) -> material is the PRODUCT ID.
3. outbound_delivery_headers (deliveryDocument, overallGoodsMovementStatus)
4. outbound_delivery_items (deliveryDocument, referenceSdDocument as salesOrder)
5. billing_document_headers (billingDocument, accountingDocument as journalEntry, soldToParty)
6. billing_document_items (billingDocument, referenceSdDocument as salesOrder or deliveryDocument, material)
7. journal_entry_items_accounts_receivable (accountingDocument, clearingAccountingDocument as payment)
8. business_partners (businessPartner, businessPartnerName) -> JOIN here to get Customer Names.
9. products (material, productGroup)

QUERY RULES:
• "Who is the customer?" -> JOIN sales_order_headers or billing_document_headers with business_partners on soldToParty = businessPartner.
• "What is the product?" -> Use the 'material' column in items tables.
• ALWAYS use specific column names from the schema above.
• ALWAYS use single quotes ('') for string literals or values in WHERE clauses.

OUTPUT FORMAT:
You MUST return ONLY a raw JSON object with this structure:
{
  "sql": "SELECT ...",
  "explanation": "Brief reasoning for this query"
}
If the request is off-topic or impossible: { "error": "Reason" }
Do not include markdown tags.
`;

async function callLLM(systemPrompt: string, userPrompt: string): Promise<{ text: string, provider: string }> {
  const isGroq = process.env.GROK_API_KEY?.startsWith('gsk_');
  const useGrok = !!process.env.GROK_API_KEY;
  const useGemini = !!process.env.GEMINI_API_KEY;

  console.log(`[DEBUG] callLLM: useGrok=${useGrok}, isGroq=${isGroq}, useGemini=${useGemini}`);

  // Try Primary (Grok/Groq)
  if (useGrok) {
    try {
      const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';
      const providerName = isGroq ? 'groq' : 'grok';
      
      console.log(`[DEBUG] Trying Grok/Groq: endpoint=${endpoint}, model=${model}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0,
          response_format: isGroq ? undefined : { type: 'json_object' }
        })
      });
      const json = await response.json();
      if (json.choices?.[0]?.message?.content) {
        console.log(`[DEBUG] Grok/Groq Success: provider=${providerName}`);
        return { text: json.choices[0].message.content, provider: providerName };
      }
      console.warn('[DEBUG] Grok/Groq failed to return content, falling back to Gemini:', JSON.stringify(json));
    } catch (e: any) {
      console.error('[DEBUG] Error calling Grok/Groq:', e.message);
    }
  }

  // Try Fallback (Gemini)
  if (useGemini) {
    try {
      console.log('[DEBUG] Trying Gemini: gemini-1.5-flash');
      // Use gemini-1.5-flash as the most stable string for 1.5
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: systemPrompt });
      const result = await model.generateContent(userPrompt);
      const resp = await result.response;
      console.log('[DEBUG] Gemini Success: gemini-1.5-flash');
      return { text: resp.text(), provider: 'gemini-1.5-flash' };
    } catch (e: any) {
      console.error('[DEBUG] Gemini 1.5-flash failed:', e.message);
      // Try gemini-1.5-flash-latest if gemini-1.5-flash 404s
      if (e.message.includes('404') || e.message.includes('not found')) {
        console.log('[DEBUG] Gemini 404 detected, trying gemini-1.5-flash-latest');
        try {
           const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest', systemInstruction: systemPrompt });
           const result = await fallbackModel.generateContent(userPrompt);
           const resp = await result.response;
           console.log('[DEBUG] Gemini Success: gemini-1.5-flash-latest');
           return { text: resp.text(), provider: 'gemini-1.5-flash-latest' };
        } catch (e2: any) {
           console.error('[DEBUG] Gemini 1.5-flash-latest also failed:', e2.message);
           console.log('[DEBUG] Trying stable gemini-pro');
           const ultraFallback = genAI.getGenerativeModel({ model: 'gemini-pro' });
           const result = await ultraFallback.generateContent(`${systemPrompt}\n\nUser Question: ${userPrompt}`);
           const resp = await result.response;
           console.log('[DEBUG] Gemini Success: gemini-pro');
           return { text: resp.text(), provider: 'gemini-pro' };
        }
      }
      throw e;
    }
  }

  throw new Error('No functional LLM provider available.');
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const useGrok = !!process.env.GROK_API_KEY;
    const canUseGemini = !!process.env.GEMINI_API_KEY;

    if (!useGrok && !canUseGemini) {
      return NextResponse.json({ response: 'No API Keys configured. Please set GEMINI_API_KEY or GROK_API_KEY.' });
    }

    // Phase 1: Text to SQL
    const { text: rawText } = await callLLM(SCHEMA_CONTEXT, message);
    
    // Clean up markdown markers if LLM adds them
    let cleanedText = rawText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    let parsedParams;
    try {
      parsedParams = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse LLM JSON:', cleanedText);
      return NextResponse.json({ response: 'Sorry, I couldn`t formulate a query for that. Please try rephrasing.' });
    }

    if (parsedParams.error) return NextResponse.json({ response: parsedParams.error });
    if (!parsedParams.sql) return NextResponse.json({ response: 'I could not generate a valid query.' });

    // Phase 2: Execute SQL safely (Read Only)
    let sqlResults;
    try {
      const db = getDb();
      if (!parsedParams.sql.trim().toUpperCase().startsWith('SELECT')) {
         return NextResponse.json({ response: 'Only SELECT queries are permitted.' });
      }
      sqlResults = db.prepare(parsedParams.sql).all();
    } catch (dbError: any) {
      return NextResponse.json({ response: `Query failed: ${dbError.message}` });
    }

    // Limit results
    if (sqlResults.length > 50) {
      sqlResults = sqlResults.slice(0, 50);
      sqlResults.push({ _note_: 'Truncated to top 50 rows.' });
    }

    // Phase 3: NL Generation
    const finalPrompt = `User Question: ${message}\nSQL Results: ${JSON.stringify(sqlResults)}\n\nBased on these results, provide a clear, professional answer to the user.`;
    const { text: finalAnswer, provider } = await callLLM("You are a helpful SAP analyst. Summarize data clearly.", finalPrompt);

    return NextResponse.json({ 
      response: finalAnswer,
      debug: { provider, sql: parsedParams.sql }
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
