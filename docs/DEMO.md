# Demo Walkthrough

This document is the shortest path for reviewing **Siderall Knowledge Desk**.

The demo is intentionally small. Its purpose is to show a complete Trustant workflow rather than to behave like a finished product.

## What to look at

The application demonstrates:

- a Trustant application created from the `truchat` starter
- a custom React interface
- a small RAG knowledge base
- streaming AI responses
- an OpenAI-compatible model endpoint
- Trustant/OpenServerless development flow
- a project that can be pushed to GitHub and continued independently

## Suggested 2-minute walkthrough

### 1. Open the application

The interface should show:

- **Siderall Knowledge Desk**
- subtitle **Private AI Knowledge Assistant**
- status **Private Knowledge Connected**
- **Reset**
- **Knowledge Base**
- three suggested questions

### 2. Inspect the knowledge base

Click **Knowledge Base**.

The assistant returns the knowledge currently injected into the RAG context.  
The demo knowledge is deliberately concise and business-oriented.

### 3. Ask a business question

Try:

> What services does Siderall provide?

Expected behavior:

- the answer streams progressively
- the answer is based on the knowledge base
- the assistant does not invent unsupported customers, certifications, figures, or guarantees

### 4. Try a suggested question

Examples:

> Summarize the key information available.

> What actions would you recommend based on this knowledge?

### 5. Reset

Click **Reset** to start a clean conversation.

## Expected result

The reviewer should be able to see that the original starter has been adapted into a coherent business use case while preserving the existing Trustant architecture.

## Intentional limits

This is a technical demo, not a production knowledge-management platform.

It intentionally does **not** include:

- authentication and user roles
- document upload
- vector-database ingestion UI
- persistence of chat history
- production monitoring
- advanced source attribution
- production deployment configuration

Those would be natural follow-up steps, but they were deliberately kept out of scope so the proof of concept remained simple, readable, and easy to verify.

## Repository map

- `src/pages/Index.tsx` — main user interface and chat flow
- `packages/v1/chat/chat.py` — chat action
- `packages/v1/chat/llm.py` — OpenAI-compatible model client
- `packages/v1/chat/doc.jsonl` — demo RAG knowledge
- `.env.dist` — required runtime variables
- `spec/` — original chat behavior specifications

For setup details, see the main [README](../README.md).  
For implementation decisions and troubleshooting notes, see [TECHNICAL-NOTES.md](./TECHNICAL-NOTES.md).
