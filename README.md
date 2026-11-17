# Accessibility Bridge

> Symfony AI Hackathon 2026 — submission in progress.

Accessibility Bridge lets a Symfony application expose its **existing forms** as WebMCP tools to an **in-browser agent**, so that people who cannot reliably use a keyboard — motor impairments, tremor, paralysis, RSI, or temporary injuries — can fill and submit forms without typing.

## Why this matters

Typing is a hard prerequisite for almost every online form. People with motor impairments, tremor, paralysis, RSI, chronic pain, or temporary injuries (a broken wrist, post-surgery recovery) are disproportionately excluded from services that should be accessible to them. Accessibility Bridge removes that prerequisite: the form is filled by the user's own browser agent, under
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