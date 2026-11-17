/*
 * WebMCP polyfill — pinned to:
 *   WebMCP (W3C Web Machine Learning CG draft)
 *   revision 2026-11-13 — commit 4c7ed44
 *   https://webmachinelearning.github.io/webmcp/
 *
 * This file is a no-op when `document.modelContext.registerTool` exists.
 * It does not replace the native API; it only fills the gap in browsers
 * that do not expose it yet (Firefox stable, Safari stable, Chrome
 * without chrome://flags/#enable-webmcp-testing).
 */

(function () {
    'use strict';

    // Native detection first — zero code paths execute before this check.
    if (typeof document !== 'undefined'
        && document.modelContext
        && typeof document.modelContext.registerTool === 'function') {
        return;
    }

    var tools = new Map();

    function validateTool(tool) {
        if (!tool || typeof tool !== 'object') {
            throw new TypeError('Tool must be an object');
        }
        if (typeof tool.name !== 'string' || tool.name.length === 0) {
            throw new TypeError('Tool name must be a non-empty string');
        }
        if (typeof tool.description !== 'string' || tool.description.length === 0) {
            throw new TypeError('Tool description must be a non-empty string');
        }
        if (tool.inputSchema !== undefined
            && (tool.inputSchema === null || typeof tool.inputSchema !== 'object')) {
            throw new TypeError('Tool inputSchema must be an object');
        }
        if (typeof tool.execute !== 'function') {
            throw new TypeError('Tool execute must be a function');
        }
    }

    var modelContext = {
        registerTool: function (tool, options) {
            options = options || {};

            try {
                validateTool(tool);
            } catch (e) {
                return Promise.reject(e);
            }

            if (tools.has(tool.name)) {
                return Promise.reject(
                    new DOMException(
                        'A tool with this name is already registered',
                        'InvalidStateError'
                    )
                );
            }

            if (options.signal && options.signal.aborted) {
                // Already aborted → do not register.
                return Promise.resolve();
            }

            var entry = {
                name: tool.name,
                title: tool.title,
                description: tool.description,
                inputSchema: tool.inputSchema,
                execute: tool.execute
            };
            tools.set(tool.name, entry);

            if (options.signal) {
                options.signal.addEventListener('abort', function () {
                    tools.delete(tool.name);
                }, { once: true });
            }

            return Promise.resolve();
        },

        getTools: function (options) {
            options = options || {};
            var result = [];

            for (var entry of tools.values()) {
                result.push({
                    name: entry.name,
                    title: entry.title,
                    description: entry.description,
                    inputSchema: entry.inputSchema === undefined
                        ? undefined
                        : JSON.stringify(entry.inputSchema),
                    execute: entry.execute
                });
            }

            return Promise.resolve(result);
        },

        executeTool: function (tool, input, options) {
            options = options || {};

            var entry = tools.get(tool.name);
            if (!entry) {
                return Promise.reject(
                    new DOMException('Tool not found', 'NotFoundError')
                );
            }

            var controller = new AbortController();

            if (options.signal) {
                if (options.signal.aborted) {
                    return Promise.reject(
                        options.signal.reason
                            || new DOMException('Aborted', 'AbortError')
                    );
                }
                options.signal.addEventListener('abort', function () {
                    controller.abort(options.signal.reason);
                }, { once: true });
            }

            return Promise.resolve()
                .then(function () {
                    return entry.execute(input || {}, {
                        signal: controller.signal
                    });
                })
                .then(function (result) {
                    // Spec: executeTool resolves to a stringified result.
                    return JSON.stringify(result);
                });
        }
    };

    Object.defineProperty(document, 'modelContext', {
        value: modelContext,
        configurable: true,
        enumerable: false,
        writable: false
    });
})();