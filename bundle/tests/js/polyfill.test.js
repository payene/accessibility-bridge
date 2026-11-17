'use strict';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const POLYFILL_PATH = path.resolve(
    __dirname,
    '../../src/Resources/assets/polyfill.js'
);
const POLYFILL_SOURCE = fs.readFileSync(POLYFILL_PATH, 'utf8');

function createSandbox() {
    const sandbox = {
        document: {},
        DOMException: DOMException,
        AbortController: AbortController,
        Map: Map,
        Promise: Promise,
        TypeError: TypeError,
        JSON: JSON,
        console: console
    };
    vm.createContext(sandbox);
    return sandbox;
}

function loadPolyfill(sandbox) {
    vm.runInContext(POLYFILL_SOURCE, sandbox);
    return sandbox.document.modelContext;
}

// 1. No-op when native API already exists.
test('no-op when native document.modelContext.registerTool exists', () => {
    const sandbox = createSandbox();
    const native = {
        registerTool: function () {},
        getTools: function () {},
        executeTool: function () {}
    };
    sandbox.document.modelContext = native;

    loadPolyfill(sandbox);

    assert.strictEqual(sandbox.document.modelContext, native,
        'Native modelContext must not be replaced');
    assert.strictEqual(
        sandbox.document.modelContext.registerTool,
        native.registerTool
    );
});

beforeEach(() => {
    // Each test gets a fresh sandbox via helper below.
});

// Helper to get a fresh polyfilled modelContext.
function freshModelContext() {
    const sandbox = createSandbox();
    return loadPolyfill(sandbox);
}

// 2. registerTool rejects invalid arguments.
test('registerTool rejects empty name', async () => {
    const mc = freshModelContext();
    await assert.rejects(
        () => mc.registerTool({ name: '', description: 'd', execute: async () => {} }),
        /name/
    );
});

test('registerTool rejects empty description', async () => {
    const mc = freshModelContext();
    await assert.rejects(
        () => mc.registerTool({ name: 'n', description: '', execute: async () => {} }),
        /description/
    );
});

test('registerTool rejects non-object inputSchema', async () => {
    const mc = freshModelContext();
    await assert.rejects(
        () => mc.registerTool({
            name: 'n',
            description: 'd',
            inputSchema: 'not-an-object',
            execute: async () => {}
        }),
        /inputSchema/
    );
});

test('registerTool rejects duplicate name', async () => {
    const mc = freshModelContext();
    const tool = { name: 'dup', description: 'd', execute: async () => {} };
    await mc.registerTool(tool);
    await assert.rejects(() => mc.registerTool(tool), /already registered/);
});

// 3. Valid tool is returned by getTools.
test('registerTool accepts a valid tool and getTools returns it', async () => {
    const mc = freshModelContext();
    const execute = async () => ({ ok: true });
    await mc.registerTool({
        name: 'valid',
        title: 'Valid',
        description: 'A valid tool',
        inputSchema: { type: 'object' },
        execute: execute
    });

    const tools = await mc.getTools();
    assert.strictEqual(tools.length, 1);
    assert.strictEqual(tools[0].name, 'valid');
    assert.strictEqual(tools[0].description, 'A valid tool');
    assert.strictEqual(tools[0].inputSchema, '{"type":"object"}');
    assert.strictEqual(tools[0].execute, execute);
});

// 4. Aborting options.signal removes the tool.
test('aborting options.signal unregisters the tool', async () => {
    const mc = freshModelContext();
    const ac = new AbortController();

    await mc.registerTool(
        { name: 'temp', description: 'temporary', execute: async () => {} },
        { signal: ac.signal }
    );

    let tools = await mc.getTools();
    assert.strictEqual(tools.length, 1);

    ac.abort();

    tools = await mc.getTools();
    assert.strictEqual(tools.length, 0);
});

// 5. executeTool calls tool.execute(input, { signal }) and propagates result.
test('executeTool invokes execute with per-call AbortSignal and stringifies result', async () => {
    const mc = freshModelContext();
    let receivedInput;
    let receivedSignal;
    let receivedOptions;

    const toolDef = {
        name: 'echo',
        description: 'Echo tool',
        inputSchema: { type: 'object' },
        execute: async (input, options) => {
            receivedInput = input;
            receivedOptions = options;
            receivedSignal = options.signal;
            return { echoed: input.message };
        }
    };

    await mc.registerTool(toolDef);
    const tools = await mc.getTools();
    const registered = tools[0];

    const result = await mc.executeTool(registered, { message: 'hello' });

    assert.deepStrictEqual(receivedInput, { message: 'hello' });
    assert.ok(receivedSignal instanceof AbortSignal,
        'execute must receive an AbortSignal');
    assert.ok(receivedOptions && receivedOptions.signal === receivedSignal,
        'execute must receive { signal }');
    assert.strictEqual(result, '{"echoed":"hello"}');
});

// 6. Static check: forbidden identifiers are absent from polyfill.js.
test('polyfill.js contains no unregisterTool reference', () => {
    assert.strictEqual(
        POLYFILL_SOURCE.includes('unregisterTool'),
        false,
        'polyfill.js must not reference unregisterTool'
    );
});

test('polyfill.js contains no consequentialHint reference', () => {
    assert.strictEqual(
        POLYFILL_SOURCE.includes('consequentialHint'),
        false,
        'polyfill.js must not reference consequentialHint'
    );
});