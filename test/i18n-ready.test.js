// project.js y projects.js esperan a I18n.whenReady() antes de pintar, para
// no enseñar claves como "project.back" mientras llega el diccionario. La
// señal tiene que llegar también cuando el diccionario no carga.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'i18n.js'), 'utf8');

function boot(fetchImpl) {
  const listeners = {};
  const document = {
    documentElement: { lang: '' },
    head: { appendChild() {} },
    addEventListener: (type, fn) => (listeners[type] = listeners[type] || []).push(fn),
    dispatchEvent: (e) => (listeners[e.type] || []).forEach((fn) => fn(e)),
    querySelectorAll: () => [],
    createElement: () => ({}),
  };
  const ctx = {
    document,
    window: { location: { href: 'http://x/', search: '' } },
    localStorage: { getItem: () => null, setItem() {} },
    navigator: { language: 'es' },
    fetch: fetchImpl,
    URL, URLSearchParams, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    console: { error() {} },
  };
  vm.runInNewContext(src, ctx);
  return { I18n: ctx.window.I18n, start: () => listeners.DOMContentLoaded.forEach((fn) => fn()) };
}

const within = (promise, ms = 500) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('whenReady nunca se resolvió')), ms))]);

test('whenReady se resuelve cuando el diccionario cargó', async () => {
  const { I18n, start } = boot(async () => ({ ok: true, json: async () => ({ 'a.b': 'hola' }) }));
  const waiting = I18n.whenReady();
  start();
  await within(waiting);
  assert.strictEqual(I18n.t('a.b'), 'hola');
  await within(I18n.whenReady()); // ya listo: se resuelve al instante
});

test('whenReady se resuelve aunque el diccionario no cargue', async () => {
  const { I18n, start } = boot(async () => ({ ok: false }));
  start();
  await within(I18n.whenReady());
  assert.strictEqual(I18n.ready, true);
});
