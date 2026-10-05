# Technical Notes

## Goal

Build a small but complete Trustant application that demonstrates independent use of the platform:

1. install Trustant from source
2. configure an AI provider
3. create an application from a standard starter
4. adapt the frontend and knowledge layer
5. verify the end-to-end chat flow
6. push the result to a standalone GitHub repository

The implementation deliberately reuses the starter architecture instead of replacing it.

## Starting point

Starter:

```
trustable-ai/truchat
```

Why this starter was selected:

- it already contains the Trustant/OpenServerless chat path
- it supports streaming responses
- it already has a simple RAG mechanism
- it keeps the demo focused on using Trustant rather than rebuilding infrastructure

## Main implementation changes

### Frontend

File:

```
src/pages/Index.tsx
```

Changes include:

- Siderall branding
- **Private AI Knowledge Assistant** subtitle
- **Knowledge Base** action replacing the generic RAG label
- **Private Knowledge Connected** status indicator
- suggested starter questions
- responsive spacing and message layout
- preserved Reset and stop-generation behavior

The existing streaming endpoint remains:

```
POST /stream/web/v1/chat
```

### Knowledge base

File:

```
packages/v1/chat/doc.jsonl
```

The generic starter content was replaced with a compact Siderall-oriented knowledge set covering:

- custom software development
- web applications
- business process automation
- AI integrations
- API and third-party integrations
- technical consulting

The system instruction explicitly prevents unsupported claims such as invented clients, certifications, financial figures, or guarantees.

### AI configuration

Runtime variables:

```env
AI_BASE_URL=
AI_API_KEY=
AI_CHAT_MODEL=
```

Demo configuration used during development:

```env
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=dummy
AI_CHAT_MODEL=gpt-oss:20b-cloud
```

The values belong in Trustant environment configuration and are not committed as secrets.

## Trustant/OpenServerless flow

At a high level:

```
React UI
   |
   | POST /stream/web/v1/chat
   v
OpenServerless chat action
   |
   | loads doc.jsonl
   | builds conversation context
   v
OpenAI-compatible endpoint
   |
   v
streamed response back to UI
```

This preserves the starter's intended architecture.

## Issues encountered and resolved

### 1. Lima VM first-boot timeout on Apple Silicon

Trustant's VM was created successfully, but the first boot exceeded Lima's startup wait while cloud-init was still completing rootless container tooling setup.

The VM itself was healthy.

Resolution:

- confirmed cloud-init and systemd state inside the VM
- identified the optional Lima containerd bootstrap as the long-running step
- disabled Lima's own containerd bootstrap in the generated VM configuration
- recreated the VM
- Trustant then completed startup successfully

### 2. Ollama Cloud catalog appeared empty

The UI initially reported:

```
Ollama model catalog is empty
```

The backend `/api/status` endpoint was checked directly and returned a valid Ollama catalog.

The issue was a stale page-level catalog state during the first provider-selection attempt.

Resolution:

- verified both Trustant's proxied status endpoint and the upstream catalog
- reloaded the provider-selection flow
- catalog became available normally

### 3. Default cloud model was outside free usage

Trustant selected:

```
glm-5.3:cloud
```

The Ollama account rejected that model because it was not included in free usage.

Resolution:

- tested an available catalog model directly
- confirmed `gpt-oss:20b-cloud` worked
- updated Trustant's Pi default to that model
- verified `/api/testmodel` returned success

### 4. GitHub push initially fell back to SSH

The first production-repository push failed with:

```
git@github.com: Permission denied (publickey)
```

Inspection of Trustant's GitHub status showed the device login was still in `connecting` state.

Resolution:

- completed the GitHub device authorization
- verified Trustant reported `authenticated: true`
- repeated the push
- Trustant used HTTPS and successfully created `main` on the destination repository

## Validation performed

The following behaviors were manually verified in Trustant:

- application launches
- frontend renders correctly
- AI model connection succeeds
- Knowledge Base content is accessible
- chat responses stream
- Siderall service questions are answered from the demo knowledge
- GitHub push succeeds over the managed HTTPS integration

## Why the scope is intentionally small

The requested deliverable was a **simple application built with Trustant**.

The demo therefore favors:

- reuse of platform primitives
- minimal custom code
- clear architecture
- readable documentation
- verifiable behavior

over adding production features that are not needed to demonstrate platform competence.

## Logical next steps

If the proof of concept were continued, the next useful improvements would be:

1. document upload and ingestion
2. persistent vector storage
3. source citations in answers
4. authentication and access control
5. environment-specific production configuration
6. automated integration tests for the complete deployed chat flow

These are deliberately not implemented in the current demo.
