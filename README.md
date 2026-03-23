# Dodge AI Graph Query System

## Overview
This project processes a raw SAP Order-to-Cash dataset into an interactive **Context Graph** and features an **LLM-powered chat interface** to query relationships via Natural Language.

## Architecture Decisions
- **Framework**: Built with **Next.js (App Router)** and **React**. This allows the backend API and frontend to live inside a single deployable artifact, reducing operational complexity.
- **Graph Visualization**: Uses \`react-force-graph-2d\` on an HTML5 canvas layer for highly performant relationship rendering capable of handling thousands of nodes in the browser natively.

## Database Choice: SQLite (better-sqlite3)
Before initializing the graph, raw JSONL data is processed and inserted into a local **SQLite** database (\`sap-o2c.db\`). 
**Why SQLite?**
1. **Zero Configuration**: No separate database servers are needed. The database is generated and queried natively in Node.js.
2. **Relational Graph Modeling**: Complex SAP dependencies (e.g. SalesOrder -> Delivery -> Billing -> Journal) map flawlessly to relational tables. A graph database (Neo4j) would be overkill here when table joins provide identical capability at O(1) operational overhead.

## LLM Prompts & Strategy
We use **Google Gemini 2.5 Flash** (\`@google/genai\`). The strategy is a 3-phase **Text-to-SQL Pipeline**:
1. **Schema Injection**: We provide the LLM exactly 9 core SAP tables and their primary and foreign keys in the system prompt.
2. **Translation**: The user's Natural Language request is converted by the LLM strictly into a JSON containing \`{"sql": "SELECT...", "explanation": "..."}\`.
3. **Execution & Final Synthesis**: The Next.js backend intercepts the SQL, strictly validates it's a \`SELECT\` query, executes it locally via \`better-sqlite3\`, and then feeds the raw JSON query results back to the LLM. The LLM then generates a final natural-language response mathematically grounded in the actual database output.

## Guardrails
The system utilizes robust structural guardrails at the Prompt level:
- The system instructions strictly demand that off-topic queries (creative writing, external facts) MUST trigger a direct \`{"error": "This system is designed to answer questions related to the provided dataset only."}\` JSON rejection.
- The Backend validates that \`error\` key. If present, it bypasses the database completely and serves the error message directly to the front-end chat interface, physically preventing prompt injection or hallucination.

## Setup Instructions
1. Install dependencies: \`npm install\`
2. (Optional) Initialize Database natively: \`node src/scripts/init_db.js\`
3. Set your API Key: Create a \`.env.local\` file in the root directory and add:
   \`\`\`
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`
4. Run Development Server: \`npm run dev\`
5. Open [http://localhost:3000](http://localhost:3000)

## Features
- **Interactive Graph**: Pan, zoom, and inspect nodes ranging from Customers to Journal Entries.
- **Data-Backed Answers**: Ask complex flow questions (e.g. "Trace sales order 740506") and receive factually backed data responses.
- **Micro-commits**: Development history is extensively logged in \`HISTORY.md\` and Git commits for full traceability.
