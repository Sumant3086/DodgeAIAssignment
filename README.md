Dodge AI Graph Query System

Overview
This project processes a raw SAP Order-to-Cash dataset into an interactive Context Graph and features an LLM-powered chat interface to query relationships via Natural Language.

Architecture Decisions
• Framework: Built with Next.js (App Router) and React. This allows the backend API and frontend to live inside a single deployable artifact, reducing operational complexity.
• Graph Visualization: Uses react-force-graph-2d on an HTML5 canvas layer for highly performant relationship rendering capable of handling thousands of nodes in the browser natively.

Database Choice: SQLite (better-sqlite3)
Before initializing the graph, raw JSONL data is processed and inserted into a local SQLite database (sap-o2c.db). 

Why SQLite?
• Zero Configuration: No separate database servers are needed. The database is generated and queried natively in Node.js.
• Relational Graph Modeling: Complex SAP dependencies (e.g. SalesOrder -> Delivery -> Billing -> Journal) map flawlessly to relational tables. 

LLM Prompts & Strategy
We use Google Gemini 2.5 Flash (@google/genai). The strategy is a 3-phase Text-to-SQL Pipeline:
• Schema Injection: We provide the LLM exactly 9 core SAP tables and their primary and foreign keys in the system prompt.
• Translation: The user's Natural Language request is converted by the LLM strictly into a JSON containing sql and explanation.
• Execution & Final Synthesis: The Next.js backend intercepts the SQL, strictly validates it's a SELECT query, executes it locally via better-sqlite3, and then feeds the raw JSON query results back to the LLM. 

Guardrails
The system utilizes robust structural guardrails at the Prompt level:
• The system instructions strictly demand that off-topic queries MUST trigger a direct error JSON rejection.
• The Backend validates that error key. If present, it bypasses the database completely and serves the error message directly to the front-end chat interface.

Setup Instructions
• Install Dependencies: npm install
• Initialize Database: node src/scripts/init_db.js
• Configure Environment: Create a .env.local file and add GEMINI_API_KEY=your_key
• Run Development Server: npm run dev
• Access the App: Open http://localhost:3000

Session History & Walkthrough
Detailed documentation of the development process, visual refinements, and final verification can be found in the sessions directory:
• Project Walkthrough: A comprehensive look at the final implementation, layout fixes, and visual parity refinements.
• Verification Media: Screenshots and recordings of the system in action are stored in ./sessions/.

Features
• Interactive Graph: Full-bleed Canvas-based visualization of SAP Order-to-Cash flows.
• AI Context Query: Ask natural language questions about your business data and get technically grounded, SQL-backed answers.
• Visual Highlighting: Select nodes to focus on specific transaction paths with dynamic path highlighting.
• Layout Robustness: Responsive design that adapts to laptop and desktop resolutions without gaps.
