# Siderall Knowledge Desk

A compact **Trustant** proof of concept built from the `trustable-ai/truchat` starter.

The goal is deliberately simple: take an existing Trustant starter, understand its workflow, adapt it into a coherent business use case, connect it to an AI model, verify the end-to-end flow, and leave the result easy to review and continue.

## What it demonstrates

- Trustant application workflow
- React + TypeScript frontend customization
- streaming AI chat
- a small RAG knowledge base
- OpenAI-compatible model integration
- Trustant/OpenServerless runtime integration
- environment-based AI configuration
- GitHub export through the Trustant workflow

## Demo application

**Siderall Knowledge Desk** is presented as a private AI knowledge assistant.

The interface includes:

- a **Knowledge Base** view
- **Private Knowledge Connected** status
- suggested starter questions
- streaming assistant responses
- Reset and stop-generation controls
- responsive desktop/mobile layout

The demo knowledge base covers:

1. custom software development
2. web application development
3. business process automation
4. AI integrations
5. API and third-party integrations
6. technical consulting

The assistant is instructed not to invent unsupported customers, certifications, financial figures, guarantees, or other claims.

## Architecture

```text
React frontend
      |
      | POST /stream/web/v1/chat
      v
OpenServerless chat action
      |
      | loads packages/v1/chat/doc.jsonl
      | builds conversation context
      v
OpenAI-compatible AI endpoint
      |
      v
streamed response to the UI
```

### Main files

```text
src/pages/Index.tsx
packages/v1/chat/chat.py
packages/v1/chat/llm.py
packages/v1/chat/doc.jsonl
.env.dist
```

## Environment

The application expects:

```env
AI_BASE_URL=
AI_API_KEY=
AI_CHAT_MODEL=
```

The development demo was validated with an Ollama/OpenAI-compatible endpoint using `gpt-oss:20b-cloud`.

Runtime values are configured through Trustant and are not committed as secrets.

## Run inside Trustant

1. Import or add this repository as an application.
2. Configure the three AI environment variables.
3. Launch the application in Development mode.
4. Open the application route.
5. Ask a question such as:

> What services does Siderall provide?

The answer should stream and use the curated knowledge base.

## Frontend development

```bash
npm install
npm run dev
```

Production frontend build:

```bash
npm run build
```

The complete chat flow requires the Trustant/OpenServerless backend.

## Validation

The following flow was manually verified:

- Trustant starts correctly
- application launches
- configured AI model responds
- Knowledge Base content is accessible
- streaming chat works
- Siderall business questions are answered from the demo knowledge
- repository can be pushed through Trustant's GitHub integration

## Documentation

- [Demo walkthrough](docs/DEMO.md)
- [Technical notes](docs/TECHNICAL-NOTES.md)

The technical notes document the main setup and integration issues encountered during the exercise and how they were resolved.

## Scope

This is intentionally a **small technical demo**, not a production knowledge-management product.

Authentication, document ingestion, persistent vector storage, source citations, monitoring, and production deployment configuration are intentionally left out of scope.

---

Built as a Trustant technical demo for Siderall GmbH.
