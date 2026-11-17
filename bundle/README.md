# Accessibility Bridge — WebMCP Bundle

> Part of the [Accessibility Bridge](https://github.com/payene/accessibility-bridge) project, submitted to the Symfony AI Hackathon 2026.

Expose existing Symfony forms as WebMCP tools to the end user's browser agent, for keyboard-free form completion.

## Why this matters

Typing is a hard prerequisite for almost every online form. People with motor impairments, tremor, paralysis, RSI, chronic pain, or temporary injuries are disproportionately excluded from services that should be accessible to them. Accessibility Bridge removes that prerequisite: the form is filled by the user's own browser agent, under their control, on the page they are already viewing — no keyboard, no handoff, no third-party client.

## Positioning

Unlike FormBridge, which is a Node.js MCP server that lets a developer's MCP client pre-fill standalone intake forms and then hands off to a human via a resume link, this bundle exposes **existing Symfony forms** directly to the **end user's own browser agent**, so the person filling the form never leaves the page and never needs a keyboard.

## Specification

This bundle targets the **WebMCP** draft published by the
[W3C Web Machine Learning Community Group](https://www.w3.org/community/webmachinelearning/),
pinned to `revision 2026-11-13` (commit `4c7ed44`).

Canonical URL: https://webmachinelearning.github.io/webmcp/

> This specification is a Draft Community Group Report. It is not a W3C
> Standard and is not on the W3C Standards Track. The API may change
> without notice. The bundled polyfill is pinned to the revision above
> and is a no-op when the native API is present.

## Prerequisites

- PHP 8.2+
- Symfony 7.x
- A browser that supports WebMCP natively (Chrome with `chrome://flags/#enable-webmcp-testing` enabled), **or** any modern browser with the bundled polyfill (Firefox stable, Safari stable, Chrome without the flag).

## Installation

```bash
composer require accessibility-bridge/webmcp-bundle