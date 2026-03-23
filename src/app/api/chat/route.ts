import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
If the request is off-topic or impossible:
{
  "error": "Professional explanation of why I cannot answer this (e.g., policy or missing data)."
}
Do not include markdown tags, preamble, or trailing text.
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ response: 'API Key not configured. Please set GEMINI_API_KEY in .env.local' });
    }

    // Phase 1: Text to SQL
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: SCHEMA_CONTEXT,
        temperature: 0.1,
      }
    });

    const rawText = response.text || '';
    
    // Clean up markdown markers if LLM adds them
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('\`\`\`json')) {
      cleanedText = cleanedText.substring(7);
      if (cleanedText.endsWith('\`\`\`')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    } else if (cleanedText.startsWith('\`\`\`')) {
      cleanedText = cleanedText.substring(3);
      if (cleanedText.endsWith('\`\`\`')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    }
    
    let parsedParams;
    try {
      parsedParams = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse LLM JSON:', cleanedText);
      return NextResponse.json({ response: 'Sorry, I couldn`t formulate a query for that. Please try rephrasing.' });
    }

    if (parsedParams.error) {
      return NextResponse.json({ response: parsedParams.error });
    }

    if (!parsedParams.sql) {
      return NextResponse.json({ response: 'I could not generate a valid query for your request.' });
    }

    // Phase 2: Execute SQL safely (Read Only)
    let sqlResults;
    try {
      const db = getDb();
      // Only allow SELECT statements
      if (!parsedParams.sql.trim().toUpperCase().startsWith('SELECT')) {
         return NextResponse.json({ response: 'Only SELECT queries are permitted.' });
      }
      sqlResults = db.prepare(parsedParams.sql).all();
    } catch (dbError: any) {
      return NextResponse.json({ response: `Query failed: ${dbError.message}\n\nAttempted SQL:\n${parsedParams.sql}` });
    }

    // Limit results if too large
    if (sqlResults.length > 50) {
      sqlResults = sqlResults.slice(0, 50);
      sqlResults.push({ _note_: 'Results truncated to top 50 rows for display.' });
    }

    // Phase 3: NL Generation from SQL Results
    const finalPrompt = `
User Question: ${message}
Generated SQL: ${parsedParams.sql}
Query Results (JSON): ${JSON.stringify(sqlResults)}

Based on the query results, provide a clear, natural language answer to the user's question. 
If the results refer to document numbers, format them clearly. Mention explicitly if the result was truncated.
Make the final answer directly address the question without showing the raw JSON.
`;

    const finalResponse = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    return NextResponse.json({ 
      response: finalResponse.text,
      debug: { sql: parsedParams.sql, data: sqlResults }
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
