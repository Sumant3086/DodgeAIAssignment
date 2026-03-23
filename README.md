# Dodge AI Graph Query System

## Overview
This project processes a raw SAP Order-to-Cash dataset into an interactive **Context Graph** and features an **LLM-powered chat interface** to query relationships via Natural Language.

## Architecture Decisions
- **Framework**: Built with **Next.js (App Router)** and **React**. This allows the backend API and frontend to live inside a single deployable artifact, reducing operational complexity.
- **Graph Visualization**: Uses `react-force-graph-2d` on an HTML5 canvas layer for highly performant relationship rendering capable of handling thousands of nodes in the browser natively.

## Database Choice: SQLite (better-sqlite3)
Before initializing the graph, raw JSONL data is processed and inserted into a local **SQLite** database (`sap-o2c.db`). 
**Why SQLite?**
1. **Zero Configuration**: No separate database servers are needed. The database is generated and queried natively in Node.js.
2. **Relational Graph Modeling**: Complex SAP dependencies (e.g. SalesOrder -> Delivery -> Billing -> Journal) map flawlessly to relational tables. A graph database (Neo4j) would be overkill here when table joins provide identical capability at O(1) operational overhead.

## LLM Prompts & Strategy
We use **Google Gemini 2.5 Flash** (`@google/genai`). The strategy is a 3-phase **Text-to-SQL Pipeline**:
1. **Schema Injection**: We provide the LLM exactly 9 core SAP tables and their primary and foreign keys in the system prompt.
2. **Translation**: The user's Natural Language request is converted by the LLM strictly into a JSON containing `{"sql": "SELECT...", "explanation": "..."}`.
3. **Execution & Final Synthesis**: The Next.js backend intercepts the SQL, strictly validates it's a `SELECT` query, executes it locally via `better-sqlite3`, and then feeds the raw JSON query results back to the LLM. The LLM then generates a final natural-language response mathematically grounded in the actual database output.

## Guardrails
The system utilizes robust structural guardrails at the Prompt level:
- The system instructions strictly demand that off-topic queries (creative writing, external facts) MUST trigger a direct `{"error": "This system is designed to answer questions related to the provided dataset only."}` JSON rejection.
- The Backend validates that `error` key. If present, it bypasses the database completely and serves the error message directly to the front-end chat interface, physically preventing prompt injection or hallucination.

## Setup Instructions
1. **Install Dependencies**: 
   ```bash
   npm install
   ```
2. **Initialize Database**: The project comes with a sample database, but you can re-initialize it from the raw JSONL data:
   ```bash
   node src/scripts/init_db.js
   ```
3. **Configure Environment**: Create a `.env.local` file in the root directory and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Run Development Server**: 
   ```bash
   npm run dev
   ```
5. **Access the App**: Open [http://localhost:3000](http://localhost:3000)

## Session History & Walkthrough
Detailed documentation of the development process, visual refinements, and final verification can be found in the **sessions** directory:
- [**Project Walkthrough**](./sessions/walkthrough.md): A comprehensive look at the final implementation, layout fixes, and visual parity refinements.
- **Verification Media**: Screenshots and recordings of the system in action are stored in `./sessions/`.

## Features
- **Interactive Graph**: Full-bleed Canvas-based visualization of SAP Order-to-Cash flows.
- **AI Context Query**: Ask natural language questions about your business data and get technically grounded, SQL-backed answers.
- **Visual Highlighting**: Select nodes to focus on specific transaction paths with dynamic path highlighting.
- **Layout Robustness**: Responsive design that adapts to laptop and desktop resolutions without gaps.
