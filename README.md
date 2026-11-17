# Accessibility Bridge — WebMCP Bundle

> Part of the [Accessibility Bridge](https://github.com/<votre-username>/accessibility-bridge) project, submitted to the Symfony AI Hackathon 2026.

Accessibility Bridge lets a Symfony application expose its **existing forms** as WebMCP tools to an **in-browser agent**, so that people who cannot reliably use a keyboard — motor impairments, tremor, paralysis, RSI, or temporary injuries — can fill and submit forms without typing.

## Why this matters

Typing is a hard prerequisite for almost every online form. People with motor impairments, chronic pain, or temporary injuries (a broken wrist, post-surgery recovery) are disproportionately excluded from services that should be accessible to them. Accessibility Bridge removes that prerequisite: the form is filled by the user's own browser agent, under
their control, on the page they are already viewing. No keyboard, no handoff, no third-party client.

## Positioning

Unlike FormBridge, which is a Node.js MCP server that lets a developer's MCP client pre-fill standalone intake forms and then hands off to a human via a resume link, this bundle exposes **existing Symfony forms** directly to the **end user's own browser agent**, so the person filling the form never leaves the page and never needs a keyboard.


## How it works

1. A Symfony `FormType` is annotated with `#[AsWebMcpForm]`.
2. The bundle derives a WebMCP tool descriptor from the form's structure.
3. A small JavaScript bridge — with a polyfill for browsers that do not
   expose the native API yet — registers the tools in the user's browser
   agent.
4. The agent proposes a form completion; the human confirms before
   submission.
5. High-consequence actions carry a `consequentialHint` in their tool
   metadata.


## Specification

This bundle targets the **WebMCP** draft published by the
[W3C Web Machine Learning Community Group](https://www.w3.org/community/webmachinelearning/),
revision **2026-11-13** (commit `4c7ed44`).

Canonical URL: https://webmachinelearning.github.io/webmcp/

> This specification is a Draft Community Group Report. It is not a W3C
> Standard and is not on the W3C Standards Track. The API may change
> without notice. The bundled polyfill is pinned to the revision above
> and is a no-op when the native API is present.

## Prerequisites

- PHP 8.2+
- Symfony 7.x
- A browser that supports WebMCP natively (Chrome with
  `chrome://flags/#enable-webmcp-testing` enabled), **or** any modern
  browser with the bundled polyfill (Firefox stable, Safari stable,
  Chrome without the flag).

## Demo mode

- `polyfill` *(default)* — uses the bundled `polyfill.js`. Works in
  every stable browser, no flag required.
- `native` — bypasses the polyfill and calls
  `document.modelContext` directly. Requires Chrome with the WebMCP
  flag enabled.

## Quickstart

Coming with `v0.1.0`. A one-command demo (`composer install && symfony
serve`) will be documented here once the demo application ships.


## Stack

- **Server**: PHP 8.2+, Symfony 7.x
- **AI orchestration**: `symfony/mcp-bundle`, `symfony/ai-agent`
- **Browser bridge**: WebMCP — W3C Web Machine Learning CG draft
- **Frontend demo**: Twig

## Status

Under active development for the Symfony AI Hackathon 2026. The repository
will be populated with the bundle scaffold and a demo application in the
coming days.

## License

MIT — see [LICENSE](./LICENSE).