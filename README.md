DODGE AI GRAPH QUERY SYSTEM

WORKING DEMO
https://dodgeaiassignment.onrender.com/

GITHUB REPOSITORY
https://github.com/Sumant3086/DodgeAIAssignment

OVERVIEW
This project processes a raw SAP Order to Cash dataset into an interactive Context Graph and features an LLM powered chat interface to query relationships via Natural Language.

ARCHITECTURE DECISIONS
• Framework Built with Next.js App Router and React. This allows the backend API and frontend to live inside a single deployable artifact reducing operational complexity.
• Graph Visualization Uses react force graph 2d on an HTML5 canvas layer for highly performant relationship rendering capable of handling thousands of nodes in the browser natively.

DATABASE CHOICE SQLITE BETTER-SQLITE3
Before initializing the graph raw JSONL data is processed and inserted into a local SQLite database sap o2c.db.

WHY SQLITE
• Zero Configuration No separate database servers are needed. The database is generated and queried natively in Node.js.
• Relational Graph Modeling Complex SAP dependencies map flawlessly to relational tables.

LLM STRATEGY DUAL PROVIDER GROQ AND GEMINI
To ensure maximum reliability and speed the system implements a dual LLM strategy:
• Primary Provider Groq Llama 3.3-70b. Used for its extreme inference speed and structured JSON performance.
• Fallback Provider Google Gemini 1.5 Flash. Automatically triggered if Groq fails or rate limits are reached.
• Model Fallback Within the Gemini flow the system handles 404 Not Found errors by dynamically switching between gemini 1.5-flash and the stable gemini-pro.

3-PHASE TEXT-TO-SQL PIPELINE
• Schema Injection We provide the LLM exactly 9 core SAP tables and their primary and foreign keys in the system prompt.
• Translation The user's Natural Language request is converted strictly into a JSON containing sql and explanation.
• Execution and Final Synthesis The Next.js backend executes the SQL locally via better-sqlite3 and feeds the raw results back to the LLM for a natural language summary.

GUARDRAILS
The system utilizes robust structural guardrails at the Prompt level:
• The system instructions strictly demand that off-topic queries MUST trigger a direct error JSON rejection.
• The Backend validates that error key. If present it bypasses the database completely and serves the error message directly to the front-end chat interface.

SETUP INSTRUCTIONS
• Install Dependencies npm install
• Initialize Database node src/scripts/init_db.js
• Configure Environment Create a .env.local file and add GEMINI_API_KEY and GROK_API_KEY
• Run Development Server npm run dev
• Access the App Open http://localhost:3000

SESSION HISTORY AND WALKTHROUGH
Detailed documentation of the development process visual refinements and final verification can be found in the sessions directory:
• Project Walkthrough A comprehensive look at the final implementation layout fixes and visual parity refinements.
• Verification Media Screenshots and recordings of the system in action are stored in the sessions folder.

EXAMPLE QUERIES
You can interact with the system using natural language. For best results include specific IDs like Sales Order 740506.

• Simple Lookup Who is the customer for order 740518?
• Process Trace Show me the delivery and billing details for sales order 740506.
• Financial Insights What is the total amount for all billing documents?
• Guardrail Test Ask it to write a poem or a recipe.

PROMPTING FORMAT
There is no strict format required. The system is designed to handle conversational English but including exact IDs and entity names like Customer Sales Order and Billing will result in higher precision.
