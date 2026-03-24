AI CODING SESSION LOG DODGE AI GRAPH QUERY SYSTEM

SESSION OVERVIEW
This log documents the iterative development of the Dodge AI Graph Query System focusing on the collaboration between the developer and the AI agent.

KEY PROMPTS AND WORKFLOWS

PROJECT INITIALIZATION AND DATA PROCESSING
• Prompt Analyze the SAP O2C data in the sap-o2c-data directory and initialize a SQLite database with appropriate schemas.
• Workflow The AI analyzed JSONL files mapped primary and foreign keys and generated a robust init_db.js script to handle data ingestion with better-sqlite3.

GRAPH VISUALIZATION IMPLEMENTATION
• Prompt Implement a performant force-directed graph using react-force-graph-2d to visualize relationships between Customers Sales Orders Deliveries and Payments.
• Workflow Created GraphView.tsx with a custom node link generation pipeline that dynamically pulls and limits data from the SQLite backend to ensure smooth 60FPS rendering.

LLM POWERED CHAT TEXT-TO-SQL
• Prompt Build an LLM powered chat interface that converts natural language into SQL queries for my SAP database.
• Workflow Developed a 3-phase pipeline in src/app/api/chat/route.ts:
• Phase 1 Schema Injection Injecting the database schema into the LLM system prompt.
• Phase 2 Translation Formatting prompts to ensure the LLM returns valid JSON with SQL and explanations.
• Phase 3 Self-Correction Implemented guardrails to reject off-topic queries and validate SQL safety.

DEBUGGING AND ITERATION PATTERNS

GEMINI 404 ERROR DEBUGGING
• Scenario During deployment the Gemini API returned a 404 error for the gemini 1.5-flash model in the v1beta endpoint.
• Iteration Tried fallback to gemini 1.5-flash-latest implemented a robust fallback to gemini-pro and added DEBUG logging to trace the exact failure point in the hosted environment.

GROQ VS GROK KEY MISMATCH
• Scenario The application failed when provided with a Groq key starting with gsk while targeting the x.ai Grok endpoint.
• Fix Implemented automatic key detection. The system now seamlessly switches between Groq Llama-3.3 and Gemini based on the available environment variables significantly increasing system reliability.

UI ALIGNMENT AND VISUAL PARITY
• Scenario The chat interface bubble alignment was inconsistent.
• Iteration Refined CSS classes in ChatInterface.tsx to ensure distinct visual separation between User and Assistant messages using standard Tailwind principles.

SUMMARY OF DECISIONS
• Architecture Chose Next.js for a unified frontend backend stack.
• Database Chose better-sqlite3 for local persistence and zero-config deployment.
• Reliability Implemented a Dual-LLM Strategy Groq and Gemini to ensure the system is always responsive even during provider outages.
