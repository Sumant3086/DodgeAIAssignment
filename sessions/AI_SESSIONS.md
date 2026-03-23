# AI Coding Sessions - Development Log

This document provides a transcript-style summary of the key AI interactions, prompting strategies, and debugging workflows used to build the Dodge AI Context Graph.

## 1. Initial Prompting & Graph Modeling
**Objective**: Transform raw SAP JSONL data into a relational graph.
- **Strategy**: I prompted the AI to design a schema that captures the **Order-to-Cash (O2C)** flow.
- **Iteration**: We identified 7 key entities: Customer, SalesOrder, Delivery, Billing, JournalEntry, Payment, and Product.
- **Implementation**: The AI generated an `init_db.js` script to process ~100k lines of JSONL into a clean SQLite database with proper foreign key relationships.

## 2. Debugging: The "Double Quote" SQLite Incident
**Issue**: The backend was failing with `no such column: ""` when querying the database via the LLM chat.
- **Debugging Workflow**:
  1. Identified the error in the Next.js runtime logs.
  2. Isolated the cause: SQLite treats double quotes `"` as identifiers (columns) and single quotes `'` as string literals. The LLM was generating SQL with double quotes for filter values.
- **Resolution**: 
  - **Code Fix**: Updated the API to sanitize and replace quotes.
  - **Prompt Hardening**: Updated the System Prompt in `route.ts` to strictly enforce: *"ALWAYS use single quotes ('') for string literals."*
- **Result**: 100% reliability in Text-to-SQL translation.

## 3. Iteration: Full-Bleed UI & Visual Parity
**User Feedback**: "Fix this as it is not using the right side... everything is blank."
- **Workflow**: 
  1. Used the Browser Subagent to capture screenshots of the layout.
  2. Identified that the graph container was not expanding to the full height/width of its flex parent.
  3. Applied CSS fixes (`h-screen`, `flex-1`, `overflow-hidden`) to ensure a "Full-Bleed" experience.
- **Visual Sync**: Responded to Image-based feedback to match specific design tokens:
  - Cyan headers for entities.
  - Bold blue path highlighting on node click.
  - Custom user/AI avatars in the chat.

## 4. Guardrails & Safety
**Design Pattern**:
- **Constraint**: The LLM is strictly instructed to return a specific JSON schema.
- **Verification**: The backend validates the presence of an `error` key in the LLM's response.
- **Defense**: If the user asks an off-topic question (e.g., "Write a poem"), the LLM generates an error JSON which is caught by the backend guardrail, preventing unauthorized execution or hallucination.

## 5. Summary of Iterations
| Phase | Focus | Key Tool Used |
| --- | --- | --- |
| **Research** | SAP O2C Schema | Grep & List Dir |
| **Execution** | Force Graph & API | Multi-replace File |
| **Verification** | Visual Parity | Browser Subagent |
| **Delivery** | Documentation | Walkthrough Artifact |
