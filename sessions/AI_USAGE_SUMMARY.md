AI USAGE AND WORKFLOW SUMMARY DODGE AI GRAPH QUERY SYSTEM

HOW AI TOOLS WERE USED
The AI was used as a senior pair programmer and architectural consultant across the following areas:
Data Engineering for analyzing raw SAP O2C JSONL files to derive a relational schema and generating the better-sqlite3 ingestion pipeline.
Backend Development for implementing a 3-phase Text-to-SQL system in Next.js including complex JOIN logic across 9 tables.
Frontend Visualization for scaffolding the react-force-graph-2d implementation and refining the Canvas-based rendering for optimal performance.
DevOps for configuring the project for Render deployment and implementing environment variable validation.

KEY PROMPTS AND WORKFLOWS
The development followed a highly iterative prompt-based workflow:

Prompt Schema Derivation
Analyze the provided SAP O2C JSONL structure and generate a normalized SQLite schema in src/scripts/init_db.js that preserves all primary and foreign key relationships.
Outcome was a robust database initialization script with INSERT OR REPLACE logic.

Prompt Text-to-SQL Logic
Create an API route that injects the database schema into a system prompt and instructs the LLM to return strictly valid JSON containing a SELECT query for SAP data.
Outcome was implementation of src/app/api/chat/route.ts with schema injection and SQL generation.

Prompt Graph Integration
Integrate the chat results with the GraphView component. When the AI identifies a specific document like Sales Order highlight that node in the 2D force-directed graph automatically.
Outcome was dynamic filtering and highlighting between the chat and the graph visualization.

DEBUGGING AND ITERATION PATTERNS
AI was critical in diagnosing and fixing production-level issues:

Issue LLM Provider Connectivity
When the Gemini 1.5-flash API returned 404 errors in the hosted environment the AI suggested a multi-level fallback strategy.
Workflow was iteratively added DEBUG logging verified the error codes and implemented a tri-tier fallback gemini-1.5-flash to gemini-1.5-flash-latest to gemini-pro.

Issue API Key Mismatch
Diagnosed a conflict where a Groq key gsk was being used for an x.ai Grok endpoint.
Workflow was implemented a unified callLLM handler that dynamically detects the key type and routes the request to the correct inference engine.

UI Refinement
Iterated on Tailwind CSS classes for the ChatInterface.tsx to achieve a professional modern aesthetic that aligns with premium AI dashboard designs.
