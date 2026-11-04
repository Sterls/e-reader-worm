import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Dictionary } from '../public/js/logic/dictionary.js';
import { smallDict } from './helpers.js';

test('checks words, ignoring case', () => {
  assert.ok(smallDict.has('cat'));
  assert.ok(smallDict.has('CAT'));
  assert.ok(!smallDict.has('cta'));
});

test('prefix search', () => {
  assert.ok(smallDict.hasPrefix('gar'));
  assert.ok(smallDict.hasPrefix('q'));
  assert.ok(!smallDict.hasPrefix('xy'));
});

test('wildcard matching', () => {
  assert.equal(smallDict.match('c?t'), 'cat');
  assert.equal(smallDict.match('d?g?'), 'dogs');
  assert.equal(smallDict.match('zz?'), null);
  assert.equal(smallDict.match('ca'), null, 'too short');
});

test('fromText filters junk and short words', () => {
  const d = Dictionary.fromText('Hello\nab\nit\'s\nworld\r\n\nzebra');
  assert.deepEqual(d.words, ['hello', 'world', 'zebra']);
});

test('real word list loads and looks sensible', () => {
  const text = readFileSync(new URL('../public/words.txt', import.meta.url), 'utf8');
  const d = Dictionary.fromText(text);
  assert.ok(d.size > 150000);
  for (const w of ['word', 'puzzle', 'worm', 'reader', 'quiz', 'quest', 'garden']) assert.ok(d.has(w), w);
  for (const w of ['zzzq', 'xq', 'qwrt']) assert.ok(!d.has(w), w);
});
