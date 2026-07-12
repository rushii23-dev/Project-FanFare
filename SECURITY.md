# Security Policy

## Reporting a vulnerability

If you find a security issue in FanFare, please email **rushipvt23@gmail.com**
with a description and reproduction steps. You'll get a response within 48
hours. Please don't open a public issue for security problems — give us a
chance to fix it first.

## What's in scope

- The deployed app and its `/api/ai` serverless endpoint
- Any way to extract the server-side `GEMINI_API_KEY`
- Any way to bypass the rate limiting or prompt-size caps
- XSS, injection, or CSP bypass on any screen

## Security design, in brief

| Layer | Measure |
|---|---|
| Secrets | The Gemini key exists only in the serverless function's environment. It is never `VITE_`-prefixed, so the build tool cannot inline it into the client bundle. CI greps every build for credential-shaped strings and fails if one appears. |
| Transport | HSTS (2 years, subdomains included). |
| Content | Strict CSP — scripts self-only, every external API individually allowlisted, `frame-ancestors 'none'`. |
| Abuse | Per-IP rate limiting and a server-side prompt-size cap on the AI endpoint. |
| Error handling | Upstream error bodies are scrubbed of the API key before anything reaches a client. |
| AI safety | System prompts forbid the model from inventing venue facts (gates, seats, rooms, policies); everything it states is grounded in the context we hand it. |

## Supported versions

This is a hackathon project; only the latest `main` is supported.
